#!/usr/bin/env node
// Generates Byteward's browser-extension icons and in-app logo SVGs from the
// mark in marks.mjs and the outlined wordmark in wordmark.json.
//
// Usage (from the repository root): node scripts/byteward/generate.mjs
//
// Needs Playwright (require("playwright")) and a Chromium: Playwright's own,
// or the one named by the CHROMIUM_PATH environment variable.

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { colors, markPath, padlockPath, portcullis } from "./marks.mjs";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const images = join(root, "apps/browser/src/images");
const storeIcons = join(root, "apps/browser/store/icons");
const assetSvgs = join(root, "libs/assets/src/svg/svgs");

const wordmark = JSON.parse(readFileSync(join(here, "wordmark.json"), "utf8"));

/** A rounded-square app tile with the mark on it, as an SVG on a 96 grid. */
function tile({ px, bg, fg, inset = 0, badge = null }) {
  const size = 96 - inset * 2;
  const radius = size * 0.22;
  // Scale the mark so it fills about 70% of the tile.
  const [bx, by, bw, bh] = portcullis.box;
  const scale = (size * 0.7) / Math.max(bw, bh);
  const tx = 48 - (bx + bw / 2) * scale;
  const ty = 48 - (by + bh / 2) * scale;
  let svg =
    `<rect x="${inset}" y="${inset}" width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` +
    `<path transform="translate(${tx} ${ty}) scale(${scale})" d="${markPath(px)}" fill="${fg}"/>`;
  if (badge === "beta") {
    svg += `<circle cx="82" cy="14" r="10" fill="${colors.beta}" stroke="#FFFFFF" stroke-width="4"/>`;
  } else if (badge === "locked") {
    svg +=
      `<circle cx="72" cy="72" r="24" fill="#FFFFFF"/>` +
      `<path d="${padlockPath(72, 73, 30)}" fill="${colors.ink}"/>`;
  }
  return svg;
}

/** A monochrome template icon (Safari): black mark on transparent. */
function template({ px, locked }) {
  const [bx, by, bw, bh] = portcullis.box;
  const size = locked ? 70 : 92;
  const scale = size / Math.max(bw, bh);
  const cx = locked ? 38 : 48;
  const cy = locked ? 40 : 48;
  const tx = cx - (bx + bw / 2) * scale;
  const ty = cy - (by + bh / 2) * scale;
  let svg = `<path transform="translate(${tx} ${ty}) scale(${scale})" d="${markPath(px)}" fill="#000"/>`;
  if (locked) {
    svg += `<path d="${padlockPath(76, 74, 40)}" fill="#000"/>`;
  }
  return svg;
}

const variants = {
  "": { bg: colors.ink, fg: colors.accent },
  _gray: { bg: colors.grayBg, fg: colors.grayFg },
};

/** Every PNG to render: [output path, pixel size, SVG body on a 96 grid]. */
function pngJobs() {
  const jobs = [];
  for (const px of [16, 19, 32, 38, 48, 96, 128]) {
    for (const [suffix, c] of Object.entries(variants)) {
      jobs.push([join(images, `icon${px}${suffix}.png`), px, tile({ px, ...c })]);
      jobs.push([
        join(images, `icon${px}${suffix}_beta.png`),
        px,
        tile({ px, ...c, badge: "beta" }),
      ]);
    }
  }
  for (const px of [19, 38]) {
    const c = variants[""];
    jobs.push([join(images, `icon${px}_locked.png`), px, tile({ px, ...c, badge: "locked" })]);
    jobs.push([join(images, `icon${px}_locked_beta.png`), px, tile({ px, ...c, badge: "locked" })]);
  }
  for (const [name, px] of [
    ["icon18_safari.png", 18],
    ["icon18_safari@2x.png", 36],
  ]) {
    jobs.push([join(images, name), px, template({ px, locked: false })]);
    jobs.push([
      join(images, name.replace("safari", "safari_locked")),
      px,
      template({ px, locked: true }),
    ]);
  }
  const c = variants[""];
  // The Chrome Web Store wants 96 px of artwork inside a 128 px canvas.
  jobs.push([join(storeIcons, "chrome-icon128.png"), 128, tile({ px: 128, ...c, inset: 12 })]);
  jobs.push([join(storeIcons, "icon64.png"), 64, tile({ px: 64, ...c })]);
  jobs.push([join(storeIcons, "windows-icon300.png"), 300, tile({ px: 300, ...c })]);
  return jobs;
}

async function renderPngs() {
  const { chromium } = require("playwright");
  // Set CHROMIUM_PATH to use a Chromium other than Playwright's own download.
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  const browser = await chromium.launch({ executablePath });
  const page = await browser.newPage();
  for (const [out, px, body] of pngJobs()) {
    await page.setViewportSize({ width: px, height: px });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">` +
        `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 96 96">${body}</svg>` +
        `</body></html>`,
    );
    writeFileSync(out, await page.screenshot({ omitBackground: true }));
  }
  await browser.close();
}

/** The in-app horizontal logo: the mark followed by the wordmark, in one colour. */
function logoSvg(fillClass, title) {
  const height = 45;
  const [bx, by, bw, bh] = portcullis.box;
  const markScale = height / bh;
  const markWidth = bw * markScale;
  const [wx, wy, ww, wh] = wordmark.viewBox;
  // Match the wordmark's height to about 80% of the mark's.
  const wordScale = (height * 0.8) / wh;
  const gap = 12;
  const wordX = markWidth + gap - wx * wordScale;
  const wordY = (height - wh * wordScale) / 2 - wy * wordScale;
  const width = Math.ceil(markWidth + gap + ww * wordScale);
  const f = (n) => Number(n.toFixed(4));
  return (
    `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n` +
    `    <title>${title}</title>\n` +
    `    <path class="${fillClass}" transform="translate(${f(-bx * markScale)} ${f(-by * markScale)}) scale(${f(markScale)})" d="${portcullis.path}" />\n` +
    `    <path class="${fillClass}" transform="translate(${f(wordX)} ${f(wordY)}) scale(${f(wordScale)})" d="${wordmark.d}" />\n` +
    `  </svg>`
  );
}

function writeAssetSvgs() {
  const header = `import { svg } from "../svg";\n\n// Generated by scripts/byteward/generate.mjs. Do not edit by hand.\n`;
  writeFileSync(
    join(assetSvgs, "bitwarden-logo.icon.ts"),
    `${header}export const BitwardenLogo = svg\`\n  ${logoSvg("tw-fill-marketing-logo", "Byteward")}\n\`;\n`,
  );
  writeFileSync(
    join(assetSvgs, "bitwarden-logo-beta.icon.ts"),
    `${header}export const BitwardenLogoBeta = svg\`\n  ${logoSvg("tw-fill-marketing-logo", "Byteward Beta")}\n\`;\n`,
  );
  const [bx, by, bw, bh] = portcullis.box;
  writeFileSync(
    join(assetSvgs, "shield.ts"),
    `${header}const BitwardenShield = svg\`\n` +
      `  <svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx} ${by} ${bw} ${bh}" fill="none">\n` +
      `    <path class="tw-fill-fg-nav" d="${portcullis.path}"/>\n` +
      `  </svg>\n\`;\n\nexport { BitwardenShield };\n`,
  );
}

writeAssetSvgs();
await renderPngs();
console.log("Generated Byteward icons and logos.");
