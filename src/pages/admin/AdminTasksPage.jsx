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
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DISPUTED', label: 'Disputed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminTasksPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });
  const [confirmAction, setConfirmAction] = useState(null);

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    adminApi.searchTasks({ q: q || undefined, status: status || undefined, page, limit: 15 })
      .then((res) => setState({ loading: false, items: res.data, ...res.pagination }));
  };
  useEffect(() => { load(1); }, [status]); // eslint-disable-line

  const onSearch = (e) => { e.preventDefault(); load(1); };

  const runAction = async (reason) => {
    const { type, task } = confirmAction;
    if (type === 'flag') await adminApi.flagTask(task._id, reason);
    if (type === 'pause') await adminApi.pauseTask(task._id);
    if (type === 'delete') await adminApi.deleteTask(task._id);
    load(state.page);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Tasks</h1>
        <p className="text-sm text-gray-400">Moderate task listings — flag, pause, or remove.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={q} onChange={setQ} onSubmit={onSearch} placeholder="Search task titles..." /></div>
        <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
      </div>

      {state.loading ? (
        <TaskListSkeleton rows={8} />
      ) : state.items.length ? (
        <div className="space-y-3">
          {state.items.map((t) => (
            <div key={t._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <Link to={`/tasks/${t._id}`} className="font-semibold text-brand-navy truncate hover:underline">
                  {t.title} {t.isFlagged && <span className="text-red-500">🚩</span>}
                </Link>
                <p className="text-xs text-gray-400 mt-1">
                  by {t.client?.fullName} · {formatNaira(t.budgetKobo)} · {t.applicationCount || 0} applications
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={t.status} />
                <div className="flex gap-2">
                  <button onClick={() => setConfirmAction({ type: 'flag', task: t })} className="text-xs font-medium text-yellow-600">Flag</button>
                  <button onClick={() => setConfirmAction({ type: 'pause', task: t })} className="text-xs font-medium text-gray-500">Pause</button>
                  <button onClick={() => setConfirmAction({ type: 'delete', task: t })} className="text-xs font-medium text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No tasks found" />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />

      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === 'flag' ? 'Flag task' :
            confirmAction.type === 'pause' ? 'Pause task' : 'Delete task'
          }
          description={`This applies to "${confirmAction.task.title}".`}
          danger={confirmAction.type === 'delete'}
          requireReason={confirmAction.type === 'flag'}
          onConfirm={runAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
