import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import AppLayout from '../../components/layout/AppLayout.jsx';
import PublicLayout from '../../components/public/PublicLayout.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import HomePage from '../shared/HomePage.jsx';
import LandingPage from './LandingPage.jsx';

/**
 * The "/" route. First-time visitors and logged-out users see the marketing
 * landing page; signed-in users go straight to their dashboard (the same
 * HomePage as before), so nothing changes for existing users.
 */
export default function RootGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner size={120} /></div>;
  }
  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
  }
  if (user) {
    return <AppLayout><HomePage /></AppLayout>;
  }
  return <PublicLayout><LandingPage /></PublicLayout>;
}
