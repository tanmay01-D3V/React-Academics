import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../features/user/userSlice';
import { selectCartCount } from '../features/cart/cartSlice';

export default function Header() {
  const dispatch = useDispatch();
  const { name, role, theme } = useSelector((state) => state.user);
  const cartCount = useSelector(selectCartCount);

  return (
    <header className="border-b border-black/10 bg-white/85 backdrop-blur theme-header">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Redux Toolkit Lab
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 md:text-4xl">
            Complete slices, store, selectors, and async thunk practice
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Logged in as {name || 'Guest'} / {role}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="status-pill">Cart items: {cartCount}</span>
          <button className="primary-button" type="button" onClick={() => dispatch(toggleTheme())}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </div>
    </header>
  );
}
