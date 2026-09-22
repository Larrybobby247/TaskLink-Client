import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../api/tasks.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';

const TABS = [null, 'PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];

export default function MyApplicationsPage() {
  const [tab, setTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setLoading(true);
    applicationsApi.mine(tab ? { status: tab } : {}).then((res) => setItems(res.data)).finally(() => setLoading(false));
  }, [tab]);

  const withdraw = async (id) => {
    await applicationsApi.withdraw(id);
    setItems((items2) => items2.map((a) => (a._id === id ? { ...a, status: 'WITHDRAWN' } : a)));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-navy">My Applications</h1>
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t || 'all'} onClick={() => setTab(t)} className={`chip whitespace-nowrap ${tab === t ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            {t || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <TaskListSkeleton />
      ) : items.length ? (
        <div className="space-y-3">
          {items.map((app) => (
            <div key={app._id} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <Link to={`/tasks/${app.task?._id}`} className="min-w-0">
                  <p className="font-semibold text-brand-navy truncate">{app.task?.title}</p>
                  <p className="text-xs text-gray-400 mt-1">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                </Link>
                <StatusBadge status={app.status} />
              </div>
              {['PENDING', 'SHORTLISTED'].includes(app.status) && (
                <button onClick={() => withdraw(app._id)} className="text-red-500 text-xs font-medium mt-3">Withdraw application</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No applications yet." subtitle="Browse tasks and start applying." action={<Link to="/tasks" className="btn-primary">Find Tasks</Link>} />
      )}
    </div>
  );
}
