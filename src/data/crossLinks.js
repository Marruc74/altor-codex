import { videos } from "./videoData";
import { pins } from "./locations";

// Sections whose video names are expected to match map pin names
const LOCATION_SECTIONS = new Set(["countries", "geography"]);

const norm = (s) => s.toLowerCase().trim();

// Build name → videos[] index for location-related videos
const byName = {};
for (const video of videos) {
  if (!LOCATION_SECTIONS.has(video.section)) continue;
  const key = norm(video.name);
  (byName[key] = byName[key] || []).push(video);
}

// pinId → Video[]
export const videosForPin = {};
for (const pin of pins) {
  const matched = byName[norm(pin.name)];
  if (matched?.length) videosForPin[pin.id] = matched;
}

// Attach "Countries <Parent>: <Place>" videos to their parent country's page.
// The parent name is the video's group, so e.g. "Countries Erebos: Tolokfe"
// surfaces on the Erebos page even though "Tolokfe" doesn't match the Erebos
// pin. Only country-type parents are linked (continents like Soluna group
// sub-countries that already appear on their own in the geography tree).
const countryPinByName = {};
for (const pin of pins) {
  if (pin.type === "country") countryPinByName[norm(pin.name)] = pin;
}
for (const video of videos) {
  if (video.section !== "countries" || !video.group) continue;
  const parent = countryPinByName[norm(video.group)];
  if (!parent) continue;
  const list = (videosForPin[parent.id] = videosForPin[parent.id] ?? []);
  if (!list.some((v) => v.id === video.id)) list.push(video);
}

// videoId → Pin
export const pinForVideo = {};
for (const [pinId, vids] of Object.entries(videosForPin)) {
  const pin = pins.find((p) => p.id === pinId);
  for (const v of vids) {
    pinForVideo[v.id] = pin;
  }
}

// videoId → related videoIds, rendered as "Related Videos" on a video's own
// entry page (EntryDetail). Surfaces sub-topic shorts on the relevant entry —
// e.g. the "Cities beneath ground" short on the Cave Elf page.
export const relatedVideosByVideo = {
  "FKDZSw_-OZA": ["SPxoPRwTtDY"], // Cave Elf  → Cities beneath ground
  "iTm3fYGSZvE": ["QA00fO4mqNU"], // Grey Elf  → Floating Islands
  "Nn1ovh3x5p0": ["pf3G1J3vqWI"], // High Elf  → White Towers
  "BivRfLT_V5w": ["6JVP0Wpgd20", "DtWxUp5GMEk"], // Dark Elf  → Fortress, Brothers of Darkness
};
