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

const ICON_BASE_URL =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

const ICON_OVERRIDES: Record<string, string> = {
  STEVMOS: 'EVMOS',
  RATOM: 'ATOM',
  STOSMO: 'OSMO',
  STLUNA: 'LUNA',
  STATOM: 'ATOM',
};

export function iconUrlFor(symbol: string): string {
  return `${ICON_BASE_URL}/${ICON_OVERRIDES[symbol] ?? symbol}.svg`;
}

export function parsePriceRows(rows: PriceRow[]): Token[] {
  const latestBySymbol = new Map<string, PriceRow>();
  for (const row of rows) {
    if (!row.price) continue;
    const previous = latestBySymbol.get(row.currency);
    if (!previous || new Date(row.date) > new Date(previous.date)) {
      latestBySymbol.set(row.currency, row);
    }
  }
  return Array.from(latestBySymbol.values())
    .map((row) => ({
      symbol: row.currency,
      price: row.price,
      iconUrl: iconUrlFor(row.currency),
    }))
    .sort((left, right) => left.symbol.localeCompare(right.symbol));
}
