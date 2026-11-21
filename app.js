import { initialDeck } from './initial-data.js';
import { validateDeck, makeCards, paginate } from './deck.js';

const $ = id => document.getElementById(id);
const previewPath = location.pathname.match(/\/previews\/pr-\d+\//)?.[0];
const storageKey = `climate-mythbusters-v1${previewPath || ''}`;
let deck = structuredClone(initialDeck);
let activeMyth = deck[0].id;
let proof = { type: 'myth', id: activeMyth };
let undoDeck = null;
let revision = 0;
let generated = false;
let generationPending = false;
let persistenceFailed = false;
let loadMessage = '';
const sheetObserver = new ResizeObserver(entries => entries.forEach(({ target }) => fitSheet(target)));

try {
  const saved = localStorage.getItem(storageKey);
  if (saved !== null) deck = validateDeck(JSON.parse(saved), { draft: true });
} catch {
  loadMessage = 'Saved edits could not be loaded. The starting deck is shown; your saved file has not been changed.';
}
activeMyth = deck[0]?.id;
proof.id = activeMyth;

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function action(text, callback, className = 'quiet') {
  const node = el('button', text, className);
  node.type = 'button';
  node.addEventListener('click', callback);
  return node;
}
function say(text, undo = false) {
  $('notice').hidden = false;
  $('message').textContent = text;
  $('undo').hidden = !undo;
}
function scrollToNode(node) {
  node.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
function closeOptions() { $('file-controls').open = false; }
function persist() {
  revision++;
  generated = false;
  $('print').disabled = true;
  $('stale-note').hidden = false;
  $('print-pages').replaceChildren();
  try {
    localStorage.setItem(storageKey, JSON.stringify(deck));
    persistenceFailed = false;
    $('save-status').textContent = 'Saved in this browser.';
  } catch {
    persistenceFailed = true;
    $('save-status').textContent = 'Browser saving is unavailable. Download your deck to keep these edits.';
  }
  updateCounts();
}
function recordUndo() { undoDeck = structuredClone(deck); }
function discardUndo() { undoDeck = null; $('undo').hidden = true; }
function updateCounts() {
  const evidence = deck.reduce((total, myth) => total + myth.evidence.length, 0);
  $('counts').textContent = `${deck.length} myths · ${evidence} evidence cards`;
}
function currentCard() {
  const item = proof.type === 'myth' ? deck.find(m => m.id === proof.id) : deck.flatMap(m => m.evidence).find(e => e.id === proof.id);
  return item ? { ...item, type: proof.type } : null;
}
function makeCard(item, placeholder = false) {
  const node = el('article', undefined, `game-card ${item.type}`);
  const label = el('div', undefined, 'card-label');
  label.append(el('span', item.type === 'myth' ? 'Myth' : 'Evidence'));
  node.append(label, el('p', item.text || (placeholder ? 'Your card text will appear here.' : ''), 'card-text'));
  return node;
}
function showProof(type, id) {
  proof = { type, id };
  const item = currentCard();
  $('live-proof').replaceChildren();
  if (!item) {
    $('live-proof').append(el('p', 'Add a myth to preview your first card.', 'proof-help'));
    $('proof-position').textContent = '';
    $('fit-status').textContent = 'No card selected';
    return;
  }
  $('live-proof').append(makeCard(item, true));
  $('proof-position').textContent = type === 'myth' ? 'Myth' : 'Evidence';
  checkProofFit();
}
function checkProofFit() {
  const item = currentCard();
  const text = $('live-proof').querySelector('.card-text');
  if (!item || !text) return;
  const tooLong = text.scrollHeight > text.clientHeight + 1;
  $('fit-status').textContent = !item.text.trim() ? 'Add card text' : tooLong ? 'Text needs shortening' : 'Text fits';
  $('fit-status').dataset.error = String(!item.text.trim() || tooLong);
}
function fieldId(type, id) { return `field-${type}-${id}`; }
function setFieldError(field, message = '') {
  field.setAttribute('aria-invalid', String(Boolean(message)));
  const error = $(`${field.id}-error`);
  error.textContent = message;
  error.hidden = !message;
}
function makeField(item, type, myth, remove) {
  const wrap = el('div', undefined, `field ${type}`);
  const top = el('div', undefined, 'field-top');
  const label = el('label', type === 'myth' ? 'Myth' : 'Evidence');
  const input = el('textarea');
  input.id = fieldId(type, item.id);
  input.name = input.id;
  label.htmlFor = input.id;
  input.value = item.text;
  input.rows = type === 'myth' ? 2 : 4;
  input.maxLength = 2000;
  input.placeholder = type === 'myth' ? 'Write a climate myth…' : 'Add evidence that challenges this myth…';
  input.setAttribute('aria-describedby', `${input.id}-error`);
  input.addEventListener('focus', () => showProof(type, item.id));
  input.addEventListener('input', () => {
    discardUndo();
    item.text = input.value;
    const title = $(`myth-title-${myth.id}`);
    if (title) title.textContent = myth.text.trim() || 'Untitled myth';
    if (input.getAttribute('aria-invalid') === 'true') setFieldError(input, item.text.trim() ? '' : 'Add text before generating this card.');
    showProof(type, item.id);
    persist();
  });
  input.addEventListener('blur', () => setFieldError(input, item.text.trim() ? '' : 'Add text before generating this card.'));
  top.append(label);
  if (remove) {
    const removeButton = action('Remove', remove, 'quiet danger');
    removeButton.setAttribute('aria-label', `Remove evidence ${item.id}`);
    top.append(removeButton);
  }
  const error = el('p', '', 'field-error');
  error.id = `${input.id}-error`;
  error.hidden = true;
  wrap.append(top, input, error);
  return wrap;
}
function focusField(type, id) {
  const myth = type === 'myth' ? deck.find(m => m.id === id) : deck.find(m => m.evidence.some(e => e.id === id));
  if (!myth) return;
  $('search').value = '';
  applySearch();
  const row = $(`myth-row-${myth.id}`);
  activeMyth = myth.id;
  document.querySelectorAll('.myth-row').forEach(r => { r.open = r === row; });
  const field = $(fieldId(type, id));
  field.focus({ preventScroll: true });
  scrollToNode(field);
}
function removeEvidence(myth, evidenceId) {
  if (myth.evidence.length === 1) { say('Keep at least one evidence card for this myth, or remove the whole myth.'); return; }
  recordUndo();
  myth.evidence = myth.evidence.filter(e => e.id !== evidenceId);
  proof = { type: 'myth', id: myth.id };
  persist(); renderEditor(); focusField('myth', myth.id);
  say(`Evidence ${evidenceId} removed.`, true);
}
function removeMyth(mythId) {
  recordUndo();
  const index = deck.findIndex(m => m.id === mythId);
  deck.splice(index, 1);
  activeMyth = deck[Math.min(index, deck.length - 1)]?.id;
  proof = { type: 'myth', id: activeMyth };
  persist(); renderEditor();
  if (activeMyth) $(`myth-row-${activeMyth}`).querySelector('summary').focus(); else $('add').focus();
  say(`Myth ${mythId} and its evidence removed.`, true);
}
function addEvidence(myth) {
  if (myth.evidence.length >= 10) { say('Each myth can have up to 10 evidence cards.'); return; }
  recordUndo();
  const id = Math.max(0, ...deck.flatMap(m => m.evidence.map(e => e.id))) + 1;
  myth.evidence.push({ id, text: '' });
  persist(); renderEditor(); focusField('evidence', id);
}
function renderEditor() {
  $('rows').replaceChildren();
  updateCounts();
  deck.forEach(myth => {
    const row = el('details', undefined, 'myth-row');
    row.id = `myth-row-${myth.id}`;
    row.dataset.mythId = myth.id;
    row.open = activeMyth === myth.id;
    const summary = el('summary', undefined, 'myth-summary');
    const title = el('span', myth.text.trim() || 'Untitled myth', 'myth-title');
    title.id = `myth-title-${myth.id}`;
    summary.append(title, el('span', `${myth.evidence.length} evidence`, 'evidence-count'));
    const editor = el('div', undefined, 'row-editor');
    editor.append(makeField(myth, 'myth', myth));
    myth.evidence.forEach(e => editor.append(makeField(e, 'evidence', myth, () => removeEvidence(myth, e.id))));
    const controls = el('div', undefined, 'row-actions');
    controls.append(action('Add evidence', () => addEvidence(myth)), action('Remove myth', () => removeMyth(myth.id), 'quiet danger'));
    editor.append(controls);
    row.append(summary, editor);
    row.addEventListener('toggle', () => {
      if (!row.open || !row.isConnected) return;
      activeMyth = myth.id;
      document.querySelectorAll('.myth-row').forEach(other => { if (other !== row) other.open = false; });
      const owner = proof.type === 'myth' ? proof.id : deck.find(m => m.evidence.some(e => e.id === proof.id))?.id;
      if (owner !== myth.id) showProof('myth', myth.id);
    });
    $('rows').append(row);
  });
  applySearch();
  if (!currentCard()) proof = { type: 'myth', id: deck[0]?.id };
  showProof(proof.type, proof.id);
}
function applySearch() {
  const query = $('search').value.trim().toLocaleLowerCase();
  let visible = 0;
  deck.forEach(myth => {
    const content = [`myth ${myth.id}`, myth.text, ...myth.evidence.flatMap(e => [`evidence ${e.id}`, e.text])].join(' ').toLocaleLowerCase();
    const match = !query || content.includes(query);
    $(`myth-row-${myth.id}`).hidden = !match;
    if (match) visible++;
  });
  $('visible-count').textContent = `${visible} of ${deck.length}`;
  $('empty').hidden = visible > 0;
  $('empty-title').textContent = deck.length ? 'No matching cards' : 'Your deck is empty';
  $('empty-description').textContent = deck.length ? 'Try another word, or clear the search to see the whole deck.' : 'Add a myth and its evidence to start building a game.';
  $('empty-action').textContent = deck.length ? 'Clear search' : 'Add myth';
}
function addMyth() {
  if (deck.length >= 100) { say('This deck can contain up to 100 myths.'); return; }
  recordUndo();
  const id = Math.max(0, ...deck.map(m => m.id)) + 1;
  const evidenceId = Math.max(0, ...deck.flatMap(m => m.evidence.map(e => e.id))) + 1;
  deck.push({ id, text: '', evidence: [{ id: evidenceId, text: '' }] });
  activeMyth = id;
  $('search').value = '';
  persist(); renderEditor(); focusField('myth', id);
}
function makeGuide() {
  const page = el('section', undefined, 'guide-page');
  page.append(el('h2', 'Teacher answer key'));
  const key = el('div', undefined, 'answer-key');
  deck.forEach(m => {
    const match = el('section', undefined, 'answer-match');
    match.append(el('h3', m.text));
    const evidence = el('ul');
    m.evidence.forEach(e => evidence.append(el('li', e.text)));
    match.append(evidence);
    key.append(match);
  });
  page.append(key);
  return page;
}
function fitSheet(frame) {
  if (!frame.firstElementChild || !frame.clientWidth) return;
  const sheet = frame.firstElementChild;
  const scale = Math.min(1, frame.clientWidth / sheet.offsetWidth);
  sheet.style.transform = `scale(${scale})`;
  frame.style.height = `${sheet.offsetHeight * scale}px`;
}
async function generate() {
  if (generationPending) return;
  if (!deck.length) { say('Add at least one myth and its evidence to generate a game.'); $('add').focus(); return; }
  let firstInvalid = null;
  for (const myth of deck) {
    for (const item of [{ ...myth, type: 'myth' }, ...myth.evidence.map(e => ({ ...e, type: 'evidence' }))]) {
      const field = $(fieldId(item.type, item.id));
      const message = item.text.trim() ? '' : 'Add text before generating this card.';
      setFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = item;
    }
  }
  if (firstInvalid) { focusField(firstInvalid.type, firstInvalid.id); say('Some cards need text. Complete the highlighted field, then generate again.'); return; }
  try { validateDeck(deck); } catch (error) { say(error.message); return; }
  generationPending = true;
  $('generate').disabled = true;
  const startedAt = revision;
  try {
    await document.fonts.ready;
    if (revision !== startedAt) { say('The deck changed. Generate again when your edits are ready.'); return; }
    const cards = makeCards(deck);
    $('print-pages').replaceChildren();
    paginate(cards).forEach(group => { const page = el('section', undefined, 'card-page'); group.forEach(c => page.append(makeCard(c))); $('print-pages').append(page); });
    $('print-pages').append(makeGuide());
    document.body.classList.add('measuring');
    const textNodes = [...$('print-pages').querySelectorAll('.card-text')];
    const overflow = textNodes.map((node, i) => node.scrollHeight > node.clientHeight + 1 ? cards[i] : null).filter(Boolean);
    document.body.classList.remove('measuring');
    if (overflow.length) {
      $('print-pages').replaceChildren();
      overflow.forEach(c => setFieldError($(fieldId(c.type, c.id)), 'This text exceeds the card size. Shorten it before printing.'));
      focusField(overflow[0].type, overflow[0].id);
      say(`Shorten ${overflow.length} ${overflow.length === 1 ? 'card' : 'cards'} to fit the printed size.`);
      return;
    }
    sheetObserver.disconnect();
    $('preview-pages').replaceChildren();
    [...$('print-pages').children].forEach((page, index, pages) => {
      const details = el('details', undefined, 'sheet-preview');
      details.open = index < 2;
      details.append(el('summary', index === pages.length - 1 ? 'Teacher answer key' : `Card sheet ${index + 1}`));
      const frame = el('div', undefined, 'sheet-frame');
      frame.append(page.cloneNode(true));
      details.append(frame);
      details.addEventListener('toggle', () => fitSheet(frame));
      $('preview-pages').append(details);
      sheetObserver.observe(frame);
    });
    generated = true;
    $('preview').hidden = false;
    $('print').disabled = false;
    $('stale-note').hidden = true;
    $('preview-description').textContent = `${cards.length} cards · ${paginate(cards).length} card sheets · Answer key included`;
    $('preview-title').focus({ preventScroll: true });
    scrollToNode($('preview-title'));
    $('notice').hidden = true;
  } finally { document.body.classList.remove('measuring'); generationPending = false; $('generate').disabled = false; }
}

$('generate').onclick = generate;
$('print').onclick = () => { if (generated) window.print(); };
$('add').onclick = addMyth;
$('search').oninput = applySearch;
$('empty-action').onclick = () => { if (deck.length) { $('search').value = ''; applySearch(); $('search').focus(); } else addMyth(); };
$('dismiss').onclick = () => { $('notice').hidden = true; $('generate').focus(); };
$('undo').onclick = () => {
  if (!undoDeck) return;
  deck = undoDeck; undoDeck = null;
  activeMyth = deck[0]?.id; proof = { type: 'myth', id: activeMyth };
  $('search').value = '';
  persist(); renderEditor();
  say('Previous deck restored.');
  if (activeMyth) $(`myth-row-${activeMyth}`).querySelector('summary').focus(); else $('add').focus();
};
$('reset').onclick = () => {
  closeOptions(); recordUndo(); deck = structuredClone(initialDeck); activeMyth = deck[0].id;
  proof = { type: 'myth', id: activeMyth }; $('search').value = '';
  persist(); renderEditor(); say('Starting deck restored. Your previous edits can be recovered with Undo.', true);
  $('undo').focus();
};
$('export').onclick = () => {
  closeOptions();
  const url = URL.createObjectURL(new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' }));
  const link = el('a'); link.href = url; link.download = 'climate-mythbusters-deck.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('file-controls').querySelector('summary').focus();
};
$('import').onclick = () => { closeOptions(); $('file').click(); };
$('file').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 1000000) throw new Error('Choose a JSON file smaller than 1 MB.');
    const next = validateDeck(JSON.parse(await file.text()), { draft: true });
    recordUndo(); deck = next; activeMyth = deck[0]?.id; proof = { type: 'myth', id: activeMyth };
    $('search').value = ''; persist(); renderEditor(); say('Deck loaded. You can restore the previous deck with Undo.', true); $('undo').focus();
  } catch (error) { say(`Deck not loaded. ${error.message}`); $('file-controls').querySelector('summary').focus(); }
  event.target.value = '';
};
document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('file-controls').open) { closeOptions(); $('file-controls').querySelector('summary').focus(); } });
document.addEventListener('click', event => { if (!$('file-controls').contains(event.target)) closeOptions(); });
window.addEventListener('beforeunload', event => { if (persistenceFailed) { event.preventDefault(); event.returnValue = ''; } });
renderEditor();
document.fonts.ready.then(checkProofFit);
if (loadMessage) say(loadMessage);
