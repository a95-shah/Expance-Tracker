import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useSelector } from 'react-redux';
import Button from '../UI/Button';
import { toast } from 'react-toastify';
import Select from 'react-select';

const BudgetForm = ({ onClose }) => {
  const { user } = useSelector(state => state.auth);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    { value: 'Food', label: 'Food' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Health', label: 'Health' },
    { value: 'Education', label: 'Education' },
    { value: 'Housing', label: 'Housing' },
    { value: 'Other', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !limit) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

      const q = query(
        collection(db, 'budgets'), 
        where('uid', '==', user.uid),
        where('category', '==', formattedCategory)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { 
            limit: parseFloat(limit),
            category: formattedCategory 
        });
        toast.success(`Budget for ${formattedCategory} updated!`);
      } else {
        await addDoc(collection(db, 'budgets'), {
          uid: user.uid,
          category: formattedCategory,
          limit: parseFloat(limit),
          createdAt: new Date().toISOString()
        });
        toast.success(`Budget for ${formattedCategory} set!`);
      }
      onClose();
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Failed to save budget.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <style>{`
        .no-spinner::-webkit-inner-spin-button, 
        .no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold dark:text-white">Set Monthly Budget</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
            <Select
                options={categoryOptions}
                value={categoryOptions.find(opt => opt.value === category)}
                onChange={(option) => setCategory(option.value)}
                placeholder="Select category..."
                menuPosition="fixed"
                menuPlacement="auto"
                maxMenuHeight={250}
                classNames={{
                    control: () => "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded-lg",
                    singleValue: () => "!text-gray-900 dark:!text-white", 
                    input: () => "text-gray-900 dark:text-white",
                    placeholder: () => "text-gray-500 dark:text-gray-400",
                    menu: () => "!bg-gray-50 dark:!bg-slate-700 shadow-lg border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden",
                    menuList: () => "py-1 !bg-gray-50 dark:!bg-slate-700",
                    option: ({ isFocused, isSelected }) => 
                        `${isSelected ? "!bg-blue-500 !text-white" : isFocused ? "!bg-gray-200 dark:!bg-slate-600 !text-gray-900 dark:!text-white" : "!text-gray-900 dark:!text-white"} cursor-pointer px-3 py-2`
                }}
                styles={{
                    control: (base) => ({
                        ...base,
                        backgroundColor: 'transparent',
                        minHeight: '42px',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#9ca3af' }
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        backgroundColor: 'transparent'
                    }),
                    menuList: (base) => ({
                        ...base,
                        backgroundColor: 'transparent'
                    }),
                    option: (base) => ({
                        ...base,
                        backgroundColor: 'transparent'
                    }),
                    menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999
                    })
                }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Limit ($)</label>
            <input 
              type="number" 
              placeholder="0.00"
              className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white no-spinner outline-none focus:ring-2 focus:ring-blue-500/20"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full justify-center">
              {loading ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BudgetForm;