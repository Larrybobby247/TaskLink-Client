import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Briefcase, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useMode } from '../../context/ModeContext.jsx';

export default function ProfilePage() {
  const { user } = useAuth();
  const { mode, setMode } = useMode();

  return (
    <div className="space-y-5 pb-10">
      <div className="card p-6 text-center">
        {user?.profileImage?.url ? (
          <img src={user.profileImage.url} className="w-20 h-20 rounded-full object-cover mx-auto" alt="" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold mx-auto">{user?.fullName?.[0]}</div>
        )}
        <h1 className="font-bold text-lg text-brand-navy mt-3">{user?.fullName}</h1>
        <p className="text-sm text-gray-400">@{user?.username}</p>
        {user?.location && <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1"><MapPin size={12} /> {user.location}</p>}

        <div className="flex justify-center gap-6 mt-5">
          <div><p className="font-bold text-brand-navy">{user?.rating?.toFixed?.(1) || '—'}</p><p className="text-xs text-gray-400">Rating</p></div>
          <div><p className="font-bold text-brand-navy">{user?.completedTasksAsWorker || 0}</p><p className="text-xs text-gray-400">Jobs done</p></div>
          <div><p className="font-bold text-brand-navy">{user?.completedTasksAsClient || 0}</p><p className="text-xs text-gray-400">Tasks posted</p></div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy mb-3">Your TaskLink Mode</h3>
        <div className="flex gap-2">
          <button onClick={() => setMode('client')} className={`flex-1 rounded-xl py-3 text-sm font-medium ${mode === 'client' ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>👤 Client</button>
          <button onClick={() => setMode('worker')} className={`flex-1 rounded-xl py-3 text-sm font-medium ${mode === 'worker' ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>🧑‍💻 Worker</button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Switching mode changes your navigation and homepage — your account stays the same.</p>
      </div>

      <div className="card divide-y divide-gray-100">
        <Link to="/settings" className="flex items-center justify-between p-4 text-sm">Edit profile <span>›</span></Link>
        <Link to="/wallet" className="flex items-center justify-between p-4 text-sm">Wallet <span>›</span></Link>
        <Link to={`/reviews/${user?._id}`} className="flex items-center justify-between p-4 text-sm">
          <span className="flex items-center gap-2"><Star size={16} /> Reviews</span> <span>›</span>
        </Link>
        <Link to="/settings/worker-profile" className="flex items-center justify-between p-4 text-sm">
          <span className="flex items-center gap-2"><Briefcase size={16} /> Worker profile & portfolio</span> <span>›</span>
        </Link>
      </div>
    </div>
  );
}
