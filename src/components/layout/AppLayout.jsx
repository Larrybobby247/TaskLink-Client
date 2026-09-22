import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar.jsx';
import BottomNav from './BottomNav.jsx';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-brand-bg pb-20 md:pb-0">
      <TopBar />
      <main className="max-w-6xl mx-auto px-4 py-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
