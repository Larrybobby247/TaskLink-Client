import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.js';
import FilterChips from '../../components/admin/FilterChips.jsx';
import Pagination from '../../components/admin/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { formatNaira } from '../../utils/money.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'RESOLVED_CLIENT', label: 'Resolved (client)' },
  { value: 'RESOLVED_WORKER', label: 'Resolved (worker)' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function AdminDisputesPage() {
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    adminApi.listDisputes({ status: status || undefined, page, limit: 15 })
      .then((res) => setState({ loading: false, items: res.data, ...res.pagination }));
  };
  useEffect(() => { load(1); }, [status]); // eslint-disable-line

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Disputes</h1>
        <p className="text-sm text-gray-400">Review evidence and resolve disagreements between clients and workers.</p>
      </div>

      <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      {state.loading ? (
        <TaskListSkeleton rows={6} />
      ) : state.items.length ? (
        <div className="space-y-3">
          {state.items.map((d) => (
            <Link key={d._id} to={`/admin/disputes/${d._id}`} className="card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{d.reason}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Opened by {d.openedBy?.fullName} · {d.order?.task?.title || 'Order'} · {formatNaira(d.order?.agreedAmountKobo || 0)}
                </p>
              </div>
              <StatusBadge status={d.status} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No disputes found" />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />
    </div>
  );
}
