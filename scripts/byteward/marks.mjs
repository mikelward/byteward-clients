// Byteward brand mark: a grid portcullis, drawn on a 96 x 96 grid.
//
// The mark is plain filled shapes with no holes, so the same path works as a
// coloured app icon, a one-colour in-app logo and a monochrome Safari
// template icon.

/** Rectangle as path data. */
export function rect(x, y, w, h) {
  return `M${x} ${y}h${w}v${h}h${-w}Z`;
}

/** A portcullis bar: a vertical bar with a spiked foot. */
function bar(cx, width, top, bottom) {
  const half = width / 2;
  return `M${cx - half} ${top}H${cx + half}V${bottom}L${cx} ${bottom + width}L${cx - half} ${bottom}Z`;
}

const grid = (bars, barWidth, barTop, barBottom, rails, railHeight) =>
  bars.map((x) => bar(x, barWidth, barTop, barBottom)).join("") +
  rails.map((y) => rect(14, y, 68, railHeight)).join("");

export const portcullis = {
  title: "Byteward",
  // Four spiked bars and three crossbars.
  path: grid([24, 40, 56, 72], 7, 14, 76, [14, 36, 58], 7),
  // Three thicker bars and two crossbars, for toolbar sizes.
  smallPath: grid([26, 48, 70], 10, 16, 74, [16, 46], 10),
  // The part of the 96 grid the mark occupies: x, y, width, height.
  box: [14, 14, 68, 70],
};

/** Path data for the mark at a given pixel size. */
export function markPath(px) {
  return px <= 38 ? portcullis.smallPath : portcullis.path;
}

/** A padlock on the 96 grid, centred on (cx, cy), `size` units tall. */
export function padlockPath(cx, cy, size) {
  const s = size / 40;
  const p = (x, y) => `${cx + x * s} ${cy + y * s}`;
  // Shackle: an arch 4 units thick (outer radius 11, inner 7) sitting on the body.
  const shackle =
    `M${p(-11, 0)}V${cy - 9 * s}A${11 * s} ${11 * s} 0 0 1 ${p(11, -9)}V${cy}` +
    `H${cx + 7 * s}V${cy - 9 * s}A${7 * s} ${7 * s} 0 0 0 ${p(-7, -9)}V${cy}Z`;
  const body = `M${p(-15, -1)}H${cx + 15 * s}V${cy + 20 * s}H${cx - 15 * s}Z`;
  return shackle + body;
}

/** Brand colours. */
export const colors = {
  ink: "#111111",
  accent: "#FFFFFF",
  grayBg: "#6B6B6B",
  grayFg: "#E0E0E0",
  beta: "#FF7A59",
};
