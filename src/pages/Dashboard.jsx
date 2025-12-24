
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { setTransactions, addTransaction, setLastDeleted, clearLastDeleted } from '../features/transactions/transactionSlice';
import Navbar from '../components/Layout/Navbar';
import TransactionForm from '../components/Transactions/TransactionForm';
import BudgetForm from '../components/Transactions/BudgetForm'; 
import MonthlyTrendChart from '../components/Charts/MonthlyTrendChart';
import CategoryPieChart from '../components/Charts/CategoryPieChart';
import BudgetChart from '../components/Charts/BudgetChart'; 
import Button from '../components/UI/Button';
import { Download, Upload, Trash2, Edit, Undo2, Search, ChevronLeft, ChevronRight, ArrowUpDown, Wallet, AlertTriangle } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import useDebounce from '../hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items, lastDeletedTransaction } = useSelector(state => state.transactions);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false); 
  const [formType, setFormType] = useState('expense');
  const fileInputRef = useRef(null);
  
  // Data States
  const [budgets, setBudgets] = useState([]); 

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [filterType, setFilterType] = useState('all'); 
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' }); 

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction); 
    setIsFormOpen(true);                
  };

  //  listener for TRANSACTIONS 
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch(setTransactions(trans));
    });
    return () => unsubscribe();
  }, [user, dispatch]);

  //  listener for BUDGETS 
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'budgets'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const budgetList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBudgets(budgetList);
    });
    return () => unsubscribe();
  }, [user]);

  //  Process Budget vs Actual Data 
  const calculateBudgetProgress = () => {
    const spendingByCategory = items
      .filter(item => item.type === 'expense')
      .reduce((acc, curr) => {
        const cat = (curr.category || 'Uncategorized').toLowerCase().trim();
        acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount);
        return acc;
      }, {});

    return budgets.map(b => {
      const budgetCatKey = (b.category || '').toLowerCase().trim();
      const spent = spendingByCategory[budgetCatKey] || 0;
      const percentage = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return {
        ...b,
        spent,
        remaining: b.limit - spent,
        percentage,
        isOverBudget: spent > b.limit,
        isNearLimit: percentage >= 80 && spent <= b.limit 
      };
    });
  };

  const budgetMetrics = calculateBudgetProgress();

  //  Filtering & Sorting
  let processedItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  if (sortConfig.key) {
    processedItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  //  Pagination ---
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const paginatedItems = processedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, sortConfig]);

  //  Import/Undo ---
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach(row => {
          if (row.name && row.amount && row.date) {
             dispatch(addTransaction({
               transaction: {
                 name: row.name,
                 description: row.description || '',
                 amount: row.amount,
                 date: row.date,
                 type: row.type || 'expense', 
                 category: row.category || 'General'
               },
               uid: user.uid
             }));
          }
        });
      }
    });
  };

  const handleDelete = async (itemId) => {
    const itemToDelete = items.find(item => item.id === itemId);
    dispatch(setLastDeleted(itemToDelete));
    try {
      await deleteDoc(doc(db, 'transactions', itemId));
      toast.info("Transaction deleted"); 
    } catch (error) {
      toast.error("Could not delete item");
    }
    setTimeout(() => dispatch(clearLastDeleted()), 10000);
  };

  const handleUndo = () => {
    if (lastDeletedTransaction) {
      const { id, ...dataToRestore } = lastDeletedTransaction;
      dispatch(addTransaction({ transaction: dataToRestore, uid: user.uid }));
      dispatch(clearLastDeleted());
      toast.success("Transaction restored!"); 
    }
  };

  // Stats
  const totalIncome = items.filter(i => i.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalExpense = items.filter(i => i.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const currentBalance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Balance */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-4 border-indigo-500">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Current Balance</p>
            <h2 className={`text-3xl font-bold mt-2 ${currentBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              ${currentBalance.toFixed(2)}
            </h2>
          </motion.div>

          {/* Card 2: Income */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-4 border-green-500 flex flex-col justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Income</p>
              <h2 className="text-2xl font-bold text-green-500 mt-2">${totalIncome.toFixed(2)}</h2>
            </div>
            <Button onClick={() => { setFormType('income'); setIsFormOpen(true); }} variant="secondary" className="mt-4 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
              Add Income
            </Button>
          </motion.div>

          {/* Card 3: Expense */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-4 border-red-500 flex flex-col justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Expenses</p>
              <h2 className="text-2xl font-bold text-red-500 mt-2">${totalExpense.toFixed(2)}</h2>
            </div>
            <Button onClick={() => { setFormType('expense'); setIsFormOpen(true); }} variant="secondary" className="mt-4 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">
             Add Expense
            </Button>
          </motion.div>

          {/* Card 4: Budget Manager */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-4 border-purple-500 flex flex-col justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                 <Wallet size={16} /> Budget Manager
              </p>
              <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {budgets.length} Category Limits
              </h2>
            </div>
            <Button onClick={() => setIsBudgetFormOpen(true)} variant="secondary" className="mt-4 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300">
               Set Budget
            </Button>
          </motion.div>
        </div>

        {/* Budget Progress Section (WITH WARNING LOGIC) */}
        {budgets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
             {/* 1. Bar Chart: Actual vs Budget */}
             <BudgetChart data={budgetMetrics} />

             {/* 2. Progress Bars */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-y-auto max-h-[380px]">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Budget Progress</h3>
                <div className="space-y-6">
                  {budgetMetrics.map((b) => (
                    <div key={b.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium dark:text-white">{b.category}</span>
                        <span className={`font-medium ${b.isOverBudget ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                          ${b.spent.toFixed(0)} / ${b.limit.toFixed(0)}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(b.percentage, 100)}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${
                            b.isOverBudget ? 'bg-red-500' : 
                            b.isNearLimit ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                      
                      {/* Warning for 80% - 100% usage */}
                      {b.isNearLimit && (
                        <p className="text-xs text-orange-500 mt-1 flex items-center gap-1 font-medium italic">
                          <AlertTriangle size={12} /> Warning: You are close to your budget limit!
                        </p>
                      )}

                      {/* Error for 100%+ usage */}
                      {b.isOverBudget && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-bold">
                          <AlertTriangle size={12} /> Danger: Over budget by ${(b.spent - b.limit).toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MonthlyTrendChart data={items.filter(i => i.type === 'expense')} />
          <CategoryPieChart data={items.filter(i => i.type === 'expense')} />
        </div>

        {/* Advanced Filter Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
           <div className="flex gap-2 w-full md:w-auto">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
             <Button variant="secondary" onClick={handleImportClick} className="flex items-center gap-2 text-sm">
               <Upload size={16} /> Import CSV
             </Button>
             <Button variant="secondary" onClick={() => exportToCSV(items)} className="flex items-center gap-2 text-sm">
               <Download size={16} /> Export CSV
             </Button>
           </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="flex gap-2 items-center text-sm text-gray-600 dark:text-gray-300">
                <span className="hidden sm:inline">Sort by:</span>
                <button 
                  onClick={() => setSortConfig({ key: 'category', direction: sortConfig.key === 'category' && sortConfig.direction === 'desc' ? 'asc' : 'desc'   })}
                  className={`px-3 py-1.5 rounded-md border transition-colors ${!sortConfig.key ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent'}`}
                >
                  Category
                </button>
                <button 
                  onClick={() => setSortConfig({ key: 'date', direction: sortConfig.key === 'date' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                  className={`px-3 py-1.5 rounded-md border flex items-center gap-1 transition-colors ${sortConfig.key === 'date' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent'}`}
                >
                  Date <ArrowUpDown size={12} />
                </button>
                <button 
                  onClick={() => setSortConfig({ key: 'amount', direction: sortConfig.key === 'amount' && sortConfig.direction === 'desc' ? 'asc' : 'desc' })}
                  className={`px-3 py-1.5 rounded-md border flex items-center gap-1 transition-colors ${sortConfig.key === 'amount' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent'}`}
                >
                  Amount <ArrowUpDown size={12} />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-indigo-100">
            <table className="w-full text-left ">
              <thead className="bg-gray-50 dark:bg-slate-700/50  text-gray-600 dark:text-gray-300 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">{item.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium border ${item.type === 'income' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{item.date}</td>
                    <td className={`px-6 py-4 font-bold text-right ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.type === 'income' ? '+' : '-'}${parseFloat(item.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 flex justify-center space-x-2">
                      <button
                      onClick={() => {
                        setEditingTransaction(item); 
                        setFormType(item.type);      
                        setIsFormOpen(true);     
                      }}
                      className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Forms & Notifications */}
      {isFormOpen && <TransactionForm onClose={() => setIsFormOpen(false)} type={formType} transaction={editingTransaction} />}
      
      {/* Budget Form Modal */}
      {isBudgetFormOpen && <BudgetForm onClose={() => setIsBudgetFormOpen(false)} />}

      <AnimatePresence>
        {lastDeletedTransaction && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-indigo-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-50 border border-slate-700 dark:border-indigo-700"
          >
            <span className="text-sm font-medium">Transaction deleted</span>
            <div className="h-4 w-px bg-white/20"></div>
            <button onClick={handleUndo} className="flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 dark:text-indigo-200 dark:hover:text-white transition-colors">
              <Undo2 size={16} /> Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;