import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;