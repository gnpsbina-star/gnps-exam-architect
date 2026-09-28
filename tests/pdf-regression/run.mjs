// PDF regression check for the "paste AI HTML -> PDF" pipeline.
//
// Runs main.js's real exportPastedPaperToPdf() in headless Chromium on every
// saved paper in ./papers, then checks each page of the result:
//   - page count has not grown past the baseline
//   - no page except the last is left half-empty
//   - no line of text or figure is sliced by a page edge
//
// usage:  npm run test:pdf                 check against baseline.json
//         npm run test:pdf -- --update     accept the current results as the new baseline
//         npm run test:pdf -- maths        only papers whose name contains "maths"
//
// The PDFs are written to ./out so they can be opened and looked at.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PAPERS_DIR = path.join(HERE, 'papers');
const OUT_DIR = path.join(HERE, 'out');
const BASELINE_FILE = path.join(HERE, 'baseline.json');

// A page that is not the last one must be filled at least this far down, and
// no more than this much emptier than it was in the baseline.
const MIN_FILL_PERCENT = 80;
const MAX_FILL_DROP_PERCENT = 5;

const args = process.argv.slice(2);
const update = args.includes('--update');
const filters = args.filter(a => !a.startsWith('--'));

// The PDF code lives between these two functions in main.js; the rest of the
// file is app start-up code that needs the full page, so only this slice runs.
function loadPipelineCode() {
  const src = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
  const start = src.indexOf('function stampRunningFooter');
  const end = src.indexOf('async function handleGeneratePdfFromAi');
  if (start < 0 || end < 0 || end < start) {
    throw new Error('Could not find the PDF pipeline in main.js (looked for stampRunningFooter ... handleGeneratePdfFromAi).');
  }
  return src.slice(start, end);
}

// Runs in the browser. html2pdf turns each page into a JPEG of the content
// area (margins and footer excluded) with canvas.toDataURL; measuring those
// canvases gives the exact pixels that end up in the PDF.
function installPageProbe() {
  window.__pages = [];
  const original = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function (type, ...rest) {
    if (type === 'image/jpeg' && this.width > 1000) window.__pages.push(measure(this));
    return original.call(this, type, ...rest);
  };

  function measure(canvas) {
    const { width: w, height: h } = canvas;
    const px = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    const dark = (x, y) => {
      const i = (y * w + x) * 4;
      return (px[i] + px[i + 1] + px[i + 2]) / 3 < 150;
    };
    const x0 = Math.floor(w * 0.02), x1 = Math.ceil(w * 0.98);

    let lastInk = -1;
    for (let y = h - 1; y >= 0 && lastInk < 0; y--) {
      for (let x = x0; x < x1; x++) if (dark(x, y)) { lastInk = y; break; }
    }

    // Ink on the first or last pixel row means something runs across the
    // page edge. A vertical rule (box or table border) legitimately does that,
    // so a column only counts when it is neither solid for the next 40 rows
    // (taller than any glyph at exam font sizes) nor a dashed line: four or
    // more evenly sized, evenly spaced dashes, which glyph strokes never are.
    const RULE_ROWS = Math.min(40, h - 1);
    const DASH_ROWS = Math.min(100, h - 1);
    const isSolidRule = (x, y, step) => {
      for (let k = 1; k <= RULE_ROWS; k++) if (!dark(x, y + k * step)) return false;
      return true;
    };
    const isDashedRule = (x, y, step) => {
      const runs = [], gaps = [];
      let state = dark(x, y), len = 0;
      for (let k = 0; k <= DASH_ROWS; k++) {
        const d = dark(x, y + k * step);
        if (d === state) { len++; continue; }
        (state ? runs : gaps).push(len);
        state = d; len = 1;
      }
      // The first dash is cut by the page edge and the last by the window.
      const inner = runs.slice(1), innerGaps = gaps.slice(1);
      if (inner.length < 3 || innerGaps.length < 3) return false;
      const even = a => Math.max(...a) - Math.min(...a) <= 2;
      return even(inner) && even(innerGaps) && Math.max(...inner) <= 16;
    };
    const cutColumns = (y, step) => {
      let n = 0;
      for (let x = x0; x < x1; x++) {
        if (dark(x, y) && !isSolidRule(x, y, step) && !isDashedRule(x, y, step)) n++;
      }
      return n;
    };
    return { width: w, height: h, lastInk, cutTop: cutColumns(0, 1), cutBottom: cutColumns(h - 1, -1) };
  }
}

async function exportPaper(browser, code, paperFile) {
  const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // main.js loads KaTeX from jsDelivr; serve the same version from node_modules
  // so the check also works offline.
  await page.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/(.*)$/, route => {
    const rel = new URL(route.request().url()).pathname.replace(/^.*\/dist\//, '');
    const file = path.join(ROOT, 'node_modules/katex/dist', rel);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'not found' });
    const type = { '.css': 'text/css', '.js': 'application/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' }[path.extname(rel)] || 'application/octet-stream';
    return route.fulfill({ status: 200, body: fs.readFileSync(file), headers: { 'content-type': type, 'access-control-allow-origin': '*' } });
  });

  await page.setContent('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div id="app"></div></body></html>');
  await page.addScriptTag({ path: path.join(ROOT, 'node_modules/html2pdf.js/dist/html2pdf.bundle.min.js') });
  await page.addScriptTag({ content: code + '\nwindow.__export = exportPastedPaperToPdf;' });
  await page.evaluate(installPageProbe);

  const html = fs.readFileSync(paperFile, 'utf8');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 180000 }),
    page.evaluate(h => window.__export(h, 'out.pdf', 'GNPS / REGRESSION TEST'), html),
  ]);
  const name = path.basename(paperFile, '.html');
  await download.saveAs(path.join(OUT_DIR, name + '.pdf'));
  const pages = await page.evaluate(() => window.__pages);
  await page.close();
  return { pages, errors };
}

function summarise(pages) {
  // Every page canvas is the full content height except possibly the last,
  // so fill is measured against the first page's height.
  const full = pages[0].height;
  return {
    pages: pages.length,
    fill: pages.map(p => Math.round(((p.lastInk + 1) / full) * 100)),
    cuts: pages.flatMap((p, i) => [
      ...(p.cutTop > 3 ? [`page ${i + 1} top edge (${p.cutTop} px of ink)`] : []),
      ...(p.cutBottom > 3 ? [`page ${i + 1} bottom edge (${p.cutBottom} px of ink)`] : []),
    ]),
  };
}

function compare(name, result, base) {
  const problems = [];
  if (result.cuts.length) problems.push(`text or figure cut at ${result.cuts.join(', ')}`);
  result.fill.slice(0, -1).forEach((f, i) => {
    if (f < MIN_FILL_PERCENT) problems.push(`page ${i + 1} is only ${f}% full`);
    const was = base?.fill?.[i];
    if (was != null && f < was - MAX_FILL_DROP_PERCENT) problems.push(`page ${i + 1} fill dropped from ${was}% to ${f}%`);
  });
  if (!base) problems.push('no baseline yet (run with --update to record one)');
  else if (result.pages > base.pages) problems.push(`page count grew from ${base.pages} to ${result.pages}`);
  return problems;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const baseline = fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : {};
  const papers = fs.readdirSync(PAPERS_DIR)
    .filter(f => f.endsWith('.html'))
    .filter(f => !filters.length || filters.some(q => f.includes(q)))
    .sort();
  if (!papers.length) throw new Error('No papers matched.');

  const code = loadPipelineCode();
  const browser = await chromium.launch();
  let failed = 0;
  const nextBaseline = { ...baseline };

  try {
    for (const file of papers) {
      const name = path.basename(file, '.html');
      const { pages, errors } = await exportPaper(browser, code, path.join(PAPERS_DIR, file));
      if (!pages.length) throw new Error(`${name}: no pages were captured`);
      const result = summarise(pages);
      const base = baseline[name];
      const problems = compare(name, result, base);
      if (errors.length) problems.push(`browser errors: ${errors.join(' | ')}`);

      const was = base ? ` (baseline ${base.pages})` : '';
      const line = `${name}: ${result.pages} pages${was}, fill % ${JSON.stringify(result.fill)}`;
      if (update) {
        nextBaseline[name] = { pages: result.pages, fill: result.fill };
        console.log(`  saved  ${line}${result.cuts.length ? `  ⚠ cuts: ${result.cuts.join(', ')}` : ''}`);
      } else if (problems.length) {
        failed++;
        console.log(`  FAIL   ${line}`);
        problems.forEach(p => console.log(`           - ${p}`));
      } else {
        const better = base && result.pages < base.pages ? '  (fewer pages than baseline — run --update to lock it in)' : '';
        console.log(`  ok     ${line}${better}`);
      }
    }
  } finally {
    await browser.close();
  }

  if (update) {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(nextBaseline, null, 2) + '\n');
    console.log(`\nBaseline updated: ${path.relative(ROOT, BASELINE_FILE)}`);
  } else {
    console.log(`\n${papers.length - failed}/${papers.length} papers passed. PDFs are in ${path.relative(ROOT, OUT_DIR)}/`);
    if (failed) process.exitCode = 1;
  }
}

main().catch(e => { console.error(e); process.exit(1); });
