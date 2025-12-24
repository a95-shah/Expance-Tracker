
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../../features/transactions/transactionSlice';
import { toast } from 'react-toastify';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';

const TransactionForm = ({ onClose, type }) => { 
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    amount: '', 
    category: type === 'expense' ? '' : 'Income', 
    date: new Date().toISOString().split('T')[0] 
  });
  
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

const handleSubmit = (e) => { 
    e.preventDefault();

    const isInvalidIncome = type === 'income' && !formData.name;
    const isInvalidExpense = type === 'expense' && !formData.category;
    
    if (isInvalidIncome || isInvalidExpense || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const finalData = {
      ...formData,
      type,
      name: type === 'expense' ? formData.category : formData.name,
      description: "" 
    };

    onClose();

    dispatch(addTransaction({ transaction: finalData, uid: user.uid }))
      .unwrap()
      .then(() => {
        toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to save transaction.");
      });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Add ${type === 'income' ? 'Income' : 'Expense'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {type === 'income' && (
          <Input 
            label="Name"
            placeholder="e.g. Salary, Freelance, Bonus"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        )}

        <Input 
          label="Amount ($)"
          type="number"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          required
        />
        
        {type === 'expense' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <input 
              list="categories"
              className="w-full px-4 py-2.5 rounded-lg border outline-none bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="e.g. Food, Travel"
              required
            />
            <datalist id="categories">
              <option value="Food" />
              <option value="Transport" />
              <option value="Utilities" />
              <option value="Entertainment" />
              <option value="Shopping" />
            </datalist>
          </div>
        )}

        <Input 
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required
        />

        <Button type="submit" className="w-full mt-4">
          Save {type === 'income' ? 'Income' : 'Expense'}
        </Button>
      </form>
    </Modal>
  );
};

export default TransactionForm;