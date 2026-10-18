// Turns the loader greetings into SVG outlines so they can be shape-morphed.
// HarfBuzz shapes each word (needed for Malayalam/Devanagari conjuncts and vowel
// reordering), then each glyph outline is flattened into one centred path.
//
//   npm run build:greetings
//
// Fonts are downloaded once into scripts/.font-cache (git-ignored); only the
// generated outlines ship with the site.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as hb from 'harfbuzzjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = join(root, 'scripts', '.font-cache');
const outFile = join(root, 'src', 'data', 'greetingPaths.ts');

const FONT_BASE = 'https://github.com/google/fonts/raw/main/ofl/';
const FONTS = {
  latin: { file: 'InterTight[wght].ttf', url: FONT_BASE + 'intertight/InterTight%5Bwght%5D.ttf' },
  malayalam: { file: 'NotoSansMalayalam[wdth,wght].ttf', url: FONT_BASE + 'notosansmalayalam/NotoSansMalayalam%5Bwdth,wght%5D.ttf' },
  devanagari: { file: 'NotoSansDevanagari[wdth,wght].ttf', url: FONT_BASE + 'notosansdevanagari/NotoSansDevanagari%5Bwdth,wght%5D.ttf' },
  japanese: { file: 'NotoSansJP[wght].ttf', url: FONT_BASE + 'notosansjp/NotoSansJP%5Bwght%5D.ttf' },
  arabic: { file: 'NotoSansArabic[wdth,wght].ttf', url: FONT_BASE + 'notosansarabic/NotoSansArabic%5Bwdth,wght%5D.ttf' },
};

// Keep in step with the loader's sequence
const GREETINGS = [
  ['Hello', 'latin'],
  ['നമസ്കാരം', 'malayalam'],
  ['नमस्ते', 'devanagari'],
  ['Bonjour', 'latin'],
  ['Hola', 'latin'],
  ['Ciao', 'latin'],
  ['こんにちは', 'japanese'],
  ['Hallå', 'latin'],
  ['Guten Tag', 'latin'],
  ['مرحبا', 'arabic'],
];

// Output units per em: 100 keeps the numbers short
const EM = 100;
const WEIGHT = 500;

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function loadFont(key) {
  const { file, url } = FONTS[key];
  const path = join(cacheDir, file);
  if (!(await exists(path))) {
    console.log(`downloading ${file}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
  }
  const data = await readFile(path);
  const face = new hb.Face(new hb.Blob(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)));
  const font = new hb.Font(face);
  font.setVariations([hb.Variation.fromString(`wght=${WEIGHT}`)]);
  return { font, upem: face.upem };
}

const round = (n) => Math.round(n * 10) / 10;

function wordGlyphs(word, { font, upem }) {
  const buffer = new hb.Buffer();
  buffer.addText(word);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);

  const scale = EM / upem;
  const glyphs = []; // one list of [type, ...points] commands per visible glyph, in visual order
  let penX = 0;
  const infos = buffer.getGlyphInfos();
  const positions = buffer.getGlyphPositions();

  infos.forEach((info, i) => {
    const gid = info.codepoint;
    if (gid === 0) throw new Error(`"${word}" has a character the font cannot draw`);
    const { xAdvance, xOffset, yOffset } = positions[i];
    const ox = penX + xOffset;
    // Font space is y-up; SVG is y-down
    const pt = (x, y) => [(ox + x) * scale, -(yOffset + y) * scale];
    const cmds = [];
    for (const cmd of font.glyphToJson(gid)) {
      if (cmd.type === 'Z') { cmds.push(['Z']); continue; }
      const pts = [];
      for (let k = 0; k < cmd.values.length; k += 2) pts.push(...pt(cmd.values[k], cmd.values[k + 1]));
      cmds.push([cmd.type, ...pts]);
    }
    if (cmds.length) glyphs.push(cmds); // spaces have no outline
    penX += xAdvance;
  });

  // Centre the whole word on its bounding box
  const xs = [], ys = [];
  for (const g of glyphs) for (const [, ...p] of g) for (let k = 0; k < p.length; k += 2) { xs.push(p[k]); ys.push(p[k + 1]); }
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;

  return {
    glyphs: glyphs.map((g) => {
      const gx = [], gy = [];
      const d = g
        .map(([type, ...p]) => type + p.map((n, k) => {
          const v = k % 2 === 0 ? n - cx : n - cy;
          (k % 2 === 0 ? gx : gy).push(v);
          return round(v);
        }).join(' '))
        .join('');
      // Centre of the glyph, where a spare morph shape can shrink to
      const centre = [(Math.min(...gx) + Math.max(...gx)) / 2, (Math.min(...gy) + Math.max(...gy)) / 2];
      return { d, centre };
    }),
    width: maxX - minX,
    height: maxY - minY,
  };
}

// A tiny dot, so a letter with no counterpart can shrink away or grow from nothing
// (sub-pixel at any loader size, so it never shows as a speck inside a letter's counter)
const dot = ([x, y]) => `M${round(x)} ${round(y)}a0.02 0.02 0 1 0 0.04 0a0.02 0.02 0 1 0-0.04 0Z`;

await mkdir(cacheDir, { recursive: true });
const fonts = {};
for (const key of Object.keys(FONTS)) fonts[key] = await loadFont(key);

const words = GREETINGS.map(([word, key]) => ({ word, ...wordGlyphs(word, fonts[key]) }));
// Every word gets the same number of shapes so each one can morph letter-for-letter;
// shorter words pad with dots parked on their nearest letter
const shapeCount = Math.max(...words.map((w) => w.glyphs.length));
const padded = words.map(({ word, glyphs }) => ({
  word,
  shapes: Array.from({ length: shapeCount }, (_, i) =>
    i < glyphs.length ? glyphs[i].d : dot(glyphs[Math.floor((i * glyphs.length) / shapeCount)].centre)),
}));

const pad = 6;
const width = Math.ceil(Math.max(...words.map((o) => o.width)) + pad * 2);
const height = Math.ceil(Math.max(...words.map((o) => o.height)) + pad * 2);

const wordBlock = (w) =>
  [`  {`, `    word: ${JSON.stringify(w.word)},`, `    shapes: [`, ...w.shapes.map((d) => `      '${d}',`), `    ],`, `  },`].join('\n');

const ts = `// Generated by scripts/build-greeting-paths.mjs — do not edit by hand.
// Outlines from Inter Tight and Noto Sans (SIL Open Font License), ${EM} units per em,
// each word centred on (0, 0). Every word has ${shapeCount} shapes, one per letter in
// visual order, padded with dots, so shape i of one word morphs into shape i of the next.

/** viewBox that fits every greeting, centred on the origin */
export const GREETING_VIEWBOX = '${-width / 2} ${-height / 2} ${width} ${height}';
/** viewBox height in em, for sizing the SVG against the surrounding font size */
export const GREETING_HEIGHT_EM = ${height / EM};

export const GREETING_SHAPES: { word: string; shapes: string[] }[] = [
${padded.map(wordBlock).join('\n')}
];
`;
await writeFile(outFile, ts);
console.log(`wrote ${padded.length} words x ${shapeCount} shapes to src/data/greetingPaths.ts (${(ts.length / 1024).toFixed(1)} KB)`);
