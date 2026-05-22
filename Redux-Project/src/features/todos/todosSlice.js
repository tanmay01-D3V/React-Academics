import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      id: 'todo-read',
      text: 'Open Redux DevTools and watch actions dispatch.',
      completed: true,
    },
    {
      id: 'todo-slice',
      text: 'Add a reducer to one slice and connect it to the UI.',
      completed: false,
    },
  ],
  filter: 'all',
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer: (state, action) => {
        state.items.unshift(action.payload);
      },
      prepare: (text) => ({
        payload: {
          id: nanoid(),
          text,
          completed: false,
        },
      }),
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find((item) => item.id === action.payload);

      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCompleted: (state) => {
      state.items = state.items.filter((item) => !item.completed);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

export const { addTodo, clearCompleted, deleteTodo, setFilter, toggleTodo } =
  todosSlice.actions;

export const selectVisibleTodos = (state) => {
  const { filter, items } = state.todos;

  if (filter === 'active') {
    return items.filter((todo) => !todo.completed);
  }

  if (filter === 'completed') {
    return items.filter((todo) => todo.completed);
  }

  return items;
};

export default todosSlice.reducer;
