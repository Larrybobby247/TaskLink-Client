import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../../api/tasks.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { formatNaira } from '../../utils/money.js';

const TABS = [
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: null, label: 'All' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function MyTasksPage() {
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setLoading(true);
    tasksApi.mine(tab ? { status: tab } : {}).then((res) => setTasks(res.data)).finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-navy">My Tasks</h1>
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
          {tasks.map((task) => (
            <Link key={task._id} to={`/tasks/${task._id}`} className="card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-brand-navy truncate">{task.title}</p>
                <p className="text-xs text-gray-400 mt-1">{task.applicationCount || 0} applications · {formatNaira(task.budgetKobo)}</p>
              </div>
              <StatusBadge status={task.status} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="You haven't posted any tasks." action={<Link to="/tasks/create" className="btn-primary">Post a Task</Link>} />
      )}
    </div>
  );
}
