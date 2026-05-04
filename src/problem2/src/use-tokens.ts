import { useEffect, useState } from 'react';
import { parsePriceRows, type PriceRow, type Token } from './parse-prices';

export type { Token };

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

export function useTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(PRICES_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<PriceRow[]>;
      })
      .then((rows) => {
        if (cancelled) return;
        setTokens(parsePriceRows(rows));
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message ?? 'Failed to load prices');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { tokens, loading, error };
}
