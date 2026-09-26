import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import SideMenu from './SideMenu.jsx';
import Logo from '../../assets/logo.png'

export default function TopBar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link to="/notifications" className="relative text-gray-500 hover:text-brand-navy">
            <Bell size={22} />
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
