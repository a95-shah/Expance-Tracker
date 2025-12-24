import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { logoutUser } from '../../features/auth/authSlice';
import ThemeToggle from '../UI/ThemeToggle';
import { LogOut, Wallet } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(logoutUser());
  };

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Expensify Logo"
              className="h-20 w-20 object-contain"
            />
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Expensify
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block font-medium">
              Welcome,  
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {user?.displayName || 'User'}
            </span>
            </span>
            <ThemeToggle />
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-500">
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;