import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function AdminRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={32} /></div>;
  
  // If user is admin, redirect to admin dashboard
  if (user && user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  
  // Otherwise redirect to home
  return <Navigate to="/" replace />;
}
