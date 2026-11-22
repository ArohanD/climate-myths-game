# Climate Mythbusters

[Open the app](https://arohand.github.io/climate-myths-game/)

Edit myths, evidence and wildcards, then generate printable cards and a teacher answer key. Edits save in your browser; **Reset deck** restores the latest defaults.

Print on US Letter, portrait, at 100% scale with browser headers/footers disabled. Cards are 2.5 × 3.5 inches, nine per sheet.

## Develop

No installation or build required. Run `npm start` (requires Python 3), then open http://localhost:8000.

Tests (Node 18+ and Python 3):

```sh
npm test
python3 .github/scripts/assemble_pages_test.py
```

Pushing to `main` deploys GitHub Pages. Same-repository PRs get previews at `/previews/pr-N/`.

## Update default cards

Edit the public [Cards sheet](https://docs.google.com/spreadsheets/d/1fesncrZhMUcNB6NUvjBRD_AA6ogtPgRvAUitofFaVc8/edit):

- **Sheet1:** `myth_id`, `myth`, `evidence_id`, `evidence`. Repeat the exact myth ID and text for each matching evidence row.
- **Wildcards:** `wildcard_id`, `wildcard`. Keep the headers even when removing all wildcards.

Sync runs daily at **09:17 UTC**, or manually via **Actions → Sync defaults from Google Sheet → Run workflow → main**. Select `dry_run` to validate without updating. Invalid data leaves existing defaults untouched; saved browser edits remain until reset.
