import { useQuery } from '@tanstack/react-query';
import { parsePriceRows, type PriceRow, type Token } from '../lib/parse-prices';

export type { Token };

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

export function useTokensQuery() {
  return useQuery({
    queryKey: ['prices'],
    queryFn: async (): Promise<Token[]> => {
      const response = await fetch(PRICES_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = (await response.json()) as PriceRow[];
      return parsePriceRows(rows);
    },
    staleTime: 60_000,
  });
}
