import { createSlice } from "@reduxjs/toolkit";

const initialState = { likedProducts: [] };

const wishListSlice = createSlice({
  name: "wishList",
  initialState,
  reducers: {
    defineLikedProducts: (state, action) => {
      state.likedProducts = action.payload;
    },
    like: (state, action) => {
      if (!state.likedProducts.includes(action.payload)) {
        state.likedProducts.push(action.payload);
      }
    },
    unlike: (state, action) => {
      state.likedProducts = state.likedProducts.filter((id) => id !== action.payload);
    },
  },
});

export const { defineLikedProducts, like, unlike } = wishListSlice.actions;
export default wishListSlice.reducer;
