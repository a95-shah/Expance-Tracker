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
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <input 
              type="text" 
              placeholder="Enter category..."
              className="w-full px-4 py-2.5 rounded-lg border outline-none bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
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