import { configureStore } from "@reduxjs/toolkit";
import compareReducer from "./reducers/addToCompareReducer";
import wishListSlice from "./reducers/addToWishListReducer";
import currencyRed from "./reducers/currencyReducer";
import inputsReducer from "./reducers/inputsReducer";
import gridRed from "./reducers/gridReducer";

export const store = configureStore({
  reducer: {
    inputsReducer,
    addToWishListReducer: wishListSlice,
    addToCompareReducer: compareReducer,
    currencyReducer: currencyRed,
    gridReducer: gridRed,
  },
});
