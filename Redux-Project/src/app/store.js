import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import counterReducer from '../features/counter/counterSlice';
import productsReducer from '../features/products/productsSlice';
import todosReducer from '../features/todos/todosSlice';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    counter: counterReducer,
    products: productsReducer,
    todos: todosReducer,
    user: userReducer,
  },
});
