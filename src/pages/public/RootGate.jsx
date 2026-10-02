import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import AppLayout from '../../components/layout/AppLayout.jsx';
import PublicLayout from '../../components/public/PublicLayout.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import HomePage from '../shared/HomePage.jsx';
import LandingPage from './LandingPage.jsx';

export default function RootGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={80} />
      </div>
    );
  }

  if (!user) {
    return (
      <PublicLayout>
        <LandingPage />
      </PublicLayout>
    );
  }

  if (!user.emailVerified) {
    return (
      <Navigate
        to="/verify-email"
        state={{ email: user.email }}
        replace
      />
    );
  }

  // FIX: role is stored as 'ADMIN' (uppercase) on the backend - see
  // server/src/models/User.js (`role: { enum: ['USER', 'ADMIN'] }`). The
  // previous lowercase check never matched, so admins always fell through
  // to the regular HomePage.
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  );
}
