import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { tasksApi } from '../../api/tasks.js';
import TaskCard from '../../components/task/TaskCard.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';

export default function TaskListPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [sort, setSort] = useState('newest');
  const [state, setState] = useState({ loading: true, error: null, items: [], total: 0, page: 1, totalPages: 1 });

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    tasksApi
      .search({ q, sort, category: params.get('category') || undefined, page, limit: 10 })
      .then((res) => setState({ loading: false, error: null, items: res.data, ...res.pagination }))
      .catch((err) => setState((s) => ({ ...s, loading: false, error: err.message })));
  };

  useEffect(() => { load(1); }, [sort, params]); // eslint-disable-line

  const onSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-navy">Find Tasks</h1>
      <form onSubmit={onSearch} className="flex items-center gap-2 card px-3 py-2">
        <Search size={18} className="text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks..." className="flex-1 outline-none text-sm" />
      </form>

      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: 'newest', label: 'Newest' },
          { key: 'highest_paying', label: 'Highest Paying' },
          { key: 'urgent', label: 'Urgent' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`chip whitespace-nowrap ${sort === s.key ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {state.loading ? (
        <TaskListSkeleton rows={6} />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={() => load(1)} />
      ) : state.items.length ? (
        <div className="space-y-3">
          {state.items.map((t) => <TaskCard key={t._id} task={t} />)}
          {state.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              {Array.from({ length: state.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => load(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm ${state.page === i + 1 ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No tasks found" subtitle="Try a different search or check back later." />
      )}
    </div>
  );
}
