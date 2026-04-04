import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggleButton = ({ className = '', variant = 'default' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === 'dark';

  const baseClassName =
    variant === 'compact'
      ? `inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${
          isDarkTheme
            ? 'border-cyan-300/15 bg-[#0d1530] text-slate-100 hover:border-cyan-300/30 hover:bg-[#111938]'
            : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-cyan-400 hover:text-slate-900'
        }`
      : `inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
          isDarkTheme
            ? 'border-cyan-300/15 bg-[#0d1530] text-slate-100 hover:border-cyan-300/30 hover:bg-[#111938]'
            : 'border-slate-300 bg-white text-slate-700 shadow-sm hover:border-cyan-400 hover:text-slate-900'
        }`;

  return (
    <button
      type='button'
      onClick={toggleTheme}
      className={`${baseClassName} ${className}`.trim()}
      aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkTheme ? 'light' : 'dark'} mode`}
    >
      {isDarkTheme ? <FaSun className='text-base' /> : <FaMoon className='text-base' />}
      {variant !== 'compact' && <span>{isDarkTheme ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
};

export default ThemeToggleButton;