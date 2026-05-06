import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SwapState {
  fromTokenSymbol: string | null;
  toTokenSymbol: string | null;
}

const initialState: SwapState = {
  fromTokenSymbol: null,
  toTokenSymbol: null,
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setFromToken(state, action: PayloadAction<string>) {
      state.fromTokenSymbol = action.payload;
    },
    setToToken(state, action: PayloadAction<string>) {
      state.toTokenSymbol = action.payload;
    },
    swapTokens(state) {
      [state.fromTokenSymbol, state.toTokenSymbol] = [
        state.toTokenSymbol,
        state.fromTokenSymbol,
      ];
    },
  },
});

export const { setFromToken, setToToken, swapTokens } = swapSlice.actions;
export default swapSlice.reducer;
