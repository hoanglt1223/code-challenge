import * as Select from '@radix-ui/react-select';
import type { Token } from './lib/parse-prices';

interface Props {
  tokens: Token[];
  value: Token | null;
  onChange: (t: Token) => void;
  disabledSymbol?: string;
}

export function TokenSelect({ tokens, value, onChange, disabledSymbol }: Props) {
  return (
    <Select.Root
      value={value?.symbol ?? ''}
      onValueChange={(symbol) => {
        const selected = tokens.find((token) => token.symbol === symbol);
        if (selected) onChange(selected);
      }}
    >
      <Select.Trigger className="token-button" aria-label="Token">
        {value ? (
          <>
            <img src={value.iconUrl} alt="" className="token-icon" />
            <Select.Value />
          </>
        ) : (
          <Select.Value placeholder="Select" />
        )}
        <Select.Icon className="chevron">▾</Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="token-dropdown" position="popper" sideOffset={6}>
          <Select.Viewport className="token-list">
            {tokens.map((token) => (
              <Select.Item
                key={token.symbol}
                value={token.symbol}
                disabled={token.symbol === disabledSymbol}
                className="token-option"
              >
                <img src={token.iconUrl} alt="" className="token-icon" />
                <Select.ItemText>
                  <span className="token-symbol">{token.symbol}</span>
                </Select.ItemText>
                <span className="token-price">
                  ${token.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
