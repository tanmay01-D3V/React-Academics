import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  step: 5,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    setStep: (state, action) => {
      state.step = Number(action.payload);
    },
    resetCounter: (state) => {
      state.value = 0;
    },
  },
});

export const { decrement, increment, incrementByAmount, resetCounter, setStep } =
  counterSlice.actions;

export default counterSlice.reducer;
