import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Briefcase, MapPin, Plus, Eye, Bookmark, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useMode } from '../../context/ModeContext.jsx';
import { gigsApi } from '../../api/gigs.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatNaira } from '../../utils/money.js';

/* Worker Mode: "My Gigs" lives right on the profile page (spec 4.1 / 6.3). */
function MyGigsSection({ userId }) {
  const [state, setState] = useState({ loading: true, gigs: [], limit: null, error: '' });

  useEffect(() => {
    let cancelled = false;
    Promise.all([gigsApi.mine(), gigsApi.myLimit()])
      .then(([gigsRes, limitRes]) => {
        if (cancelled) return;
        setState({ loading: false, gigs: gigsRes?.data?.gigs || [], limit: limitRes?.data || null, error: '' });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ loading: false, gigs: [], limit: null, error: err?.message || 'Could not load your gigs.' });
      });
    return () => { cancelled = true; };
  }, []);

  const { loading, gigs, limit, error } = state;
  const count = (status) => gigs.filter((g) => g.status === status).length;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-brand-navy flex items-center gap-2"><Layers size={16} /> My Gigs</h3>
          {limit && (
            <p className="text-xs text-gray-400 mt-1">
              {limit.published} / {limit.limit} published
              {limit.remaining === 0 && <span className="text-orange-500 font-medium"> · limit reached</span>}
            </p>
          )}
        </div>
        <Link to="/worker/gigs/create" className="btn-primary text-sm py-2.5 px-4 flex items-center gap-1.5 shrink-0">
          <Plus size={16} /> Create New Gig
        </Link>
      </div>

      {limit?.remaining === 0 && (
        <p className="text-xs text-orange-700 bg-orange-50 rounded-lg p-3">
          You've reached your plan's published gig limit. <Link to="/settings/pro" className="font-semibold text-brand-blue">Upgrade to Pro</Link> to publish more.
        </p>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse"><div className="h-12 rounded-xl bg-gray-100" /><div className="h-12 rounded-xl bg-gray-100" /></div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : gigs.length === 0 ? (
        <p className="text-sm text-gray-500">You haven't created a gig yet. A gig lets clients find and hire you directly.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="chip bg-blue-50 text-blue-600">{count('PUBLISHED')} published</span>
            <span className="chip bg-gray-100 text-gray-600">{count('DRAFT')} draft</span>
            <span className="chip bg-yellow-50 text-yellow-700">{count('PAUSED')} paused</span>
          </div>

          <div className="space-y-2">
            {gigs.slice(0, 3).map((gig) => (
              <div key={gig._id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {gig.coverImage?.url ? <img src={gig.coverImage.url} className="w-full h-full object-cover" alt="" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-navy truncate">{gig.title}</p>
                  <p className="text-xs text-gray-400">{formatNaira(gig.startingPriceKobo)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={gig.status} />
                  <Link to={`/worker/gigs/${gig._id}/edit`} className="text-xs font-medium text-brand-blue">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-4 pt-1">
        <Link to="/worker/gigs" className="text-sm font-medium text-brand-blue">Manage all gigs</Link>
        <Link to={`/profile/${userId}`} className="text-sm font-medium text-brand-blue flex items-center gap-1"><Eye size={14} /> View Public Profile</Link>
      </div>
    </div>
  );
}

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
          <button type="button" onClick={() => setMode('client')} className={`flex-1 rounded-xl py-3 text-sm font-medium ${mode === 'client' ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>👤 Client</button>
          <button type="button" onClick={() => setMode('worker')} className={`flex-1 rounded-xl py-3 text-sm font-medium ${mode === 'worker' ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>🧑‍💻 Worker</button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Switching mode changes your navigation and homepage — your account stays the same.</p>
      </div>

      {mode === 'worker' && user?._id && <MyGigsSection userId={user._id} />}

      <div className="card divide-y divide-gray-100">
        <Link to="/settings" className="flex items-center justify-between p-4 text-sm">Edit settings <span>›</span></Link>
        <Link to="/wallet" className="flex items-center justify-between p-4 text-sm">Wallet <span>›</span></Link>
        {mode === 'client' && (
          <Link to="/saved-workers" className="flex items-center justify-between p-4 text-sm">
            <span className="flex items-center gap-2"><Bookmark size={16} /> Saved workers</span> <span>›</span>
          </Link>
        )}
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
