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

- Search the deck, expand a myth, and edit its matching evidence. Focusing a field shows its printable card in a live preview. IDs are stable and evidence numbering preserves the source's shuffled matches.
- Add or remove cards. Undo restores the previous deck after removal, import, or reset; typing a new edit clears that single Undo snapshot.
- Changes, including unfinished blank drafts, save to localStorage in the current browser. Use Deck options to download/load JSON to back up or share a deck. There is no shared database or simultaneous editing.
- Generate game creates 2.5 × 3.5 inch cards, nine per US Letter sheet, plus a text-based teacher answer key. Evidence cards show small IDs; myth cards show their matching evidence IDs. Neither has a footer.
- Select Letter, portrait, 100% scale, single-sided, and disable browser headers/footers when printing. Cut along dotted borders. Text overflow blocks generation so it can be shortened before printing.
- Editing invalidates the preview; generate again before printing.

## Source and editorial status

`initial-data.js` transcribes the 12 myths and 24 evidence statements in the MEA 519 team's Google Doc, retrieved November 21, 2026:
https://docs.google.com/document/d/1AM42lYGqVo3Ljyug9_bPNP5cjSuvoQyOH2TfhluivZQ/edit?tab=t.necv43frbhaq

The source wording is preserved, not independently fact-checked. Review scientific claims and source attribution before classroom distribution, including Evidence 24's statement about severe cold. Wildcards are not included because their final text was not in the supplied table.

## Files

- `index.html`, `styles.css`, `app.js`: interface, card layout, browser saving, import/export, and printing.
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
