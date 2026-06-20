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
