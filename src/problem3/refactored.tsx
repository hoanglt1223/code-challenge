import React, { useMemo } from 'react';

// The original prompt assumes these symbols exist in the host app.
// Stubbed here so the snippet typechecks in isolation.
type BoxProps = React.HTMLAttributes<HTMLDivElement>;
declare const useWalletBalances: () => WalletBalance[];
declare const usePrices: () => Record<string, number>;
declare const classes: { row: string };
declare const WalletRow: React.ComponentType<{
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}>;

interface WalletBalance {
  currency: string;
  blockchain: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  priority: number;
  formatted: string;
  usdValue: number;
}

const PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number =>
  PRIORITY[blockchain] ?? -99;

type Props = BoxProps;

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return balances
      .filter(
        (balance) =>
          getPriority(balance.blockchain) > -99 && balance.amount > 0,
      )
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
        formatted: balance.amount.toFixed(4),
        usdValue: (prices[balance.currency] ?? 0) * balance.amount,
      }))
      .sort((left, right) => right.priority - left.priority);
  }, [balances, prices]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}:${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};

export default WalletPage;
