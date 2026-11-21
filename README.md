# Climate Mythbusters

A buildless, browser-local card studio for teachers. Edit myths and their evidence, generate card sheets, then use the browser print dialog to save a PDF or print.

## Run

Requires Python 3 for the development server; Node 18+ only for tests.

```sh
npm start
# Open http://localhost:8000
npm test
```

Alternatively: `python3 -m http.server 8000`. No installation or production build is needed. Serve this directory with any static host, including GitHub Pages.

## Use

- Expand a myth and edit its matching evidence. Generate deck, Add myth, and Reset deck share one toolbar. Focusing a field shows its printable card in a live preview. IDs are stable and evidence numbering preserves the source's shuffled matches.
- Add or remove cards. Undo restores the previous deck after removal or reset; typing a new edit clears that single Undo snapshot.
- Changes, including unfinished blank drafts, save to localStorage in the current browser. Reset deck restores the starting data, with Undo available. There is no shared database or simultaneous editing.
- Generate game creates 2.5 × 3.5 inch cards, nine per US Letter sheet, plus a text-based teacher answer key. Evidence cards show small IDs; myth cards show their matching evidence IDs. Neither has a footer.
- Select Letter, portrait, 100% scale, single-sided, and disable browser headers/footers when printing. Cut along dotted borders. Text overflow blocks generation so it can be shortened before printing.
- Editing invalidates the preview; generate again before printing.

## Source and editorial status

`initial-data.js` transcribes the 12 myths and 24 evidence statements in the MEA 519 team's Google Doc, retrieved November 21, 2026:
https://docs.google.com/document/d/1AM42lYGqVo3Ljyug9_bPNP5cjSuvoQyOH2TfhluivZQ/edit?tab=t.necv43frbhaq

The source wording is preserved, not independently fact-checked. Review scientific claims and source attribution before classroom distribution, including Evidence 24's statement about severe cold. Wildcards are not included because their final text was not in the supplied table.

## Files

- `index.html`, `styles.css`, `app.js`: interface, card layout, browser saving, reset/Undo, and printing.
- `initial-data.js`: starting content.
- `deck.js`: validation, card ordering, pagination.
- `deck.test.js`: data integrity and pagination checks.
- `DESIGN.md`: 54 consolidated design rules from Impeccable, apple-design, Taste Skill and Vercel Web Interface Guidelines, with conflict resolutions and verification notes.

No accounts, analytics, API keys, backend, or external runtime dependencies.

## Hosting and previews

Live site: https://arohand.github.io/climate-myths-game/

GitHub Actions publishes `main` to GitHub Pages. Open PRs from branches in this repository get `https://arohand.github.io/climate-myths-game/previews/pr-N/` previews. Links appear in the publishing run's summary. Opening, updating, reopening or closing a PR rebuilds the site; closed PR previews disappear after that deployment. Fork PRs are not published.

The publishing workflow always checks out and executes trusted `main` code. It retrieves only six allowlisted static files from PR commits through the GitHub API; it never runs PR scripts, installs PR dependencies or executes PR tests with publishing permissions. Preview JavaScript runs only in visitors' browsers. Only app files are deployed; repository documentation and workflows are excluded. Preview drafts use separate localStorage keys from production.

The teacher answer key uses the full myth and matching evidence text, alongside the small evidence references on player cards. Card and site footers, marketing paragraphs, generated game-rule adaptations and discussion prompts were removed in the Cut-paper update. Source statements remain unchanged. Native PDF saving and physical printing still require manual validation.

## Google Sheet defaults

The source of future defaults is the public [Cards sheet](https://docs.google.com/spreadsheets/d/1fesncrZhMUcNB6NUvjBRD_AA6ogtPgRvAUitofFaVc8/edit?gid=0). `Sheet1` (gid `0`) contains one row per evidence statement, with the exact headers `myth_id`, `myth`, `evidence_id`, `evidence`.

- Repeat the same myth ID and exact myth text for each of its evidence rows. When editing a myth, update all its rows consistently.
- IDs must be positive integers; evidence IDs must be unique. Blank rows are ignored; incomplete rows, conflicting myth text, duplicate IDs, empty decks and app-limit violations stop the sync.
- Keep the sheet publicly readable. No Google credentials are stored in the repository. The script never writes to the sheet.
- Existing scientific statements are copied verbatim; the sync does not generate or fact-check content. It validates structure and text-length limits; the app still checks physical card fit before printing.

After this workflow is merged to `main`, **Actions → Sync defaults from Google Sheet → Run workflow → main** runs it on demand. Check **dry_run** to validate without saving changes. It also runs daily at **09:17 UTC** (GitHub schedules can be delayed). PR runs only validate and never update production.

A successful sync commits only `initial-data.js` when content changes, then explicitly dispatches the Pages workflow. The explicit dispatch is necessary because a push made with `GITHUB_TOKEN` does not trigger another push workflow. Invalid downloads leave the previous defaults untouched; a concurrent edit to `main` causes a normal push failure rather than overwriting it. If publishing fails after a successful sync, rerun the **Publish site and PR previews** workflow.

New visitors and **Reset deck** use the latest defaults; saved browser edits are never replaced automatically. Pages assembly adds content-derived asset URLs so changed defaults do not remain hidden by cached modules.

Local read-only check: `node .github/scripts/sync-sheet.mjs --dry-run`. Tests: `npm test` and `python3 .github/scripts/assemble_pages_test.py`. Historical source expectations live in `test/fixtures/original-deck.json` so legitimate future changes in myth/evidence counts do not break those tests.
