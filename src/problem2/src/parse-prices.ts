export interface Token {
  symbol: string;
  price: number;
  iconUrl: string;
}

export interface PriceRow {
  currency: string;
  date: string;
  price: number;
}

const ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

const ICON_OVERRIDES: Record<string, string> = {
  STEVMOS: 'EVMOS',
  RATOM: 'ATOM',
  STOSMO: 'OSMO',
  STLUNA: 'LUNA',
  STATOM: 'ATOM',
};

export function iconUrlFor(symbol: string): string {
  return `${ICON_BASE}/${ICON_OVERRIDES[symbol] ?? symbol}.svg`;
}

export function parsePriceRows(rows: PriceRow[]): Token[] {
  const latest = new Map<string, PriceRow>();
  for (const row of rows) {
    if (!row.price) continue;
    const prev = latest.get(row.currency);
    if (!prev || new Date(row.date) > new Date(prev.date)) {
      latest.set(row.currency, row);
    }
  }
  return Array.from(latest.values())
    .map((row) => ({
      symbol: row.currency,
      price: row.price,
      iconUrl: iconUrlFor(row.currency),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}
