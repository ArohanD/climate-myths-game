import { readFile, writeFile, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { validateDeck } from '../../deck.js';

export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1fesncrZhMUcNB6NUvjBRD_AA6ogtPgRvAUitofFaVc8/export?format=csv&gid=0';
const HEADERS = ['myth_id', 'myth', 'evidence_id', 'evidence'];
const MAX_BYTES = 1_000_000;

export function parseCSV(input) {
  const text = input.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', quoted = false, closed = false;
  const cell = () => { row.push(field); field = ''; closed = false; };
  const line = () => { cell(); rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === ',') cell();
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; line(); }
    else if (c === '"' && !field && !closed) quoted = true;
    else { if (closed || c === '"') throw new Error('Malformed CSV quoting.'); field += c; }
  }
  if (quoted) throw new Error('Unclosed CSV quote.');
  if (field || closed || row.length) line();
  return rows;
}

export function deckFromCSV(text) {
  const [headers, ...rows] = parseCSV(text);
  if (JSON.stringify(headers) !== JSON.stringify(HEADERS)) throw new Error(`Expected headers: ${HEADERS.join(', ')}. Check sheet access and column names.`);
  const myths = new Map();
  const id = (value, label, row) => {
    if (!/^[1-9]\d*$/.test(value.trim()) || !Number.isSafeInteger(Number(value))) throw new Error(`Row ${row}: ${label} must be a positive integer.`);
    return Number(value);
  };
  rows.forEach((cells, index) => {
    if (cells.every(c => !c.trim())) return;
    const rowNumber = index + 2;
    if (cells.length !== 4) throw new Error(`Row ${rowNumber}: expected four columns.`);
    const [mythId, mythText, evidenceId, evidenceText] = cells;
    const mId = id(mythId, 'myth_id', rowNumber);
    const eId = id(evidenceId, 'evidence_id', rowNumber);
    let myth = myths.get(mId);
    if (myth && myth.text !== mythText) throw new Error(`Row ${rowNumber}: myth ${mId} has conflicting text. Update all rows for this myth consistently.`);
    if (!myth) { myth = { id: mId, text: mythText, evidence: [] }; myths.set(mId, myth); }
    myth.evidence.push({ id: eId, text: evidenceText });
  });
  return validateDeck([...myths.values()]);
}

export async function fetchSheet(fetcher = fetch) {
  const response = await fetcher(SHEET_URL, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Sheet export failed (HTTP ${response.status}). Keep the sheet publicly readable.`);
  if (!response.body) throw new Error('Sheet export returned no body.');
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error('Sheet export exceeds 1 MB.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function sync({ dryRun = false, destination = 'initial-data.js', fetcher = fetch } = {}) {
  const deck = deckFromCSV(await fetchSheet(fetcher));
  const next = `export const initialDeck = ${JSON.stringify(deck, null, 2)};\n`;
  const previous = await readFile(destination, 'utf8');
  const changed = next !== previous;
  // No destination is touched until the complete remote response passes validation.
  if (changed && !dryRun) {
    const temporary = `${destination}.tmp`;
    await writeFile(temporary, next, 'utf8');
    await rename(temporary, destination);
  }
  return { changed, myths: deck.length, evidence: deck.reduce((n, m) => n + m.evidence.length, 0) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const dryRun = process.argv.includes('--dry-run');
    const result = await sync({ dryRun });
    console.log(`${result.myths} myths, ${result.evidence} evidence cards. ${result.changed ? (dryRun ? 'Changes validated (dry run).' : 'Defaults updated.') : 'No changes.'}`);
  } catch (error) { console.error(`Sheet sync stopped: ${error.message}`); process.exitCode = 1; }
}
