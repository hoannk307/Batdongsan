import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currency: "USD",
  name: "dollar",
  symbol: "$",
  currencyValue: 1,
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    currencyChange: (state, action) => {
      const { currency, name, symbol, value } = action.payload;
      state.currency = currency;
      state.name = name;
      state.symbol = symbol;
      state.currencyValue = value;
    },
  },
});

export const { currencyChange } = currencySlice.actions;
export default currencySlice.reducer;
