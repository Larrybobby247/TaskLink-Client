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

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
];

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    adminApi.searchUsers({ q: q || undefined, status: status || undefined, page, limit: 15 })
      .then((res) => setState({ loading: false, items: res.data, ...res.pagination }))
      .catch(() => setState((s) => ({ ...s, loading: false })));
  };

  useEffect(() => { load(1); }, [status]); // eslint-disable-line

  const onSearch = (e) => { e.preventDefault(); load(1); };

  const runAction = async () => {
    const { type, user } = confirmAction;
    if (type === 'verify') await adminApi.verifyUser(user._id);
    if (type === 'suspend') await adminApi.suspendUser(user._id, confirmAction.reason);
    if (type === 'unsuspend') await adminApi.unsuspendUser(user._id);
    if (type === 'deactivate') await adminApi.deactivateUser(user._id);
    load(state.page);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-navy">Users</h1>
          <p className="text-sm text-gray-400">Search, verify, suspend, or deactivate accounts.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={q} onChange={setQ} onSubmit={onSearch} placeholder="Search by name or username..." /></div>
        <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </div>

      {state.loading ? (
        <TaskListSkeleton rows={8} />
      ) : state.items.length ? (
        <div className="card divide-y divide-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50">
            <span className="col-span-4">User</span>
            <span className="col-span-2">Plan</span>
            <span className="col-span-2">Rating</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          {state.items.map((u) => (
            <div key={u._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-4 py-3 items-center">
              <Link to={`/admin/users/${u._id}`} className="md:col-span-4 min-w-0">
                <p className="font-medium text-sm truncate">{u.fullName} {u.identityVerified && <span className="text-brand-blue">✓</span>}</p>
                <p className="text-xs text-gray-400 truncate">@{u.username} · {u.email}</p>
              </Link>
              <span className="md:col-span-2 text-xs">{u.plan === 'PRO' ? <span className="chip bg-purple-50 text-purple-600">PRO</span> : 'Free'}</span>
              <span className="md:col-span-2 text-xs text-gray-500">⭐ {u.rating?.toFixed?.(1) || '—'} ({u.reviewCount || 0})</span>
              <span className="md:col-span-2"><StatusBadge status={u.accountStatus} /></span>
              <div className="md:col-span-2 flex flex-wrap gap-1.5 justify-start md:justify-end">
                {!u.identityVerified && (
                  <button onClick={() => setConfirmAction({ type: 'verify', user: u })} className="text-xs font-medium text-brand-blue">Verify</button>
                )}
                {u.accountStatus === 'ACTIVE' ? (
                  <button onClick={() => setConfirmAction({ type: 'suspend', user: u })} className="text-xs font-medium text-yellow-600">Suspend</button>
                ) : u.accountStatus === 'SUSPENDED' ? (
                  <button onClick={() => setConfirmAction({ type: 'unsuspend', user: u })} className="text-xs font-medium text-green-600">Unsuspend</button>
                ) : null}
                {u.accountStatus !== 'DEACTIVATED' && (
                  <button onClick={() => setConfirmAction({ type: 'deactivate', user: u })} className="text-xs font-medium text-red-500">Deactivate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No users found" />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />

      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === 'verify' ? 'Verify user' :
            confirmAction.type === 'suspend' ? 'Suspend user' :
            confirmAction.type === 'unsuspend' ? 'Unsuspend user' : 'Deactivate user'
          }
          description={`This will affect ${confirmAction.user.fullName}'s account.`}
          danger={confirmAction.type === 'suspend' || confirmAction.type === 'deactivate'}
          requireReason={confirmAction.type === 'suspend'}
          confirmLabel="Confirm"
          onConfirm={async (reason) => { confirmAction.reason = reason; await runAction(); }}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
