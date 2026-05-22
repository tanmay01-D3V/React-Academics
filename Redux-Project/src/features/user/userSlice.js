import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: 'Redux Learner',
  role: 'Frontend Student',
  isLoggedIn: true,
  theme: 'light',
  notificationsEnabled: true,
  accentColor: 'emerald',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.name = action.payload || 'Redux Learner';
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.name = '';
      state.isLoggedIn = false;
    },
    updateProfile: (state, action) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    setAccentColor: (state, action) => {
      state.accentColor = action.payload;
    },
  },
});

export const {
  login,
  logout,
  setAccentColor,
  toggleNotifications,
  toggleTheme,
  updateProfile,
} = userSlice.actions;

export default userSlice.reducer;
