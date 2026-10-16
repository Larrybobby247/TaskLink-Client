import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.js';
import SearchBar from '../../components/admin/SearchBar.jsx';
import FilterChips from '../../components/admin/FilterChips.jsx';
import Pagination from '../../components/admin/Pagination.jsx';
import ConfirmModal from '../../components/admin/ConfirmModal.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { formatNaira } from '../../utils/money.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PAUSED', label: 'Paused' },
];

/**
 * New (gig marketplace feature, spec §14). Mirrors AdminTasksPage.jsx's
 * pattern exactly. Requires the three admin endpoints described in
 * ADMIN_AND_ROUTES_SNIPPETS.md (adminApi.listGigs / pauseGig / deleteGig -
 * add those methods to your admin.js API client the same way the existing
 * ones there are written).
 */
export default function AdminGigsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });
  const [confirmAction, setConfirmAction] = useState(null);

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    adminApi.listGigs({ q: q || undefined, status: status || undefined, page, limit: 15 })
      .then((res) => setState({ loading: false, items: res.data, ...res.pagination }));
  };
  useEffect(() => { load(1); }, [status]); // eslint-disable-line

  const onSearch = (e) => { e.preventDefault(); load(1); };

  const runAction = async () => {
    const { type, gig } = confirmAction;
    if (type === 'pause') await adminApi.pauseGig(gig._id);
    if (type === 'delete') await adminApi.deleteGig(gig._id);
    load(state.page);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Gigs</h1>
        <p className="text-sm text-gray-400">Moderate gig listings.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={q} onChange={setQ} onSubmit={onSearch} placeholder="Search gig titles..." /></div>
        <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </div>

      {state.loading ? (
        <TaskListSkeleton rows={8} />
      ) : state.items.length ? (
        <div className="space-y-3">
          {state.items.map((gig) => (
            <div key={gig._id} className="card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Link to={`/gigs/${gig._id}`} className="font-semibold text-brand-navy truncate hover:underline block">{gig.title}</Link>
                <p className="text-xs text-gray-400 mt-1">by @{gig.worker?.username} · {formatNaira(gig.startingPriceKobo)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={gig.status} />
                <div className="flex gap-2">
                  <button onClick={() => setConfirmAction({ type: 'pause', gig })} className="text-xs font-medium text-gray-500">Pause</button>
                  <button onClick={() => setConfirmAction({ type: 'delete', gig })} className="text-xs font-medium text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No gigs found" />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === 'pause' ? 'Pause gig' : 'Delete gig'}
          description={`This applies to "${confirmAction.gig.title}".`}
          danger={confirmAction.type === 'delete'}
          onConfirm={runAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
