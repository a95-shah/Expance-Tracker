import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;