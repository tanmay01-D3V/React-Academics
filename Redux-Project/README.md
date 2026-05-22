# Redux Toolkit Slice Lab

A complete Vite + React + Redux Toolkit lab for practicing modern Redux patterns.

## What this project teaches

- `configureStore` setup in `src/app/store.js`
- Feature-based slice folders in `src/features`
- Reducers and immutable updates powered by Immer
- Action payloads, `prepare` callbacks, and generated action creators
- Selectors for derived state
- Async flow with `createAsyncThunk`
- React bindings with `Provider`, `useDispatch`, and `useSelector`

## Lab slices

- `user`: login, logout, profile updates, preferences
- `counter`: increment, decrement, reset, increment by payload
- `todos`: add, toggle, delete, filter, clear completed
- `products`: mock async catalog fetch with pending, fulfilled, and rejected states
- `cart`: add, decrease quantity, remove, clear, derived totals

## Run it

```bash
npm install
npm run dev
```

## Practice tasks

1. Add a `notesSlice` with `addNote`, `pinNote`, and `deleteNote`.
2. Create a selector that returns only expensive cart items.
3. Add a rejected-state branch to `fetchProducts` by throwing an error conditionally.
4. Move repeated selector logic into each feature folder.
5. Open Redux DevTools and trace how every button dispatches an action.
