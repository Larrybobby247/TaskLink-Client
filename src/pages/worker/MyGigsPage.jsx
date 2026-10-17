import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Pause, Play, Trash2 } from 'lucide-react';
import { gigsApi } from '../../api/gigs.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { formatNaira } from '../../utils/money.js';

const TABS = [null, 'PUBLISHED', 'DRAFT', 'PAUSED'];

export default function MyGigsPage() {
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [limit, setLimit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [gigsRes, limitRes] = await Promise.all([gigsApi.mine(tab), gigsApi.myLimit()]);
      setGigs(gigsRes?.data?.gigs || []);
      setLimit(limitRes?.data || null);
    } catch (err) {
      setLoadError(err?.message || 'Could not load your gigs.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  // Publish/pause used to fail silently (e.g. when the plan limit was hit).
  const runAction = async (id, fn) => {
    setActionError('');
    setBusyId(id);
    try {
      await fn(id);
      await load();
    } catch (err) {
      setActionError(err?.errors?.[0]?.message || err?.message || 'That action failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => { await gigsApi.remove(id); await load(); };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">My Gigs</h1>
          {limit && (
            <p className="text-sm text-gray-400 mt-1">
              {limit.published} / {limit.limit} published
              {limit.remaining === 0 && <span className="text-orange-500 font-medium"> · limit reached</span>}
            </p>
          )}
        </div>
        <Link to="/worker/gigs/create" className="btn-primary text-sm flex items-center gap-1.5 py-2.5 px-4 shrink-0">
          <Plus size={16} /> Create Gig
        </Link>
      </div>

      {limit?.remaining === 0 && (
        <div className="card p-4 bg-orange-50 border-orange-100 flex items-center justify-between gap-3">
          <p className="text-sm text-orange-700">You've reached your plan's published gig limit ({limit.limit}).</p>
          <Link to="/settings/pro" className="text-sm font-semibold text-brand-blue whitespace-nowrap">Upgrade to Pro</Link>
        </div>
      )}

      {actionError && (
        <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg p-3 flex items-start justify-between gap-3">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError('')} className="text-red-400 font-semibold">×</button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t || 'all'} type="button" onClick={() => setTab(t)} className={`chip whitespace-nowrap ${tab === t ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            {t ? t.charAt(0) + t.slice(1).toLowerCase() : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <TaskListSkeleton />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={load} />
      ) : gigs.length ? (
        <div className="space-y-3">
          {gigs.map((gig) => (
            <div key={gig._id} className="card p-4 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {gig.coverImage?.url ? <img src={gig.coverImage.url} className="w-full h-full object-cover" alt="" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-navy truncate">{gig.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 mb-1">{formatNaira(gig.startingPriceKobo)} · {gig.deliveryDays}d delivery</p>
                <StatusBadge status={gig.status} />
              </div>
              <div className="flex flex-col gap-1.5 items-end shrink-0">
                <Link to={`/worker/gigs/${gig._id}/edit`} className="text-xs font-medium text-brand-blue">Edit</Link>
                {gig.status === 'PUBLISHED' ? (
                  <button type="button" disabled={busyId === gig._id} onClick={() => runAction(gig._id, gigsApi.pause)} className="text-xs font-medium text-gray-500 flex items-center gap-1 disabled:opacity-50"><Pause size={12} /> Pause</button>
                ) : (
                  <button type="button" disabled={busyId === gig._id} onClick={() => runAction(gig._id, gigsApi.publish)} className="text-xs font-medium text-green-600 flex items-center gap-1 disabled:opacity-50"><Play size={12} /> Publish</button>
                )}
                <Link to={`/gigs/${gig._id}`} className="text-xs font-medium text-gray-400 flex items-center gap-1"><Eye size={12} /> Preview</Link>
                <button type="button" onClick={() => setConfirmDelete(gig)} className="text-xs font-medium text-red-500 flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={tab ? `No ${tab.toLowerCase()} gigs` : 'No gigs yet'}
          subtitle="Create your first gig to start getting discovered by clients."
          action={<Link to="/worker/gigs/create" className="btn-primary">Create Gig</Link>}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete this gig?"
          description={`"${confirmDelete.title}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => remove(confirmDelete._id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
