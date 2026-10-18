import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Pencil, Trash2 } from 'lucide-react';
import { tasksApi } from '../../api/tasks.js';
import { settingsApi } from '../../api/settings.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { formatNaira } from '../../utils/money.js';

const TABS = [
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'PUBLISHED,APPLICATIONS_OPEN', label: 'Published' },
  { key: 'WORKER_SELECTED,PAYMENT_PENDING,PAYMENT_SECURED,IN_PROGRESS,SUBMITTED,REVISION_REQUESTED', label: 'In progress' },
  { key: null, label: 'All' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

// A task can be boosted as long as it's not in one of these terminal/inactive states.
const EDITABLE_STATUSES = ['DRAFT', 'PAUSED', 'PUBLISHED', 'APPLICATIONS_OPEN'];
const DELETABLE_STATUSES = [...EDITABLE_STATUSES, 'EXPIRED', 'CANCELLED'];

const NOT_BOOSTABLE_STATUSES = ['DRAFT', 'CANCELLED', 'COMPLETED', 'EXPIRED'];

function isCurrentlyFeatured(task) {
  return task.isFeatured && task.featuredUntil && new Date(task.featuredUntil) > new Date();
}

export default function MyTasksPage() {
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [boostFeeKobo, setBoostFeeKobo] = useState(null);
  const [boostingTask, setBoostingTask] = useState(null); // task currently in the confirm modal
  const [boostError, setBoostError] = useState('');
  const navigate = useNavigate();
  const [deletingTask, setDeletingTask] = useState(null);
  const [notice, setNotice] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    tasksApi.mine(tab ? { status: tab } : {}).then((res) => setTasks(res.data)).finally(() => setLoading(false));
  }, [tab, reloadKey]);

  // The boost fee always comes from the backend (PlatformSetting) - never hardcoded here.
  useEffect(() => {
    settingsApi.getPublic().then((res) => setBoostFeeKobo(res.data.settings.featuredTaskPriceKobo));
  }, []);

  const confirmBoost = async () => {
    setBoostError('');
    try {
      const { data } = await tasksApi.boost(boostingTask._id);
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setBoostError(err.message);
      throw err; // keeps the modal open so the error shows
    }
  };

  const confirmDelete = async () => {
    const { data } = await tasksApi.remove(deletingTask._id);
    setNotice(data?.message || 'Task deleted');
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-navy">My Tasks</h1>
      {notice && (
        <div role="status" className="bg-green-50 text-green-700 text-sm rounded-lg p-3 flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="text-green-700 font-semibold">Dismiss</button>
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.label} onClick={() => setTab(t.key)} className={`chip whitespace-nowrap ${tab === t.key ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TaskListSkeleton />
      ) : tasks.length ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const featured = isCurrentlyFeatured(task);
            const boostable = !featured && !NOT_BOOSTABLE_STATUSES.includes(task.status);

            return (
              <div key={task._id} className="card p-4 flex items-center justify-between gap-3">
                <Link to={`/tasks/${task._id}`} className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-navy truncate flex items-center gap-1.5">
                    {task.title}
                    {featured && <span className="chip bg-orange-50 text-orange-600 shrink-0">🚀 Boosted</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{task.applicationCount || 0} applications · {formatNaira(task.budgetKobo)}</p>
                </Link>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={task.status} />
                  <div className="flex items-center gap-1.5">
                    {EDITABLE_STATUSES.includes(task.status) && (!task.source || task.source === 'TASK_POST') && (
                      <button
                        onClick={() => navigate(`/tasks/${task._id}/edit`)}
                        aria-label={`Edit ${task.title}`}
                        className="flex items-center gap-1 text-xs font-semibold text-brand-navy bg-brand-bg px-2.5 py-1.5 rounded-lg hover:bg-gray-100"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                    )}
                    {DELETABLE_STATUSES.includes(task.status) && (!task.source || task.source === 'TASK_POST') && (
                      <button
                        onClick={() => setDeletingTask(task)}
                        aria-label={`Delete ${task.title}`}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                  </div>
                  {boostable && (
                    <button
                      onClick={() => setBoostingTask(task)}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-navy bg-brand-bg px-2.5 py-1.5 rounded-lg hover:bg-gray-100"
                    >
                      <Rocket size={13} /> Boost
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="You haven't posted any tasks." action={<Link to="/tasks/create" className="btn-primary">Post a Task</Link>} />
      )}

      {deletingTask && (
        <ConfirmModal
          title="Delete this task?"
          description={(deletingTask.applicationCount || 0) > 0
            ? `"${deletingTask.title}" has ${deletingTask.applicationCount} application${deletingTask.applicationCount === 1 ? '' : 's'}. It will be closed and those workers will be notified. This can't be undone.`
            : `"${deletingTask.title}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete task"
          danger
          onConfirm={confirmDelete}
          onClose={() => setDeletingTask(null)}
        />
      )}

      {boostingTask && (
        <ConfirmModal
          title="Boost this task"
          description={
            boostFeeKobo === null
              ? 'Loading fee...'
              : `Pay ${formatNaira(boostFeeKobo)} to feature "${boostingTask.title}" so it's shown to more workers. You'll be redirected to Paystack to complete payment.`
          }
          confirmLabel={boostFeeKobo === null ? 'Please wait...' : `Pay ${formatNaira(boostFeeKobo)}`}
          onConfirm={confirmBoost}
          onClose={() => { setBoostingTask(null); setBoostError(''); }}
        />
      )}
    </div>
  );
}
