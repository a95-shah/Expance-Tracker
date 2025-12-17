import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../features/ui/themeSlice';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
    >
      {mode === 'dark' ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-600" />}
    </button>
  );
};

export default ThemeToggle;