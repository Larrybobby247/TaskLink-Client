import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.js';
import FilterChips from '../../components/admin/FilterChips.jsx';
import Pagination from '../../components/admin/Pagination.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: '', label: 'All' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'ACTIONED', label: 'Actioned' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

export default function AdminReportsPage() {
  const [status, setStatus] = useState('PENDING');
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });
  const [noteDrafts, setNoteDrafts] = useState({});

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    adminApi.listReports({ status: status || undefined, page, limit: 15 })
      .then((res) => setState({ loading: false, items: res.data, ...res.pagination }));
  };
  useEffect(() => { load(1); }, [status]); // eslint-disable-line

  const act = async (report, actionStatus) => {
    await adminApi.actionReport(report._id, { status: actionStatus, adminNote: noteDrafts[report._id] || '' });
    load(state.page);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Reports</h1>
        <p className="text-sm text-gray-400">User-submitted reports on tasks, messages, reviews, and applications.</p>
      </div>

      <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      {state.loading ? (
        <TaskListSkeleton rows={6} />
      ) : state.items.length ? (
        <div className="space-y-3">
          {state.items.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{r.reason} <span className="chip bg-gray-100 text-gray-500 ml-1">{r.targetType}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Reported by {r.reporter?.fullName} · {new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.description && <p className="text-sm text-gray-600 mt-2">{r.description}</p>}
              {r.status === 'PENDING' && (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="input-field text-sm"
                    placeholder="Admin note (optional)"
                    value={noteDrafts[r._id] || ''}
                    onChange={(e) => setNoteDrafts((d) => ({ ...d, [r._id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => act(r, 'ACTIONED')} className="btn-primary text-sm flex-1">Take action</button>
                    <button onClick={() => act(r, 'DISMISSED')} className="btn-secondary text-sm flex-1">Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No reports found" />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />
    </div>
  );
}
