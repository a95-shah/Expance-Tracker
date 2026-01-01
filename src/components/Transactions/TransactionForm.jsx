import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../../features/transactions/transactionSlice';
import { doc, updateDoc } from 'firebase/firestore'; 
import {db} from  '../../config/firebase'; 
import { toast } from 'react-toastify';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

const TransactionForm = ({ onClose, type, transaction }) => { 
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    amount: '', 
    category: type === 'expense' ? '' : 'Income', 
    date: new Date() 
  });
  
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name,
        description: transaction.description || '',
        amount: transaction.amount,
        category: transaction.category,
        date: new Date(transaction.date.replace(/-/g, '/')) 
      });
    } else {
      setFormData({ 
        name: '', 
        description: '', 
        amount: '', 
        category: type === 'expense' ? '' : 'Income', 
        date: new Date() 
      });
    }
  }, [transaction, type]);

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
    if (!formData.name || !formData.amount || (type === 'expense' && !formData.category)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const year = formData.date.getFullYear();
    const month = String(formData.date.getMonth() + 1).padStart(2, '0');
    const day = String(formData.date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const finalData = {
      ...formData,
      date: formattedDate,
      type,
      name: formData.name, 
      description: formData.description || "" 
    };

    onClose(); 

    try {
      if (transaction) {
        const ref = doc(db, "transactions", transaction.id);
        await updateDoc(ref, finalData);
        toast.success("Transaction updated successfully!");
      } else {

        await dispatch(addTransaction({ transaction: finalData, uid: user.uid })).unwrap();
        toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save transaction.");
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={`${transaction ? 'Edit' : 'Add'} ${type === 'income' ? 'Income' : 'Expense'}`}
    >
      <style>{`
        .no-spinner::-webkit-inner-spin-button, 
        .no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spinner {
          -moz-appearance: textfield;
        }
        .react-datepicker-wrapper { width: 100%; }
        .custom-datepicker {
           width: 100%;
           padding: 0.625rem 1rem;
           border-radius: 0.5rem;
           border: 1px solid #d1d5db;
           outline: none;
           background-color: white;
           color: #111827;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-4">

        <Input 
          label="Name"
          placeholder={type === 'income' ? "e.g. Salary, Freelance" : "e.g. Starbucks, Rent, Groceries"}
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />

        <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ($)</label>
            <input
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-lg border outline-none bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white no-spinner"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
            />
        </div>
        
        {type === 'expense' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <Select
                options={categoryOptions}
                value={categoryOptions.find(option => option.value === formData.category)}
                onChange={(selectedOption) => setFormData({...formData, category: selectedOption.value})}
                placeholder="Select a category..."
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
                required
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <DatePicker 
                selected={formData.date}
                onChange={(date) => setFormData({...formData, date: date})}
                className="w-full px-4 py-2.5 rounded-lg border outline-none bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                dateFormat="yyyy/MM/dd"
                maxDate={new Date()} 
                required
            />
        </div>

        <Button type="submit" className="w-full mt-4">
          {transaction ? 'Update Changes' : `Save ${type === 'income' ? 'Income' : 'Expense'}`}
        </Button>
      </form>
    </Modal>
  );
};

export default TransactionForm;