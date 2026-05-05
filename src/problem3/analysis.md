# Problem 3 - Issues & Fixes

## Bugs

1. `lhsPriority` is not defined. Only `balancePriority` exists. Use that.
2. Filter keeps balances with `amount <= 0` and drops the positive ones. Flip the check to `amount > 0`.
3. `balance.blockchain` is typed `any`. `WalletBalance` doesn't even declare the field. Add `blockchain: string` to the interface.
4. `rows` maps over `sortedBalances` but types each item as `FormattedWalletBalance`. `formatted` only exists on `formattedBalances`. Map over `formattedBalances` instead.
5. Sort comparator returns nothing when priorities are equal, so it returns `undefined`. Add a `return 0` (or just use `right - left`).

## Performance / anti-patterns

6. `prices` is in the `useMemo` deps but unused inside it - the memo recomputes on every price tick for nothing. Either drop it from the deps, or (better) fold the `usdValue` calculation into the same memo so `prices` actually earns its place there.
7. `getPriority` is recreated on every render and called twice per item while sorting. Hoist it out of the component, and ideally precompute the priority once per balance so the sort doesn't call it 2N log N times.
8. `formattedBalances` is computed inline on every render. Fold the formatting into the same `useMemo` that does the filter+sort.
9. `key={index}` is unstable across reorders, and this list literally sorts. Use `currency` or `${blockchain}:${currency}`.
10. `amount.toFixed()` with no digit count truncates to integer. Probably want 4 decimals for crypto, or a locale-aware formatter.
11. `interface Props extends BoxProps {}` is empty - just use `BoxProps`.
12. `children` is destructured but never rendered. Either render it or drop it.
13. The if/else comparator is verbose - `rightPriority - leftPriority` is enough and total.
