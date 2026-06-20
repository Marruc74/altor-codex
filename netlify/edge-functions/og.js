// Open Graph for shared deep links. The site is a client-rendered SPA, so a
// link like https://site/?ce=<id>#catalog serves the same static index.html to
// every crawler - Discord/Slack/X see only the generic site title. This edge
// function runs on the root request, looks the page up in /og-index.json
// (built by scripts/generate-og-index.mjs), and rewrites the <title> and the
// OG/Twitter/canonical tags so the unfurl shows the actual page.
//
// Only runs on "/" (where the shareable params live); other paths and assets
// are untouched. Real browsers still get the same HTML - the SPA reads the
// query params and renders the page as before.

// Order matters: the most specific param wins if several are present.
const PARAM_ORDER = ["ce", "entry", "country", "adventure", "pin"];

let OG_INDEX = null;

function keyFromParams(sp) {
  for (const p of PARAM_ORDER) {
    const v = sp.get(p);
    if (v) return `${p}:${v}`;
  }
  return null;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function injectMeta(html, meta, pageUrl) {
  const title = esc(meta.title);
  const desc = esc(meta.description);
  const image = esc(meta.image);
  const url = esc(pageUrl);
  const subs = [
    [/(<title>)[\s\S]*?(<\/title>)/, `$1${title}$2`],
    [/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`],
    [/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`],
    [/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`],
    [/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`],
    [/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`],
    [/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`],
    [/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`],
    [/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`],
    [/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`],
  ];
  for (const [re, rep] of subs) html = html.replace(re, rep);
  return html;
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const key = keyFromParams(url.searchParams);
  if (!key) return; // no shareable param → serve the default page untouched

  const res = await context.next();
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return res;

  if (!OG_INDEX) {
    try {
      const r = await fetch(new URL("/og-index.json", url.origin));
      OG_INDEX = r.ok ? await r.json() : {};
    } catch {
      OG_INDEX = {};
    }
  }

  const meta = OG_INDEX[key];
  if (!meta) return res;

  const html = await res.text();
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  return new Response(injectMeta(html, meta, url.href), { status: res.status, headers });
}

export const config = { path: "/" };
