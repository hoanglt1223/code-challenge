import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTokensQuery, type Token } from './api/use-prices-query';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setFromToken, setToToken, swapTokens } from './store/swap-slice';
import { swapSchema, type SwapFormValues } from './schema/swap-schema';
import { TokenSelect } from './token-select';

type SwapSide = 'from' | 'to';
const SUBMIT_DELAY_MS = 1200;

function formatAmount(value: number, maxFractionDigits = 6): string {
  if (!isFinite(value) || value === 0) return '';
  return value.toLocaleString(undefined, {
    maximumFractionDigits: maxFractionDigits,
    useGrouping: false,
  });
}

export function SwapForm() {
  const dispatch = useAppDispatch();
  const { fromTokenSymbol, toTokenSymbol } = useAppSelector((state) => state.swap);
  const { data: tokens = [], isLoading, error } = useTokensQuery();

  const fromToken = useMemo<Token | null>(
    () => tokens.find((token) => token.symbol === fromTokenSymbol) ?? null,
    [tokens, fromTokenSymbol],
  );
  const toToken = useMemo<Token | null>(
    () => tokens.find((token) => token.symbol === toTokenSymbol) ?? null,
    [tokens, toTokenSymbol],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SwapFormValues>({
    resolver: zodResolver(swapSchema),
    defaultValues: { fromAmount: '', toAmount: '' },
    mode: 'onChange',
  });

  const fromAmount = watch('fromAmount');
  const toAmount = watch('toAmount');
  const [lastEditedSide, setLastEditedSide] = useState<SwapSide>('from');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens.length) return;
    if (!fromTokenSymbol) {
      const defaultFrom = tokens.find((token) => token.symbol === 'ETH') ?? tokens[0];
      dispatch(setFromToken(defaultFrom.symbol));
    }
    if (!toTokenSymbol) {
      const defaultTo = tokens.find((token) => token.symbol === 'USDC') ?? tokens[1] ?? tokens[0];
      dispatch(setToToken(defaultTo.symbol));
    }
  }, [tokens, fromTokenSymbol, toTokenSymbol, dispatch]);

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken) return null;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  useEffect(() => {
    if (exchangeRate == null) return;
    if (lastEditedSide === 'from') {
      const numericFromAmount = parseFloat(fromAmount);
      setValue(
        'toAmount',
        isNaN(numericFromAmount) ? '' : formatAmount(numericFromAmount * exchangeRate),
      );
    } else {
      const numericToAmount = parseFloat(toAmount);
      setValue(
        'fromAmount',
        isNaN(numericToAmount) ? '' : formatAmount(numericToAmount / exchangeRate),
      );
    }
  }, [exchangeRate, fromAmount, toAmount, lastEditedSide, setValue]);

  function handleSwapDirection() {
    dispatch(swapTokens());
    const previousFromAmount = fromAmount;
    setValue('fromAmount', toAmount);
    setValue('toAmount', previousFromAmount);
    setLastEditedSide((previous) => (previous === 'from' ? 'to' : 'from'));
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!fromToken || !toToken || fromToken.symbol === toToken.symbol) return;
    setIsSubmitting(true);
    setSuccessMessage(null);
    await new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS));
    setIsSubmitting(false);
    setSuccessMessage(
      `Swapped ${values.fromAmount} ${fromToken.symbol} → ${values.toAmount} ${toToken.symbol}`,
    );
    reset({ fromAmount: '', toAmount: '' });
  });

  if (isLoading) return <div className="card"><p>Loading prices…</p></div>;
  if (error) {
    return (
      <div className="card">
        <p className="error">Failed to load prices: {(error as Error).message}</p>
      </div>
    );
  }

  const isSameToken = fromToken && toToken && fromToken.symbol === toToken.symbol;

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
          aria-label="Amount to send"
          {...register('fromAmount', {
            onChange: (event) => {
              setLastEditedSide('from');
              event.target.value = event.target.value.replace(/[^\d.]/g, '');
            },
          })}
        />
        <TokenSelect
          tokens={tokens}
          value={fromToken}
          onChange={(token) => dispatch(setFromToken(token.symbol))}
          disabledSymbol={toToken?.symbol}
        />
      </fieldset>

      <button
        type="button"
        className="swap-toggle"
        onClick={handleSwapDirection}
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
          aria-label="Amount to receive"
          {...register('toAmount', {
            onChange: (event) => {
              setLastEditedSide('to');
              event.target.value = event.target.value.replace(/[^\d.]/g, '');
            },
          })}
        />
        <TokenSelect
          tokens={tokens}
          value={toToken}
          onChange={(token) => dispatch(setToToken(token.symbol))}
          disabledSymbol={fromToken?.symbol}
        />
      </fieldset>

      {fromToken && toToken && exchangeRate != null && (
        <p className="rate">
          1 {fromToken.symbol} ≈ {formatAmount(exchangeRate)} {toToken.symbol}
        </p>
      )}

      {isSameToken && <p className="error">Pick two different tokens.</p>}
      {errors.fromAmount && <p className="error">{errors.fromAmount.message}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <button
        type="submit"
        className="cta"
        disabled={isSubmitting || Boolean(isSameToken)}
      >
        {isSubmitting ? 'Swapping…' : 'Confirm Swap'}
      </button>
    </form>
  );
}
