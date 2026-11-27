// Pure deal filtering and sorting for DealSleuth. No DOM here, so the rules are
// easy to test: given the deals and a filter state, return the visible deals.
export function discountOf(deal) {
  return (deal.usual - deal.sale) / deal.usual;
}

export function savingOf(deal) {
  return deal.usual - deal.sale;
}

export function matches(deal, filters) {
  if (filters.category && deal.category !== filters.category) return false;
  if (filters.store && deal.store !== filters.store) return false;
  if (filters.minDiscount > 0 && discountOf(deal) * 100 < filters.minDiscount) return false;
  if (filters.query) {
    const hay = `${deal.name} ${deal.store} ${deal.category} ${deal.note}`.toLowerCase();
    const words = filters.query.toLowerCase().trim().split(/\s+/);
    if (!words.every((word) => hay.includes(word))) return false;
  }
  return true;
}

export function sortDeals(deals, sortKey) {
  const list = [...deals];
  switch (sortKey) {
    case 'saving':
      return list.sort((a, b) => savingOf(b) - savingOf(a));
    case 'price-asc':
      return list.sort((a, b) => a.sale - b.sale);
    case 'price-desc':
      return list.sort((a, b) => b.sale - a.sale);
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'discount':
    default:
      return list.sort((a, b) => discountOf(b) - discountOf(a));
  }
}

export function applyFilters(deals, filters) {
  return sortDeals(deals.filter((deal) => matches(deal, filters)), filters.sort);
}

export function distinctValues(deals, field) {
  return [...new Set(deals.map((deal) => deal[field]))].sort();
}
