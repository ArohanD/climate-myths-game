export function validateDeck(value, { draft = false } = {}) {
  if (!Array.isArray(value) || (!draft && !value.length) || value.length > 100) throw new Error('Use between 1 and 100 myths.');
  const myths = new Set(), evidence = new Set();
  for (const myth of value) {
    if (!myth || !Number.isSafeInteger(myth.id) || myth.id < 1 || myths.has(myth.id)) throw new Error('Myth numbers must be unique positive integers.');
    myths.add(myth.id);
    if (typeof myth.text !== 'string' || (!draft && !myth.text.trim()) || myth.text.length > 2000) throw new Error(`Myth ${myth.id} needs text (maximum 2,000 characters).`);
    if (!Array.isArray(myth.evidence) || !myth.evidence.length || myth.evidence.length > 10) throw new Error(`Myth ${myth.id} needs 1–10 evidence cards.`);
    for (const fact of myth.evidence) {
      if (!fact || !Number.isSafeInteger(fact.id) || fact.id < 1 || evidence.has(fact.id)) throw new Error('Evidence numbers must be unique positive integers.');
      evidence.add(fact.id);
      if (typeof fact.text !== 'string' || (!draft && !fact.text.trim()) || fact.text.length > 2000) throw new Error(`Evidence ${fact.id} needs text (maximum 2,000 characters).`);
    }
  }
  return value.map(m=>({id:m.id,text:m.text,evidence:m.evidence.map(e=>({id:e.id,text:e.text}))}));
}
export function validateWildcards(value, { draft = false } = {}) {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Use at most 100 wildcards.');
  const ids = new Set();
  for (const card of value) {
    if (!card || !Number.isSafeInteger(card.id) || card.id < 1 || ids.has(card.id)) throw new Error('Wildcard numbers must be unique positive integers.');
    ids.add(card.id);
    if (typeof card.text !== 'string' || (!draft && !card.text.trim()) || card.text.length > 2000) throw new Error(`Wildcard ${card.id} needs text (maximum 2,000 characters).`);
  }
  return value.map(({id,text})=>({id,text}));
}
export function restoreDeck(value, defaultWildcards = []) {
  if (Array.isArray(value)) return { myths: validateDeck(value, {draft:true}), wildcards: validateWildcards(defaultWildcards, {draft:true}) };
  if (!value || value.version !== 2) throw new Error('Unsupported saved deck.');
  return { myths: validateDeck(value.myths, {draft:true}), wildcards: validateWildcards(value.wildcards, {draft:true}) };
}
export function makeCards(deck, wildcards = []) {
  return [...deck.map(m=>({id:m.id,text:m.text,type:'myth',evidenceIds:m.evidence.map(e=>e.id)})), ...deck.flatMap(m=>m.evidence).sort((a,b)=>a.id-b.id).map(e=>({...e,type:'evidence'})), ...wildcards.map(w=>({...w,type:'wildcard'}))];
}
export function paginate(cards) { return Array.from({length:Math.ceil(cards.length/9)},(_,i)=>cards.slice(i*9,i*9+9)); }
