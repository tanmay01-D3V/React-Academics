import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { catalog } from '../../data/catalog';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 650);
  });

  return catalog;
});

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { resetProducts } = productsSlice.actions;

export default productsSlice.reducer;
