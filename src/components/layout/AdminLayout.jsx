import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, Receipt, Banknote, ShieldAlert, Flag, Settings, ScrollText, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../../assets/logo.png'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { to: '/admin/withdrawals', label: 'Withdrawals', icon: Banknote },
  { to: '/admin/disputes', label: 'Disputes', icon: ShieldAlert },
  { to: '/admin/reports', label: 'Reports', icon: Flag },
  { to: '/admin/activity-log', label: 'Activity Log', icon: ScrollText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },

];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-brand-navy text-white shrink-0 min-h-screen">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          {/* <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold">T</div> */}
          <div>
            {/* <p className="font-bold leading-tight">TaskLink</p> */}
            <img src={Logo} alt="logo" className='w-22 lg:w-24'/>
            <p className="text-[11px] text-white/50 leading-tight">Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-white/10 font-semibold' : 'text-white/70 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <Link to="/" className="block text-xs text-white/50 px-3 mb-2">← Back to app</Link>
          <div className="flex items-center gap-2 px-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
              {user?.fullName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
            </div>
            <button onClick={logout} title="Log out" className="text-white/50 hover:text-white">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-brand-navy text-white px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="font-bold">TaskLink Admin</Link>
        <Link to="/" className="text-xs text-white/70">Back to app</Link>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 flex overflow-x-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] shrink-0 ${isActive ? 'text-brand-navy font-semibold' : 'text-gray-400'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 min-w-0 px-4 py-5 md:px-8 md:py-8 mt-14 mb-16 md:mt-0 md:mb-0">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
