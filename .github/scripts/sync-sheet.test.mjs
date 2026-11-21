import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deckFromCSV, parseCSV, sync, fetchSheet } from './sync-sheet.mjs';
import { initialDeck } from '../../initial-data.js';

const csv = rows => rows.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n');
const header = ['myth_id', 'myth', 'evidence_id', 'evidence'];
const source = () => csv([header, ...initialDeck.flatMap(m => m.evidence.map(e => [m.id, m.text, e.id, e.text]))]);
test('sheet round trip preserves all text, IDs, order and matches', () => assert.deepEqual(deckFromCSV(source()), initialDeck));
test('quoted commas, quotes, Unicode and multiline text are preserved', () => {
  const text = 'A "quote", a comma\nand café.';
  assert.equal(deckFromCSV('\uFEFF' + csv([header, [1, text, 7, text]]))[0].text, text);
  assert.throws(() => parseCSV('"unfinished'), /Unclosed/);
  assert.throws(() => parseCSV('"a"oops'), /Malformed/);
});
test('rejects empty, HTML, malformed IDs, duplicate evidence and inconsistent myths', () => {
  for (const input of ['', '<html>Sign in</html>', csv([header]), csv([header, [0, 'Myth', 1, 'Evidence']]), csv([header, [1, '', 1, 'Evidence']]), csv([header, [1, 'Myth', 1, 'Evidence'], [2, 'Other', 1, 'Evidence']]), csv([header, [1, 'Myth', 1, 'Evidence'], [1, 'Changed', 2, 'Evidence']])]) assert.throws(() => deckFromCSV(input));
});
test('ignores entirely blank rows, but rejects partial rows and oversized statements', () => {
  assert.equal(deckFromCSV(csv([header, ['', '', '', ''], [1, 'Myth', 3, 'Evidence']])).length, 1);
  assert.throws(() => deckFromCSV(csv([header, [1, 'Myth', 3]])));
  assert.throws(() => deckFromCSV(csv([header, [1, 'x'.repeat(2001), 3, 'Evidence']])));
});
test('network errors and excessive downloads fail closed', async () => {
  await assert.rejects(fetchSheet(async () => new Response('', {status:403})), /HTTP 403/);
  await assert.rejects(fetchSheet(async () => new Response('x'.repeat(1_000_001))), /1 MB/);
});
test('dry runs and invalid downloads never overwrite defaults; updates are idempotent', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'climate-sync-'));
  const destination = join(directory, 'initial-data.js');
  try {
    await writeFile(destination, 'original');
    const fetcher = async () => new Response(source());
    assert.equal((await sync({destination, fetcher, dryRun:true})).changed, true);
    assert.equal(await readFile(destination, 'utf8'), 'original');
    await assert.rejects(sync({destination, fetcher:async () => new Response('<html>Denied</html>')}));
    assert.equal(await readFile(destination, 'utf8'), 'original');
    assert.equal((await sync({destination, fetcher})).changed, true);
    assert.equal((await sync({destination, fetcher})).changed, false);
  } finally { await rm(directory, {recursive:true, force:true}); }
});
