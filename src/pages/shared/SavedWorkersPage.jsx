import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookmarkX } from 'lucide-react';
import { workersApi } from '../../api/users.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import Pagination from '../../components/admin/Pagination.jsx';

export default function SavedWorkersPage() {
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    workersApi.saved({ page, limit: 15 }).then((res) => setState({ loading: false, items: res.data, ...res.pagination }));
  };
  useEffect(() => { load(1); }, []);

  const unsave = async (workerId) => {
    await workersApi.unsave(workerId);
    setState((s) => ({ ...s, items: s.items.filter((i) => i.worker._id !== workerId) }));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-navy">Saved Workers</h1>

      {state.loading ? (
        <TaskListSkeleton />
      ) : state.items.length ? (
        <div className="space-y-3">
          {state.items.map(({ worker }) => (
            <div key={worker._id} className="card p-4 flex items-center gap-3">
              <Link to={`/profile/${worker._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                {worker.profileImage?.url ? (
                  <img src={worker.profileImage.url} className="w-12 h-12 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-semibold">{worker.fullName?.[0]}</div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{worker.fullName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Star size={11} className="text-yellow-500 fill-yellow-500" /> {worker.rating?.toFixed?.(1) || 'New'} · {worker.completedTasksAsWorker || 0} jobs</p>
                </div>
              </Link>
              <button onClick={() => unsave(worker._id)} className="text-gray-300 hover:text-red-500 shrink-0" aria-label="Unsave">
                <BookmarkX size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No saved workers yet" subtitle="Save workers you like from their profile to find them again quickly." />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />
    </div>
  );
}
