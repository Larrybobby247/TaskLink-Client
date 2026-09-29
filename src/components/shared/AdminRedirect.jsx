import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import HomePage from '../../pages/shared/HomePage.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function AdminRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  return user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <HomePage />;
}
