# Byteward brand assets

Byteward's icons and in-app logos are generated from code, so they can be
regenerated after merging upstream changes or tweaking the mark.

- `marks.mjs`: the portcullis mark (a 96 × 96 grid) and the brand colours.
- `wordmark.json`: the "byteward" wordmark outlined from Space Grotesk Bold
  (SIL Open Font License, see `SpaceGrotesk-OFL.txt`). Rebuild it with
  `make-wordmark.py` (needs `pip install fonttools`).
- `generate.mjs`: writes the browser extension's PNG icons
  (`apps/browser/src/images`, `apps/browser/store/icons`) and the in-app logo
  SVGs (`libs/assets/src/svg/svgs`).

```sh
CHROMIUM_PATH=/path/to/chrome node scripts/byteward/generate.mjs
```

`CHROMIUM_PATH` is only needed when Playwright's own Chromium isn't installed.
