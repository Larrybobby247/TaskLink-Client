import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.js';
import Pagination from '../../components/admin/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';

export default function AdminActivityLogPage() {
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    adminApi.getActionLogs({ page, limit: 25 }).then((res) => setState({ loading: false, items: res.data, ...res.pagination }));
  };
  useEffect(() => { load(1); }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Activity Log</h1>
        <p className="text-sm text-gray-400">Every admin action is recorded here — who did what, and when.</p>
      </div>

      {state.loading ? (
        <TaskListSkeleton rows={10} />
      ) : state.items.length ? (
        <div className="card divide-y divide-gray-100">
          {state.items.map((log) => (
            <div key={log._id} className="p-4 flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {log.admin?.fullName || 'Admin'} · {log.targetType ? `${log.targetType} ${log.targetId}` : ''}
                </p>
              </div>
              <span className="text-xs text-gray-300 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No admin actions recorded yet" />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />
    </div>
  );
}
