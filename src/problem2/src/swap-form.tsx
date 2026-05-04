import { useEffect, useMemo, useState } from 'react';
import { useTokens, type Token } from './use-tokens';
import { TokenSelect } from './token-select';

type Side = 'from' | 'to';

function formatAmount(n: number, max = 6): string {
  if (!isFinite(n) || n === 0) return '';
  return n.toLocaleString(undefined, {
    maximumFractionDigits: max,
    useGrouping: false,
  });
}

export function SwapForm() {
  const { tokens, loading, error } = useTokens();

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [lastEdited, setLastEdited] = useState<Side>('from');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens.length) return;
    if (!fromToken) setFromToken(tokens.find((t) => t.symbol === 'ETH') ?? tokens[0]);
    if (!toToken) setToToken(tokens.find((t) => t.symbol === 'USDC') ?? tokens[1] ?? tokens[0]);
  }, [tokens, fromToken, toToken]);

  const rate = useMemo(() => {
    if (!fromToken || !toToken) return null;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  useEffect(() => {
    if (rate == null) return;
    if (lastEdited === 'from') {
      const n = parseFloat(fromAmount);
      setToAmount(isNaN(n) ? '' : formatAmount(n * rate));
    } else {
      const n = parseFloat(toAmount);
      setFromAmount(isNaN(n) ? '' : formatAmount(n / rate));
    }
  }, [rate, fromAmount, toAmount, lastEdited]);

  const numericFrom = parseFloat(fromAmount);
  const validationError =
    !fromToken || !toToken
      ? null
      : fromToken.symbol === toToken.symbol
        ? 'Pick two different tokens.'
        : fromAmount && (isNaN(numericFrom) || numericFrom <= 0)
          ? 'Enter an amount greater than zero.'
          : null;

  const canSubmit =
    !submitting &&
    !validationError &&
    fromToken &&
    toToken &&
    numericFrom > 0 &&
    fromToken.symbol !== toToken.symbol;

  function swapSides() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setLastEdited((s) => (s === 'from' ? 'to' : 'from'));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSuccess(null);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(
      `Swapped ${fromAmount} ${fromToken!.symbol} → ${toAmount} ${toToken!.symbol}`,
    );
    setFromAmount('');
    setToAmount('');
  }

  if (loading) {
    return <div className="card"><p>Loading prices…</p></div>;
  }
  if (error) {
    return <div className="card"><p className="error">Failed to load prices: {error}</p></div>;
  }

  return (
    <form className="card" onSubmit={onSubmit} noValidate>
      <header className="card-header">
        <h1>Swap</h1>
        <p className="subtitle">Trade tokens at the latest indicative rate.</p>
      </header>

      <fieldset className="row">
        <legend>From</legend>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={fromAmount}
          onChange={(e) => {
            setLastEdited('from');
            setFromAmount(e.target.value.replace(/[^\d.]/g, ''));
          }}
          aria-label="Amount to send"
        />
        <TokenSelect
          tokens={tokens}
          value={fromToken}
          onChange={setFromToken}
          disabledSymbol={toToken?.symbol}
        />
      </fieldset>

      <button
        type="button"
        className="swap-toggle"
        onClick={swapSides}
        aria-label="Swap direction"
      >
        ⇅
      </button>

      <fieldset className="row">
        <legend>To</legend>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={toAmount}
          onChange={(e) => {
            setLastEdited('to');
            setToAmount(e.target.value.replace(/[^\d.]/g, ''));
          }}
          aria-label="Amount to receive"
        />
        <TokenSelect
          tokens={tokens}
          value={toToken}
          onChange={setToToken}
          disabledSymbol={fromToken?.symbol}
        />
      </fieldset>

      {fromToken && toToken && rate != null && (
        <p className="rate">
          1 {fromToken.symbol} ≈ {formatAmount(rate)} {toToken.symbol}
        </p>
      )}

      {validationError && <p className="error">{validationError}</p>}
      {success && <p className="success">{success}</p>}

      <button type="submit" className="cta" disabled={!canSubmit}>
        {submitting ? 'Swapping…' : 'Confirm Swap'}
      </button>
    </form>
  );
}
