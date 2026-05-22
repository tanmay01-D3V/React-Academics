import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  login,
  logout,
  setAccentColor,
  toggleNotifications,
  updateProfile,
} from '../features/user/userSlice';

const accentColors = ['emerald', 'indigo', 'rose'];

export default function UserLab() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [form, setForm] = useState({ name: user.name, role: user.role });

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(updateProfile(form));
  };

  return (
    <section className="lab-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Slice 1</p>
          <h2>User and preferences slice</h2>
        </div>
        <span className="status-pill">{user.isLoggedIn ? 'Logged in' : 'Logged out'}</span>
      </div>

      <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="field-label">
          Display name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Your name"
          />
        </label>
        <label className="field-label">
          Role
          <input
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            placeholder="Your role"
          />
        </label>
        <button className="primary-button sm:col-span-2" type="submit">
          Save profile to Redux
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-3">
        <button className="secondary-button" type="button" onClick={() => dispatch(login(form.name))}>
          Login
        </button>
        <button className="secondary-button" type="button" onClick={() => dispatch(logout())}>
          Logout
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => dispatch(toggleNotifications())}
        >
          Notifications {user.notificationsEnabled ? 'on' : 'off'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-700 theme-muted">Accent</span>
        {accentColors.map((color) => (
          <button
            className={`swatch swatch-${color} ${user.accentColor === color ? 'is-selected' : ''}`}
            key={color}
            type="button"
            aria-label={`Use ${color} accent`}
            onClick={() => dispatch(setAccentColor(color))}
          />
        ))}
      </div>
    </section>
  );
}
