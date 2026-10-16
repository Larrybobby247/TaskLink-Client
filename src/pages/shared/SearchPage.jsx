import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Star, MapPin } from 'lucide-react';
import { searchApi } from '../../api/search.js';
import { categoriesApi } from '../../api/tasks.js';
import { workersApi } from '../../api/users.js';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';
import GigCard from '../../components/gig/GigCard.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FilterChips from '../../components/admin/FilterChips.jsx';
import Pagination from '../../components/admin/Pagination.jsx';
import { formatNaira } from '../../utils/money.js';

const SORT_OPTIONS = {
  workers: [{ value: '', label: 'Relevance' }],
  gigs: [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ],
};

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const debouncedQ = useDebouncedValue(q, 350);
  const [type, setType] = useState(params.get('type') === 'gigs' ? 'gigs' : 'workers');
  const [category, setCategory] = useState(params.get('category') || '');
  const [sort, setSort] = useState('');
  const [minRating, setMinRating] = useState('');
  const [categories, setCategories] = useState([]);

  const [state, setState] = useState({ loading: true, error: null, items: [], page: 1, totalPages: 1 });
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => { categoriesApi.list().then((res) => setCategories(res.data.categories)); }, []);

  useEffect(() => {
    // Keep the URL in sync so results are shareable/bookmarkable, per the
    // dashboard search bar's /search?q=... convention (spec §2.1).
    setParams({ q: debouncedQ || '', type, ...(category ? { category } : {}) }, { replace: true });
  }, [debouncedQ, type, category]); // eslint-disable-line

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    searchApi.run({
      q: debouncedQ || undefined,
      type,
      category: category || undefined,
      sort: sort || undefined,
      minRating: minRating || undefined,
      page,
      limit: 12,
    })
      .then((res) => setState({ loading: false, error: null, items: res.data, ...res.pagination }))
      .catch((err) => setState((s) => ({ ...s, loading: false, error: err.message })));
  };

  useEffect(() => { load(1); }, [debouncedQ, type, category, sort, minRating]); // eslint-disable-line

  const toggleSaveWorker = async (workerId) => {
    const isSaved = savedIds.has(workerId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(workerId) : next.add(workerId);
      return next;
    });
    try {
      await (isSaved ? workersApi.unsave(workerId) : workersApi.save(workerId));
    } catch {
      // revert optimistic update on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        isSaved ? next.add(workerId) : next.delete(workerId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">Search</h1>

      <div className="flex items-center gap-3 card px-3 py-2">
        <SearchIcon size={18} className="text-gray-400 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search workers, usernames, skills, or services..."
          className="flex-1 outline-none text-sm min-w-0"
          autoFocus
        />
      </div>

      <div className="flex gap-2">
        {[['workers', 'Workers'], ['gigs', 'Gigs']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setType(key); setSort(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${type === key ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        <FilterChips
          options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]}
          value={category}
          onChange={setCategory}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {type === 'gigs' && (
          <FilterChips options={SORT_OPTIONS.gigs} value={sort} onChange={setSort} />
        )}
        <FilterChips
          options={[{ value: '', label: 'Any rating' }, { value: '4', label: '4+ ⭐' }, { value: '4.5', label: '4.5+ ⭐' }]}
          value={minRating}
          onChange={setMinRating}
        />
      </div>

      {state.loading ? (
        <TaskListSkeleton rows={6} />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={() => load(1)} />
      ) : state.items.length === 0 ? (
        <EmptyState title={`No ${type} found`} subtitle="Try a different search term or clear your filters." />
      ) : type === 'gigs' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {state.items.map((gig) => <GigCard key={gig._id} gig={gig} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {state.items.map((profile) => {
            const u = profile.user;
            const saved = savedIds.has(u._id);
            return (
              <div key={profile._id} className="card p-4 flex items-start gap-3">
                <Link to={`/profile/${u._id}`} className="shrink-0">
                  {u.profileImage?.url ? (
                    <img src={u.profileImage.url} className="w-14 h-14 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-lg">{u.fullName?.[0]}</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${u._id}`} className="font-semibold text-brand-navy hover:underline">{u.fullName}</Link>
                  <p className="text-xs text-gray-400">@{u.username}{u.location && <span className="ml-2 inline-flex items-center gap-1"><MapPin size={10} />{u.location}</span>}</p>
                  {profile.headline && <p className="text-sm text-gray-600 mt-1 truncate">{profile.headline}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(profile.skills || []).slice(0, 4).map((s) => <span key={s} className="chip bg-brand-bg text-brand-navy text-[11px]">{s}</span>)}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" /> {u.rating?.toFixed?.(1) || 'New'} ({u.reviewCount || 0})</span>
                    <span>{u.completedTasksAsWorker || 0} jobs done</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  <Link to={`/profile/${u._id}`} className="btn-secondary text-xs py-2 px-3">View Profile</Link>
                  <button onClick={() => toggleSaveWorker(u._id)} className={`text-xs font-medium ${saved ? 'text-red-500' : 'text-brand-blue'}`}>
                    {saved ? 'Unsave' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />
    </div>
  );
}
