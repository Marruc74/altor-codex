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

// videoId → Pin
export const pinForVideo = {};
for (const [pinId, vids] of Object.entries(videosForPin)) {
  const pin = pins.find((p) => p.id === pinId);
  for (const v of vids) {
    pinForVideo[v.id] = pin;
  }
}
