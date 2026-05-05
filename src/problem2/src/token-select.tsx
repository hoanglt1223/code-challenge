import { useEffect, useMemo, useRef, useState } from 'react';
import type { Token } from './use-tokens';

interface Props {
  tokens: Token[];
  value: Token | null;
  onChange: (t: Token) => void;
  disabledSymbol?: string;
}

export function TokenSelect({ tokens, value, onChange, disabledSymbol }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return q ? tokens.filter((t) => t.symbol.includes(q)) : tokens;
  }, [tokens, query]);

  return (
    <div className="token-select" ref={ref}>
      <button
        type="button"
        className="token-button"
        onClick={() => setOpen((o) => !o)}
      >
        {value ? (
          <>
            <img src={value.iconUrl} alt="" className="token-icon" />
            <span>{value.symbol}</span>
          </>
        ) : (
          <span className="token-placeholder">Select</span>
        )}
        <span className="chevron">▾</span>
      </button>

      {open && (
        <div className="token-dropdown">
          <input
            autoFocus
            type="text"
            placeholder="Search token…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="token-search"
          />
          <ul className="token-list">
            {filtered.length === 0 && (
              <li className="token-empty">No tokens match.</li>
            )}
            {filtered.map((t) => {
              const disabled = t.symbol === disabledSymbol;
              return (
                <li key={t.symbol}>
                  <button
                    type="button"
                    className="token-option"
                    disabled={disabled}
                    onClick={() => {
                      onChange(t);
                      setOpen(false);
                      setQuery('');
                    }}
                  >
                    <img src={t.iconUrl} alt="" className="token-icon" />
                    <span className="token-symbol">{t.symbol}</span>
                    <span className="token-price">
                      ${t.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
