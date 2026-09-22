import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useMode } from '../../context/ModeContext.jsx';
import ModeSwitcher from '../../components/layout/ModeSwitcher.jsx';
import TaskCard from '../../components/task/TaskCard.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { tasksApi, categoriesApi } from '../../api/tasks.js';
import { walletApi } from '../../api/orders.js';
import { formatNaira } from '../../utils/money.js';

const CATEGORY_EMOJI = {
  'graphic-design': '🎨', writing: '📝', 'cv-resume': '📄', 'website-development': '💻',
  'video-editing': '🎬', 'social-media': '📣', 'typing-data-entry': '⌨️', delivery: '🚚',
  tutoring: '🎓', photography: '📷', cleaning: '🧹', 'event-help': '📅', repairs: '🔧', other: '➕',
};

export default function HomePage() {
  const { user } = useAuth();
  const { mode } = useMode();
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceKobo, setBalanceKobo] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      categoriesApi.list(),
      tasksApi.search({ sort: mode === 'worker' ? 'newest' : 'newest', limit: 4 }),
      mode === 'worker' ? walletApi.get() : Promise.resolve(null),
    ])
      .then(([catRes, taskRes, walletRes]) => {
        console.log('CATEGORY RESPONSE:', catRes);
        console.log('CATEGORY DATA:', catRes.data);
        if (!mounted) return;
        setCategories(catRes.data.categories);
        setTasks(taskRes.data);
        if (walletRes) setBalanceKobo(walletRes.data.balanceKobo);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [mode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-400">Good day,</p>
          <h1 className="text-xl font-bold text-brand-navy">{user?.fullName?.split(' ')[0]} 👋</h1>
        </div>
        <ModeSwitcher />
      </div>

      {mode === 'worker' && balanceKobo !== null && (
        <div className="bg-brand-navy text-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">Wallet balance</p>
            <p className="text-2xl font-bold">{formatNaira(balanceKobo)}</p>
          </div>
          <Link to="/wallet" className="bg-white/10 text-sm font-semibold px-4 py-2 rounded-xl">Withdraw</Link>
        </div>
      )}

      {mode === 'client' ? (
        <div className="bg-brand-navy text-white rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-1">Need something done?</h2>
          <p className="text-sm text-white/70 mb-4">Post a task and get it done by someone nearby.</p>
          <Link to="/tasks/create" className="bg-white text-brand-navy font-semibold rounded-xl px-5 py-3 inline-block">
            Post a Task
          </Link>
        </div>
      ) : (
        <div className="bg-brand-navy text-white rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-1">Ready to earn today?</h2>
          <p className="text-sm text-white/70 mb-4">Browse quick tasks that match your skills.</p>
          <Link to="/tasks" className="bg-white text-brand-navy font-semibold rounded-xl px-5 py-3 inline-block">
            Find Tasks
          </Link>
        </div>
      )}

      <Link to="/tasks" className="flex items-center gap-3 card px-4 py-3 text-gray-400">
        <Search size={18} />
        <span className="text-sm">Search for a task (e.g. design, delivery, tutoring...)</span>
      </Link>

      <div>
        <h3 className="font-semibold text-brand-navy mb-3">Categories</h3>
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(0, 8).map((c) => (
            <Link key={c._id} to={`/tasks?category=${c._id}`} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${c.color}1A` }}>
                {CATEGORY_EMOJI[c.slug] || '🗂️'}
              </div>
              <span className="text-[11px] text-gray-600 text-center leading-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-brand-navy">⚡ Quick Tasks</h3>
          <Link to="/tasks" className="text-sm text-brand-blue font-medium">See all</Link>
        </div>
        {loading ? (
          <TaskListSkeleton />
        ) : tasks.length ? (
          <div className="space-y-3">
            {tasks.map((t) => <TaskCard key={t._id} task={t} />)}
          </div>
        ) : (
          <EmptyState title="No tasks yet" subtitle="Check back soon, or post the first one!" />
        )}
      </div>
    </div>
  );
}
