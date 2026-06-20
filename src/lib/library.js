// The reader's personal library: recently-viewed pages and bookmarks, persisted
// to localStorage. A tiny external store (useSyncExternalStore) so any component
// - a bookmark button, the landing strips - reads the same live state without
// prop-drilling. A "ref" is the minimal page handle {kind, id, name}; the
// Compendium turns it back into an openable target.
import { useSyncExternalStore } from "react";

const RECENTS_KEY = "altor:recents";
const BOOKMARKS_KEY = "altor:bookmarks";
const SEEN_KEY = "altor:seen";
const RECENTS_MAX = 12;

function load(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // storage disabled or over quota - keep working in-memory for the session
  }
}

let recents = load(RECENTS_KEY);
let bookmarks = load(BOOKMARKS_KEY);
// Every page ever opened (uncapped), for reading-progress. Kept both as the
// stored array and as a Set of "kind-id" keys for O(1) lookups in the nav.
let seen = load(SEEN_KEY);
let seenKeys = new Set(seen.map((r) => `${r.kind}-${r.id}`));

const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const sameRef = (a, b) => a.kind === b.kind && a.id === b.id;
const cleanRef = (ref) => ({ kind: ref.kind, id: ref.id, name: ref.name ?? ref.id });
const isRef = (ref) => ref && ref.kind && ref.id != null;

// Record a page view: move it to the front of the recents list (deduped,
// capped) and add it to the uncapped "seen" set that drives reading-progress.
export function recordView(ref) {
  if (!isRef(ref)) return;
  const entry = cleanRef(ref);
  recents = [entry, ...recents.filter((r) => !sameRef(r, entry))].slice(0, RECENTS_MAX);
  save(RECENTS_KEY, recents);
  const k = `${entry.kind}-${entry.id}`;
  if (!seenKeys.has(k)) {
    seen = [...seen, entry];
    seenKeys = new Set(seenKeys).add(k);
    save(SEEN_KEY, seen);
  }
  emit();
}

export function clearRecents() {
  recents = [];
  save(RECENTS_KEY, recents);
  emit();
}

// Toggle a bookmark; returns the new bookmarked state (true = now saved).
export function toggleBookmark(ref) {
  if (!isRef(ref)) return false;
  const entry = cleanRef(ref);
  const exists = bookmarks.some((b) => sameRef(b, entry));
  bookmarks = exists ? bookmarks.filter((b) => !sameRef(b, entry)) : [entry, ...bookmarks];
  save(BOOKMARKS_KEY, bookmarks);
  emit();
  return !exists;
}

export function useRecents() {
  return useSyncExternalStore(subscribe, () => recents, () => recents);
}
export function useBookmarks() {
  return useSyncExternalStore(subscribe, () => bookmarks, () => bookmarks);
}
export function useIsBookmarked(ref) {
  const bm = useBookmarks();
  return isRef(ref) ? bm.some((b) => sameRef(b, ref)) : false;
}
// Set of "kind-id" keys for every page seen - for reading-progress badges.
export function useSeenKeys() {
  return useSyncExternalStore(subscribe, () => seenKeys, () => seenKeys);
}
