// DealSleuth rendering: reads the deals, wires the controls, renders the cards.
// Filter state lives in the URL hash (e.g. #category=Audio&sort=discount) so a
// filtered view is a real, shareable state of the app, not a screenshot trick.
import { CHECKED_DATE, DEALS } from './deals.js';
import { applyFilters, discountOf, distinctValues, savingOf } from './filters.js';

const VERDICT_LABELS = {
  low: 'True deal',
  strong: 'Strong price',
  decent: 'Decent',
  routine: 'Routine',
};

const money = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const elements = {
  search: document.getElementById('search'),
  category: document.getElementById('category'),
  store: document.getElementById('store'),
  minDiscount: document.getElementById('min-discount'),
  sort: document.getElementById('sort'),
  reset: document.getElementById('reset'),
  deals: document.getElementById('deals'),
  empty: document.getElementById('empty'),
  count: document.getElementById('result-count'),
};

function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  return {
    query: params.get('q') ?? '',
    category: params.get('category') ?? '',
    store: params.get('store') ?? '',
    minDiscount: Number(params.get('min') ?? 0) || 0,
    sort: params.get('sort') ?? 'discount',
  };
}

function writeHash(filters) {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.category) params.set('category', filters.category);
  if (filters.store) params.set('store', filters.store);
  if (filters.minDiscount) params.set('min', String(filters.minDiscount));
  if (filters.sort !== 'discount') params.set('sort', filters.sort);
  const next = params.toString();
  history.replaceState(null, '', next ? `#${next}` : location.pathname);
}

function fillSelect(select, values) {
  for (const value of values) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
}

function dealCard(deal) {
  const pct = Math.round(discountOf(deal) * 100);
  const article = document.createElement('article');
  article.className = 'deal';
  article.innerHTML = `
    <div class="deal-top"><span>${deal.category}</span><span>${deal.store}</span></div>
    <h2></h2>
    <div class="price-row">
      <span class="sale"></span>
      <span class="usual"></span>
      <span class="off"></span>
    </div>
    <p class="save"></p>
    <span class="badge badge-${deal.verdict}"></span>
    <p class="note"></p>
    <p class="meta"></p>
    <a class="store-link" target="_blank" rel="noopener">View at ${deal.store} ↗</a>`;
  article.querySelector('h2').textContent = deal.name;
  article.querySelector('.sale').textContent = money(deal.sale);
  article.querySelector('.usual').textContent = money(deal.usual);
  article.querySelector('.off').textContent = `${pct}% off`;
  article.querySelector('.save').textContent = `You save ${money(savingOf(deal))}`;
  article.querySelector('.badge').textContent = VERDICT_LABELS[deal.verdict];
  article.querySelector('.note').textContent = deal.note;
  article.querySelector('.meta').textContent =
    `Checked ${CHECKED_DATE} · ${deal.source}`;
  article.querySelector('.store-link').href = deal.url;
  return article;
}

function renderStats() {
  const discounts = DEALS.map((deal) => discountOf(deal));
  const avg = Math.round((discounts.reduce((a, b) => a + b, 0) / discounts.length) * 100);
  const best = DEALS.reduce((a, b) => (savingOf(b) > savingOf(a) ? b : a));
  document.getElementById('stat-count').textContent = String(DEALS.length);
  document.getElementById('stat-avg').textContent = `${avg}%`;
  document.getElementById('stat-best').textContent = money(savingOf(best));
  document.getElementById('stat-stores').textContent = String(distinctValues(DEALS, 'store').length);
}

function currentFilters() {
  return {
    query: elements.search.value,
    category: elements.category.value,
    store: elements.store.value,
    minDiscount: Number(elements.minDiscount.value) || 0,
    sort: elements.sort.value,
  };
}

function render() {
  const filters = currentFilters();
  const visible = applyFilters(DEALS, filters);
  elements.deals.replaceChildren(...visible.map(dealCard));
  elements.empty.hidden = visible.length > 0;
  elements.count.textContent =
    visible.length === DEALS.length
      ? `Showing all ${DEALS.length} deals — sorted by ${elements.sort.selectedOptions[0].textContent.toLowerCase()}.`
      : `Showing ${visible.length} of ${DEALS.length} deals.`;
  writeHash(filters);
}

function syncControlsFromHash() {
  const filters = readHash();
  elements.search.value = filters.query;
  elements.category.value = filters.category;
  elements.store.value = filters.store;
  elements.minDiscount.value = String(filters.minDiscount);
  elements.sort.value = filters.sort;
}

fillSelect(elements.category, distinctValues(DEALS, 'category'));
fillSelect(elements.store, distinctValues(DEALS, 'store'));
syncControlsFromHash();
renderStats();
render();

for (const control of [elements.search, elements.category, elements.store, elements.minDiscount, elements.sort]) {
  control.addEventListener('input', render);
}
elements.reset.addEventListener('click', () => {
  elements.search.value = '';
  elements.category.value = '';
  elements.store.value = '';
  elements.minDiscount.value = '0';
  elements.sort.value = 'discount';
  render();
});
window.addEventListener('hashchange', () => {
  syncControlsFromHash();
  render();
});
