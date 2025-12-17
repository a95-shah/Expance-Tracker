
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../../features/transactions/transactionSlice';
import { toast } from 'react-toastify';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';

const TransactionForm = ({ onClose, type }) => { 
  const [formData, setFormData] = useState({ 
    name: '', description: '', amount: '', 
    category: type === 'expense' ? '' : 'Income', 
    date: new Date().toISOString().split('T')[0] 
  });
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);


  const handleSubmit = async (e) => { 
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    
    try {
      await dispatch(addTransaction({ transaction: { ...formData, type }, uid: user.uid })).unwrap();
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      onClose();
    } catch (error) {
      toast.error("Failed to save transaction.");
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Add ${type === 'income' ? 'Income' : 'Expense'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <Input 
          label="Name"
          placeholder="e.g. Salary or Coffee"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />

        <Input 
          label="Description (Optional)"
          placeholder="Detailed notes"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
        
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category (Type to create)</label>
            <input 
              list="categories"
              className="w-full px-4 py-2.5 rounded-lg border outline-none bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              placeholder="e.g. Food, Travel"
            />
            <datalist id="categories">
              <option value="Food" />
              <option value="Transport" />
              <option value="Utilities" />
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

        <Button type="submit" className="w-full mt-4">Save Transaction</Button>
      </form>
    </Modal>
  );
};

export default TransactionForm;