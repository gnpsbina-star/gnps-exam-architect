# PDF regression check

Real AI-generated papers (Science, Maths, Chemistry, Hindi) run through the
app's actual "paste HTML → PDF" code (`exportPastedPaperToPdf` in `main.js`).
Every page of every paper is checked for:

- **page count**: it must not grow past `baseline.json`
- **half-empty pages**: every page except the last must be at least 80% full,
  and must not lose more than 5 points of fill compared with the baseline
- **cut lines**: no text or figure may be sliced by a page edge

## Run it

```bash
npm install
npx playwright install chromium   # first time only
npm run test:pdf                  # all papers
npm run test:pdf -- maths         # only papers whose file name contains "maths"
```

The PDFs are saved in `tests/pdf-regression/out/` so you can open them.

## When a change makes papers better

If a change gives fewer pages or fuller pages on purpose, record the new
numbers as the baseline:

```bash
npm run test:pdf -- --update
```

## Adding a paper

Save the HTML the AI produced into `papers/<name>.html`, then run
`npm run test:pdf -- --update <name>` to record its baseline.

`server.py` refuses to serve anything under `/tests/`, so these papers
are not downloadable from the live site.
