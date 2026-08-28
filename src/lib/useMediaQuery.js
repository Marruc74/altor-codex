import { useSyncExternalStore } from "react";

// Subscribe to a CSS media query from React. Used where a layout decision has to
// move a node between parents, which CSS alone cannot do - everything that is
// only a matter of styling should stay in the stylesheet.
//
// Queries are cached so repeated calls with the same string share one
// MediaQueryList and one listener.
const cache = new Map();

function entry(query) {
  let e = cache.get(query);
  if (!e) {
    const mql = window.matchMedia(query);
    e = {
      mql,
      subscribe: (cb) => {
        mql.addEventListener("change", cb);
        return () => mql.removeEventListener("change", cb);
      },
    };
    cache.set(query, e);
  }
  return e;
}

export function useMediaQuery(query) {
  const e = entry(query);
  return useSyncExternalStore(
    e.subscribe,
    () => e.mql.matches,
    () => false,   // server / pre-hydration: assume it does not match
  );
}
