import { createSlice } from "@reduxjs/toolkit";

const initialState = { gridSize: "2", gridStyle: "" };

const gridSlice = createSlice({
  name: "grid",
  initialState,
  reducers: {
    setGridSize: (state, action) => {
      state.gridSize = action.payload;
    },
    setGridStyle: (state, action) => {
      state.gridStyle = action.payload;
    },
  },
});

export const { setGridSize, setGridStyle } = gridSlice.actions;
export default gridSlice.reducer;
