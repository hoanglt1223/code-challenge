import { describe, it, expect } from 'vitest';
import { parsePriceRows, iconUrlFor, type PriceRow } from './parse-prices';

describe('parsePriceRows', () => {
  it('drops rows with no price', () => {
    const rows: PriceRow[] = [
      { currency: 'A', date: '2024-01-01T00:00:00Z', price: 0 },
      { currency: 'B', date: '2024-01-01T00:00:00Z', price: 1 },
    ];
    const tokens = parsePriceRows(rows);
    expect(tokens.map((t) => t.symbol)).toEqual(['B']);
  });

  it('keeps the latest price per symbol', () => {
    const rows: PriceRow[] = [
      { currency: 'ETH', date: '2024-01-01T00:00:00Z', price: 2000 },
      { currency: 'ETH', date: '2024-06-01T00:00:00Z', price: 3000 },
      { currency: 'ETH', date: '2024-03-01T00:00:00Z', price: 2500 },
    ];
    const [eth] = parsePriceRows(rows);
    expect(eth.price).toBe(3000);
  });

  it('sorts symbols alphabetically', () => {
    const rows: PriceRow[] = [
      { currency: 'ZIL', date: '2024-01-01T00:00:00Z', price: 0.05 },
      { currency: 'ATOM', date: '2024-01-01T00:00:00Z', price: 10 },
      { currency: 'ETH', date: '2024-01-01T00:00:00Z', price: 2000 },
    ];
    expect(parsePriceRows(rows).map((t) => t.symbol)).toEqual(['ATOM', 'ETH', 'ZIL']);
  });

  it('returns empty for empty input', () => {
    expect(parsePriceRows([])).toEqual([]);
  });
});

describe('iconUrlFor', () => {
  it('uses the symbol as the icon name by default', () => {
    expect(iconUrlFor('ETH')).toMatch(/\/ETH\.svg$/);
  });

  it('remaps staked variants to the underlying asset', () => {
    expect(iconUrlFor('STATOM')).toMatch(/\/ATOM\.svg$/);
    expect(iconUrlFor('RATOM')).toMatch(/\/ATOM\.svg$/);
    expect(iconUrlFor('STEVMOS')).toMatch(/\/EVMOS\.svg$/);
  });
});
