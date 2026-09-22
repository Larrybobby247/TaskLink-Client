import React from 'react';
import { Link } from 'react-router-dom';
import { X, Home, ClipboardList, Briefcase, Wallet, MessageCircle, Bell, Bookmark, Star, Settings, HelpCircle, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SideMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  if (!open) return null;

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/client/tasks', label: 'My Tasks', icon: ClipboardList },
    { to: '/worker/jobs', label: 'My Jobs', icon: Briefcase },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/messages', label: 'Messages', icon: MessageCircle },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/tasks/saved', label: 'Saved', icon: Bookmark },
    { to: `/profile`, label: 'Reviews', icon: Star },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} className="w-11 h-11 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center font-semibold">{user?.fullName?.[0]}</div>
            )}
            <div>
              <p className="font-semibold text-brand-navy">{user?.fullName}</p>
              <p className="text-xs text-gray-400">@{user?.username}</p>
            </div>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <nav className="flex-1 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={onClose} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700">
              <Icon size={18} /> {label}
            </Link>
          ))}
          <hr className="my-2" />
          <Link to="/settings" onClick={onClose} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700">
            <Settings size={18} /> Settings
          </Link>
          <Link to="/help" onClick={onClose} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700">
            <HelpCircle size={18} /> Help & Support
          </Link>
          <button onClick={() => { logout(); onClose(); }} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 text-left">
            <LogOut size={18} /> Log Out
          </button>
        </nav>

        {user?.plan !== 'PRO' && (
          <Link to="/settings/pro" onClick={onClose} className="mt-4 bg-brand-bg rounded-xl p-4 flex items-center gap-3">
            <Crown size={20} className="text-brand-navy" />
            <div>
              <p className="font-semibold text-sm text-brand-navy">Upgrade to Pro</p>
              <p className="text-xs text-gray-500">Lower fees, priority support and more.</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
