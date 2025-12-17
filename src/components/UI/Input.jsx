import React from 'react';

const Input = ({ label, error, className = '', type = 'text', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-2.5 rounded-lg border outline-none transition-all duration-200
          bg-white dark:bg-slate-700 
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-400
          focus:ring-2 focus:ring-offset-0
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;