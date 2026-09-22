import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, Briefcase, User, Search, Wallet } from 'lucide-react';
import { useMode } from '../../context/ModeContext.jsx';

const clientLinks = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/client/tasks', label: 'My Tasks', icon: ClipboardList },
  { to: '/tasks/create', label: 'Post Task', icon: PlusCircle, primary: true },
  { to: '/client/orders', label: 'My Jobs', icon: Briefcase },
  { to: '/profile', label: 'Profile', icon: User },
];

const workerLinks = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/tasks', label: 'Find Tasks', icon: Search },
  { to: '/worker/jobs', label: 'My Jobs', icon: Briefcase, primary: true },
  { to: '/wallet', label: 'Earnings', icon: Wallet },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const { mode } = useMode();
  const links = mode === 'worker' ? workerLinks : clientLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 z-40 md:hidden">
      {links.map(({ to, label, icon: Icon, end, primary }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[11px] px-2 py-1 ${
              isActive ? 'text-brand-navy font-semibold' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) =>
            primary ? (
              <>
                <div className="w-11 h-11 rounded-full bg-brand-navy text-white flex items-center justify-center -mt-6 shadow-lg">
                  <Icon size={22} />
                </div>
                <span className={isActive ? 'text-brand-navy font-semibold' : 'text-gray-400'}>{label}</span>
              </>
            ) : (
              <>
                <Icon size={22} />
                <span>{label}</span>
              </>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
