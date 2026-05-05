import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import swapReducer from './store/swap-slice';
import { SwapForm } from './swap-form';

const samplePriceRows = [
  { currency: 'ETH', date: '2024-01-01T00:00:00Z', price: 2000 },
  { currency: 'USDC', date: '2024-01-01T00:00:00Z', price: 1 },
  { currency: 'BTC', date: '2024-01-01T00:00:00Z', price: 60000 },
];

function renderSwapForm() {
  const store = configureStore({ reducer: { swap: swapReducer } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SwapForm />
      </QueryClientProvider>
    </Provider>,
  );
}

describe('SwapForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify(samplePriceRows), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        ),
      ),
    );
  });

  it('shows loading then renders the form with default tokens', async () => {
    renderSwapForm();
    expect(screen.getByText(/loading prices/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/^Swap$/)).toBeInTheDocument());
    expect(screen.getByLabelText(/amount to send/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount to receive/i)).toBeInTheDocument();
  });

  it('displays the indicative rate once tokens load', async () => {
    renderSwapForm();
    // ETH price / USDC price = 2000 / 1 = 2000
    await waitFor(() => expect(screen.getByText(/1 ETH/)).toBeInTheDocument());
    expect(screen.getByText(/2000 USDC/)).toBeInTheDocument();
  });

  it('mirrors typed amount across the two inputs at the rate', async () => {
    const user = userEvent.setup();
    renderSwapForm();
    const fromAmountInput = await screen.findByLabelText(/amount to send/i);
    await user.type(fromAmountInput, '0.5');
    const toAmountInput = screen.getByLabelText(/amount to receive/i) as HTMLInputElement;
    await waitFor(() => expect(toAmountInput.value).toBe('1000'));
  });

  it('blocks submit while amount is empty or invalid', async () => {
    const user = userEvent.setup();
    renderSwapForm();
    const submitButton = await screen.findByRole('button', { name: /confirm swap/i });
    await user.click(submitButton);
    await waitFor(() =>
      expect(screen.getByText(/enter an amount/i)).toBeInTheDocument(),
    );
  });

  it('swap-direction button flips inputs and tokens', async () => {
    const user = userEvent.setup();
    renderSwapForm();
    const fromAmountInput = await screen.findByLabelText(/amount to send/i);
    await user.type(fromAmountInput, '2');
    const toAmountInput = screen.getByLabelText(/amount to receive/i) as HTMLInputElement;
    await waitFor(() => expect(toAmountInput.value).toBe('4000'));

    const swapDirectionButton = screen.getByRole('button', { name: /swap direction/i });
    await user.click(swapDirectionButton);

    await waitFor(() => {
      expect((screen.getByLabelText(/amount to send/i) as HTMLInputElement).value).toBe('4000');
      expect((screen.getByLabelText(/amount to receive/i) as HTMLInputElement).value).toBe('2');
    });
  });
});
