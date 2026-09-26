import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { notificationsApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import SideMenu from './SideMenu.jsx';
import Logo from '../../assets/logo.png'

export default function TopBar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadUnreadNotifications = async () => {
      try {
        const response = await notificationsApi.list();
        const notifications = Array.isArray(response.data)
          ? response.data
          : response.data?.notifications || [];

        if (mounted) {
          setUnreadNotifications(notifications.filter((notification) => !notification.isRead).length);
        }
      } catch {
        // The notification badge is non-critical; leave it hidden if loading fails.
      }
    };

    loadUnreadNotifications();
    const interval = window.setInterval(loadUnreadNotifications, 60_000);
    window.addEventListener('focus', loadUnreadNotifications);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', loadUnreadNotifications);
    };
  }, []);

  const notificationLabel = unreadNotifications > 99 ? '99+' : unreadNotifications;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} alt="logo" className='w-14'/>
          {/* <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center text-white font-bold">T</div>
          <span className="font-bold text-lg text-brand-navy">
            Task<span className="text-brand-blue">Link</span>
          </span> */}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/notifications"
            aria-label={unreadNotifications ? `${unreadNotifications} unread notifications` : 'Notifications'}
            className="relative text-gray-500 hover:text-brand-navy"
          >
            <Bell size={22} />
            {unreadNotifications > 0 && (
              <span className="absolute -right-2 -top-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center font-bold">
                {notificationLabel}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(true)} className="flex items-center gap-2">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                {user?.fullName?.[0] || '?'}
              </div>
            )}
            <Menu size={18} className="text-gray-400 hidden md:block" />
          </button>
        </div>
      </div>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
