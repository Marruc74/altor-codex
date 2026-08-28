// Shared markdown image helpers. extractImages pulls every ![alt](src "caption")
// out of a body;
// stripImages removes them (leaving the prose) and collapses the gaps.
const IMAGE_RE = /!\[([^\]]*)\]\(([^")]+?)(?:\s+"([^"]*)")?\)/g;

export function extractImages(md) {
  const imgs = [];
  let m;
  IMAGE_RE.lastIndex = 0;
  while ((m = IMAGE_RE.exec(md)) !== null) {
    imgs.push({ alt: m[1], src: m[2], caption: m[3] || null });
  }
  return imgs;
}

export function stripImages(md) {
  return md.replace(IMAGE_RE, "").replace(/\n{3,}/g, "\n\n").trim();
}

// ── Headings ────────────────────────────────────────────────────────────────
// The reader's "On this page" list needs an anchor per section heading. There is
// no rehype-slug in the build, so the ids are minted here and the same function
// is used on both sides - once over the raw markdown to build the list, once in
// the ReactMarkdown h2/h3 override to stamp the id. Sharing one implementation
// is the point: two slugifiers that drift by one character give you a contents
// list whose links quietly go nowhere.

// The id is a pure function of the heading text and nothing else. That is
// deliberate: the renderer sees one heading at a time and has no document-wide
// counter, so anything position-dependent (a "-2" suffix for repeats) would be
// computable here but not there, and the contents links would point at ids that
// were never stamped. If a page does repeat a heading, both share an anchor and
// the browser lands on the first - a fair trade for links that always resolve.
export function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")  // strip accents (Trakorien, Jih-pun...)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Pull the ## and ### headings out of a body, in document order. Fenced code
// blocks are skipped so a commented-out "# heading" inside one is not indexed.
export function extractHeadings(md) {
  if (!md) return [];
  const out = [];
  let inFence = false;

  for (const line of md.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;

    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;

    // Strip inline markup so the label reads as plain text.
    const text = m[2]
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\([^)]*\)/g, "$1")
      .trim();

    const id = slugifyHeading(text);
    if (!id) continue;

    out.push({ depth: m[1].length, text, id });
  }
  return out;
}

// The matching id for a rendered heading. `children` is whatever ReactMarkdown
// hands the override - usually a string, sometimes an array with inline nodes.
export function headingText(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return headingText(children.props?.children);
  }
  return "";
}
