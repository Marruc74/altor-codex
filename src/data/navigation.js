// The archive's top-level destinations, in rail order. Kept out of SideRail.jsx
// so that file exports components only (Fast Refresh needs that).

export const DESTINATIONS = [
  { id: null,         icon: "home",       label: "Archive",    short: "Archive" },
  { id: "map",        icon: "map",        label: "Map",        short: "Map" },
  { id: "catalog",    icon: "compendium", label: "Compendium", short: "Codex" },
  { id: "chronicles", icon: "chronicles", label: "Chronicles", short: "Chronicle" },
  { id: "history",    icon: "history",    label: "History",    short: "History" },
  { id: "about",      icon: "about",      label: "About",      short: "About" },
];

// Six destinations is one too many for a phone's bottom bar, so these four get
// tabs and the rest fold into a "More" sheet.
export const PHONE_PRIMARY = new Set([null, "map", "catalog", "chronicles"]);
