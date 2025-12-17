
import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  const root = window.document.documentElement;
  const isDark = theme === 'dark';
  root.classList.remove(isDark ? 'light' : 'dark');
  root.classList.add(theme);
  localStorage.setItem('theme', theme);
};

const initialState = {
  mode: getInitialTheme(),
};

// Apply initial theme immediately upon file load
applyTheme(initialState.mode);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      applyTheme(state.mode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;