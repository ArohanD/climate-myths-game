function validateCard(card, label, ids, draft) {
  if (!card || !Number.isSafeInteger(card.id) || card.id < 1 || ids.has(card.id)) {
    throw new Error(`${label} numbers must be unique positive integers.`);
  }
  ids.add(card.id);
  if (typeof card.text !== 'string' || (!draft && !card.text.trim()) || card.text.length > 2000) {
    throw new Error(`${label} ${card.id} needs text (maximum 2,000 characters).`);
  }
}

export function validateDeck(value, { draft = false } = {}) {
  if (!Array.isArray(value) || (!draft && !value.length) || value.length > 100) {
    throw new Error('Use between 1 and 100 myths.');
  }
  const mythIds = new Set();
  const evidenceIds = new Set();
  for (const myth of value) {
    validateCard(myth, 'Myth', mythIds, draft);
    if (!Array.isArray(myth.evidence) || !myth.evidence.length || myth.evidence.length > 10) {
      throw new Error(`Myth ${myth.id} needs 1–10 evidence cards.`);
    }
    for (const fact of myth.evidence) validateCard(fact, 'Evidence', evidenceIds, draft);
  }
  return value.map(({ id, text, evidence }) => ({
    id,
    text,
    evidence: evidence.map(({ id, text }) => ({ id, text })),
  }));
}

export function validateWildcards(value, { draft = false } = {}) {
  if (!Array.isArray(value) || value.length > 100) {
    throw new Error('Use at most 100 wildcards.');
  }
  const ids = new Set();
  for (const card of value) validateCard(card, 'Wildcard', ids, draft);
  return value.map(({ id, text }) => ({ id, text }));
}

export function restoreDeck(value, defaultWildcards = []) {
  const savedDeck = Array.isArray(value) ? { version: 2, myths: value, wildcards: defaultWildcards } : value;
  if (!savedDeck || savedDeck.version !== 2) throw new Error('Unsupported saved deck.');
  return {
    myths: validateDeck(savedDeck.myths, { draft: true }),
    wildcards: validateWildcards(savedDeck.wildcards, { draft: true }),
  };
}

export function makeCards(deck, wildcards = []) {
  const myths = deck.map(myth => ({
    id: myth.id,
    text: myth.text,
    type: 'myth',
    evidenceIds: myth.evidence.map(fact => fact.id),
  }));
  const evidence = deck.flatMap(myth => myth.evidence)
    .sort((a, b) => a.id - b.id)
    .map(fact => ({ ...fact, type: 'evidence' }));
  return [...myths, ...evidence, ...wildcards.map(card => ({ ...card, type: 'wildcard' }))];
}

export function paginate(cards) {
  const cardsPerPage = 9;
  return Array.from({ length: Math.ceil(cards.length / cardsPerPage) }, (_, index) =>
    cards.slice(index * cardsPerPage, (index + 1) * cardsPerPage));
}
