import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, BadgeCheck, Briefcase, MessageCircle } from 'lucide-react';
import { workersApi } from '../../api/users.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';

/**
 * Public profile view for ANY user (worker or client) - used when a client
 * wants to check out an applicant before accepting them, but also works for
 * viewing any TaskLink member by id or username (workersApi.get hits
 * GET /api/workers/:id, which resolves either).
 */
export default function PublicProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    workersApi.get(id).then((res) => setData(res.data)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const { user, workerProfile } = data;

  return (
    <div className="space-y-5 pb-10">
      <div className="card p-6 text-center">
        {user.profileImage?.url ? (
          <img src={user.profileImage.url} className="w-24 h-24 rounded-full object-cover mx-auto" alt="" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold mx-auto">{user.fullName?.[0]}</div>
        )}
        <h1 className="font-bold text-lg text-brand-navy mt-3 flex items-center justify-center gap-1.5">
          {user.fullName}
          {user.identityVerified && <BadgeCheck size={18} className="text-brand-blue" />}
        </h1>
        <p className="text-sm text-gray-400">@{user.username}</p>
        {user.location && <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1"><MapPin size={12} /> {user.location}</p>}
        {workerProfile?.headline && <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto">{workerProfile.headline}</p>}
        {user.bio && <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">{user.bio}</p>}

        <div className="flex justify-center gap-6 mt-5">
          <div><p className="font-bold text-brand-navy flex items-center gap-1 justify-center"><Star size={14} className="text-yellow-500" /> {user.rating?.toFixed?.(1) || '—'}</p><p className="text-xs text-gray-400">{user.reviewCount || 0} reviews</p></div>
          <div><p className="font-bold text-brand-navy">{user.completedTasksAsWorker || 0}</p><p className="text-xs text-gray-400">Jobs done</p></div>
          <div><p className="font-bold text-brand-navy">{user.completedTasksAsClient || 0}</p><p className="text-xs text-gray-400">Tasks posted</p></div>
        </div>

        <Link to={`/reviews/${user._id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue mt-5">
          <MessageCircle size={15} /> View all reviews
        </Link>
      </div>

      {workerProfile?.skills?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-brand-navy mb-3 flex items-center gap-2"><Briefcase size={16} /> Skills</h3>
          <div className="flex flex-wrap gap-2">
            {workerProfile.skills.map((s) => <span key={s} className="chip bg-brand-bg text-brand-navy">{s}</span>)}
          </div>
        </div>
      )}

      {workerProfile?.portfolio?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-brand-navy mb-3">Portfolio</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {workerProfile.portfolio.map((item) => (
              <div key={item._id} className="rounded-xl overflow-hidden border border-gray-100">
                {item.image?.url && <img src={item.image.url} alt={item.title} className="w-full h-24 object-cover" />}
                <div className="p-2">
                  <p className="text-xs font-medium text-brand-navy truncate">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
