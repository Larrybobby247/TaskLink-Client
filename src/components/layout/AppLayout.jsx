import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar.jsx';
import BottomNav from './BottomNav.jsx';
import NotificationPermissionPrompt from '../shared/NotificationPermissionPrompt.jsx';

// `children` lets RootGate render the shell around HomePage directly; every
// other route keeps using it as a layout route via <Outlet />.
export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-brand-bg pb-20 md:pb-0">
      <TopBar />
      <main className="max-w-6xl mx-auto px-4 py-4">
        {children ?? <Outlet />}
      </main>
      <BottomNav />
      <NotificationPermissionPrompt/>
    </div>
  );
}
