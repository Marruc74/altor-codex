// Thin-stroke line icons for the rail and the top bar, drawn to a 24x24 box on a
// 1.5px stroke so they sit at the same optical weight as the brass hairlines
// everywhere else. Inline rather than a sprite: there are a dozen of them, they
// are tiny, and a sprite file would be one more request for ~2KB of paths.
// (public/icons.svg is an unrelated leftover of social icons.)

const PATHS = {
  // An open book, for the archive itself.
  home: (
    <>
      <path d="M12 6.5v13" />
      <path d="M12 6.5C10.5 5 8 4.3 4.5 4.5v13c3.5-.2 6 .5 7.5 2" />
      <path d="M12 6.5C13.5 5 16 4.3 19.5 4.5v13c-3.5-.2-6 .5-7.5 2" />
    </>
  ),
  // Folded map.
  map: (
    <>
      <path d="M9 4.5 3.5 6.8v12.7L9 17.2l6 2.3 5.5-2.3V4.5L15 6.8Z" />
      <path d="M9 4.5v12.7M15 6.8v12.7" />
    </>
  ),
  // Stacked volumes on a shelf.
  compendium: (
    <>
      <rect x="4" y="4.5" width="4" height="15" rx="0.6" />
      <rect x="9.5" y="4.5" width="4" height="15" rx="0.6" />
      <path d="M15.4 6.2 19 5.3l2 14.2-3.6.9Z" />
    </>
  ),
  // Quill over a line, for the chronicles.
  chronicles: (
    <>
      <path d="M4 20c4-1.5 6.5-4 8-7.5 1.4-3.3 3.3-5.5 6-6.5-.4 3.2-1.6 5.9-3.5 8-2 2.2-4.6 3.4-7.5 3.5" />
      <path d="M4 20c1.2-3 3-5.2 5.5-6.5" />
    </>
  ),
  // Hourglass, for the timeline.
  history: (
    <>
      <path d="M7 4h10M7 20h10" />
      <path d="M7.5 4c0 4 4.5 5.4 4.5 8s-4.5 4-4.5 8" />
      <path d="M16.5 4c0 4-4.5 5.4-4.5 8s4.5 4 4.5 8" />
    </>
  ),
  // Sealed letter, for the colophon.
  about: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  // Six-pointed star, matching the ✦ sigil used through the copy.
  surprise: (
    <>
      <path d="M12 3.5c.6 4.3 2.2 6.6 6.5 7.2-4.3.6-5.9 2.9-6.5 7.2-.6-4.3-2.2-6.6-6.5-7.2 4.3-.6 5.9-2.9 6.5-7.2Z" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18.5" cy="12" r="1.3" />
    </>
  ),
  contents: (
    <>
      <path d="M4 6.5h3M4 12h3M4 17.5h3" />
      <path d="M10.5 6.5H20M10.5 12H20M10.5 17.5H20" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  chevron: <path d="m9 5 7 7-7 7" />,
};

export default function Icon({ name, size = 22, className = "", ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {d}
    </svg>
  );
}
