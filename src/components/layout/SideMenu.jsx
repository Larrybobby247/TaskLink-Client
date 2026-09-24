import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Home,
  ClipboardList,
  Briefcase,
  Wallet,
  MessageCircle,
  Bell,
  Bookmark,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  Crown,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';

export default function SideMenu({ open, onClose }) {
  const { user, logout } = useAuth();

  if (!open) return null;

  const items = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
    },
    {
      to: '/client/tasks',
      label: 'My Tasks',
      icon: ClipboardList,
    },
    {
      to: '/worker/jobs',
      label: 'My Jobs',
      icon: Briefcase,
    },
    {
      to: '/wallet',
      label: 'Wallet',
      icon: Wallet,
    },
    {
      to: '/messages',
      label: 'Messages',
      icon: MessageCircle,
    },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      to: '/tasks/saved',
      label: 'Saved',
      icon: Bookmark,
    },
    {
      to: '/profile',
      label: 'Reviews',
      icon: Star,
    },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]">

      {/* ---------------------------------------------------
          BACKDROP
      --------------------------------------------------- */}

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />


      {/* ---------------------------------------------------
          SIDE MENU
      --------------------------------------------------- */}

      <aside
        className="
          absolute
          top-0
          right-0
          h-[100dvh]
          w-[320px]
          max-w-[90vw]
          bg-white
          shadow-2xl
          flex
          flex-col
          overflow-hidden
          pb-20
        "
      >

        {/* -------------------------------------------------
            HEADER / USER
        ------------------------------------------------- */}

        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3 min-w-0">

              {/* Profile image */}
              {user?.profileImage?.url ? (
                <img
                  src={user.profileImage.url}
                  className="w-11 h-11 rounded-full object-cover shrink-0"
                  alt=""
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-brand-navy shrink-0">
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              {/* User information */}
              <div className="min-w-0">

                <p className="font-semibold text-brand-navy truncate">
                  {user?.fullName || 'User'}
                </p>

                <p className="text-xs text-gray-400 truncate">
                  @{user?.username || 'user'}
                </p>

              </div>

            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="
                w-9
                h-9
                rounded-full
                flex
                items-center
                justify-center
                hover:bg-gray-100
                text-gray-400
                shrink-0
              "
              aria-label="Close menu"
            >
              <X size={20} />
            </button>

          </div>

        </div>


        {/* -------------------------------------------------
            SCROLLABLE CONTENT
        ------------------------------------------------- */}

        <div className="flex-1 min-h-0 overflow-y-auto">

          <nav className="px-4 py-4 space-y-1">

            {/* Main menu */}
            {items.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className="
                  flex
                  items-center
                  gap-3
                  px-3
                  py-3
                  rounded-xl
                  text-gray-700
                  hover:bg-gray-50
                  hover:text-brand-navy
                  transition-colors
                "
              >
                <Icon
                  size={19}
                  strokeWidth={2}
                />

                <span className="text-sm font-medium">
                  {label}
                </span>
              </Link>
            ))}


            {/* Divider */}
            <div className="py-2">
              <hr className="border-gray-100" />
            </div>


            {/* Settings */}
            <Link
              to="/settings"
              onClick={onClose}
              className="
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-gray-700
                hover:bg-gray-50
                hover:text-brand-navy
                transition-colors
              "
            >
              <Settings
                size={19}
                strokeWidth={2}
              />

              <span className="text-sm font-medium">
                Settings
              </span>
            </Link>


            {/* Help */}
            <Link
              to="/help"
              onClick={onClose}
              className="
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-gray-700
                hover:bg-gray-50
                hover:text-brand-navy
                transition-colors
              "
            >
              <HelpCircle
                size={19}
                strokeWidth={2}
              />

              <span className="text-sm font-medium">
                Help & Support
              </span>
            </Link>


            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-gray-700
                hover:bg-gray-50
                hover:text-brand-navy
                transition-colors
                text-left
              "
            >
              <LogOut
                size={19}
                strokeWidth={2}
              />

              <span className="text-sm font-medium">
                Log Out
              </span>
            </button>

          </nav>

        </div>


        {/* -------------------------------------------------
            PRO UPGRADE
            Always visible at bottom
        ------------------------------------------------- */}

        {user?.plan !== 'PRO' && (
          <div className="shrink-0 p-4 border-t border-gray-100 bg-white">

            <Link
              to="/settings/pro"
              onClick={onClose}
              className="
                flex
                items-center
                gap-3
                w-full
                rounded-2xl
                p-4
                bg-brand-bg
                border
                border-brand-navy/5
                hover:bg-gray-100
                transition-colors
              "
            >

              {/* Crown */}
              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-white
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <Crown
                  size={20}
                  className="text-brand-navy"
                />
              </div>


              {/* Text */}
              <div className="min-w-0 flex-1">

                <p className="font-semibold text-sm text-brand-navy">
                  Upgrade to Pro
                </p>

                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Lower fees, priority support and more.
                </p>

              </div>

            </Link>

          </div>
        )}

      </aside>

    </div>
  );
}
