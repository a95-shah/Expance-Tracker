import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            /* 👇 Added max-h-[90vh] and flex-col */
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header - Fixed at top */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body - Made Scrollable 👇 */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;