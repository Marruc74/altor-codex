#!/usr/bin/env node
/**
 * Altor Pin Editor — dev tool for src/data/locations.js
 * Usage:  node tools/pin-editor.js
 * Then open  http://localhost:4444
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.join(__dirname, '..');
const LOCATIONS   = path.join(ROOT, 'src/data/locations.js');
const TILES_DIR   = path.join(ROOT, 'public/tiles');
const HTML_FILE   = path.join(__dirname, 'pin-editor.html');
const PORT        = 4444;

// ── Data ────────────────────────────────────────────────────────────────────

function readPins() {
  const text = fs.readFileSync(LOCATIONS, 'utf8');
  const match = text.match(/export const pins = (\[[\s\S]*\]);/);
  if (!match) throw new Error('Could not parse pins array in locations.js');
  return new Function('return ' + match[1])(); // eslint-disable-line no-new-func
}

const TYPE_ORDER = [
  'continent', 'country', 'region', 'mountain', 'forest',
  'water', 'site', 'capital', 'city', 'ruin', 'dungeon', 'shrine',
];

const TYPE_LABELS = {
  continent: 'Continents', country: 'Countries', region: 'Regions',
  mountain: 'Mountains',   forest: 'Forests',    water: 'Water',
  site: 'Sites',           capital: 'Capitals',  city: 'Cities',
  ruin: 'Ruins',           dungeon: 'Dungeons',  shrine: 'Shrines',
};

function formatPin(pin) {
  const id   = ('id: "' + pin.id + '",').padEnd(36);
  const name = ('name: "' + pin.name + '",').padEnd(36);
  const type = ('type: "' + pin.type + '",').padEnd(22);
  const cont = pin.continent ? ('continent: "' + pin.continent + '",').padEnd(26) + ' ' : '';
  const tag  = 'tagline: "' + (pin.tagline || '') + '", ';
  return '  { ' + id + ' ' + name + ' ' + type + ' ' + cont + tag + 'x: ' + pin.x + ', y: ' + pin.y + ' },';
}

function writePins(pins) {
  const grouped = new Map(TYPE_ORDER.map(t => [t, []]));
  for (const pin of pins) {
    if (!grouped.has(pin.type)) grouped.set(pin.type, []);
    grouped.get(pin.type).push(pin);
  }

  const lines = [
    '// Coordinates scaled from old map (3248×2200) to new map (6144×4096).',
    '// Scale X = 6144/3248 ≈ 1.8916, Scale Y = 4096/2200 ≈ 1.8618',
    '',
    'export const pins = [',
  ];

  for (const [type, group] of grouped) {
    if (!group.length) continue;
    lines.push('  // ' + (TYPE_LABELS[type] ?? type));
    for (const pin of group) lines.push(formatPin(pin));
  }
  lines.push('];', '');
  fs.writeFileSync(LOCATIONS, lines.join('\n'), 'utf8');
}

// ── Server ───────────────────────────────────────────────────────────────────

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.html': 'text/html; charset=utf-8' };

function send(res, status, contentType, body) {
  res.writeHead(status, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
  res.end(body);
}

function json(res, status, data) {
  send(res, status, 'application/json', JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/') {
    try {
      send(res, 200, 'text/html; charset=utf-8', fs.readFileSync(HTML_FILE));
    } catch {
      send(res, 500, 'text/plain', 'Could not read pin-editor.html');
    }
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/tiles/')) {
    const file = path.join(TILES_DIR, url.pathname.slice(7));
    try {
      const ext = path.extname(file);
      send(res, 200, MIME[ext] ?? 'application/octet-stream', fs.readFileSync(file));
    } catch {
      send(res, 404, 'text/plain', 'Not found');
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/pins') {
    try { json(res, 200, readPins()); }
    catch (e) { json(res, 500, { error: e.message }); }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/pins') {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      try {
        writePins(JSON.parse(body));
        json(res, 200, { ok: true });
      } catch (e) {
        json(res, 400, { error: e.message });
      }
    });
    return;
  }

  send(res, 404, 'text/plain', 'Not found');
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✦ Altor Pin Editor');
  console.log('  → http://localhost:' + PORT);
  console.log('');
});
