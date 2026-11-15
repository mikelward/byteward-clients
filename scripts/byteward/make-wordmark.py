#!/usr/bin/env python3
"""Outline the "byteward" wordmark from Space Grotesk Bold into SVG path data.

Usage: make-wordmark.py <space-grotesk-latin-700-normal.woff> > wordmark.json

Space Grotesk is licensed under the SIL Open Font License (SpaceGrotesk-OFL.txt),
which permits outlining glyphs for a logo. Requires: pip install fonttools
"""

import json
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

TEXT = "byteward"
TRACKING = -0.02  # em, matches the mockups' letter-spacing


def main(font_path: str) -> None:
    font = TTFont(font_path)
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font["head"].unitsPerEm
    ascender = font["hhea"].ascent

    pen = SVGPathPen(glyph_set, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
    bounds = BoundsPen(glyph_set)
    x = 0.0
    for i, ch in enumerate(TEXT):
        name = cmap[ord(ch)]
        glyph = glyph_set[name]
        # Flip Y so the path is in SVG coordinates with the baseline at y = ascender
        transform = (1, 0, 0, -1, x, ascender)
        glyph.draw(TransformPen(pen, transform))
        glyph.draw(TransformPen(bounds, transform))
        x += glyph.width
        if i < len(TEXT) - 1:
            x += TRACKING * upm

    x_min, y_min, x_max, y_max = (round(v) for v in bounds.bounds)
    json.dump(
        {
            "d": pen.getCommands(),
            "viewBox": [x_min, y_min, x_max - x_min, y_max - y_min],
            "baseline": ascender,
            "upm": upm,
        },
        sys.stdout,
    )


if __name__ == "__main__":
    main(sys.argv[1])
