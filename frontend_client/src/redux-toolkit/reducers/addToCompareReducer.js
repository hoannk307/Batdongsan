 
import { createSlice } from "@reduxjs/toolkit";

const initialState = { compareProducts: [] };

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    defineCompareProducts: (state, action) => {
      state.compareProducts = action.payload;
    },
    addCompareProducts: (state, action) => {
      if (!state.compareProducts.includes(action.payload)) {
        state.compareProducts.push(action.payload);
      }
    },
    removeCompareProducts: (state, action) => {
      state.compareProducts = state.compareProducts.filter(
        (product) => product !== action.payload
      );
    },
  },
});

export const { defineCompareProducts, addCompareProducts, removeCompareProducts } = compareSlice.actions;
export default compareSlice.reducer;