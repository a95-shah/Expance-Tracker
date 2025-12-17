import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { setUser, logoutUser } from './features/auth/authSlice';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        dispatch(setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        }));
      } else {
        dispatch(logoutUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <BrowserRouter>
    <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;