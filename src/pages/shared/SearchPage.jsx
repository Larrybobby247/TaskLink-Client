import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Star, MapPin } from 'lucide-react';
import { searchApi } from '../../api/search.js';
import { categoriesApi } from '../../api/tasks.js';
import { workersApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';
import GigCard from '../../components/gig/GigCard.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import FilterChips from '../../components/admin/FilterChips.jsx';
import Pagination from '../../components/admin/Pagination.jsx';
import { formatNaira } from '../../utils/money.js';

const GIG_SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4+ ⭐' },
  { value: '4.5', label: '4.5+ ⭐' },
];

const AVAILABILITY_LABELS = { AVAILABLE: 'Available', BUSY: 'Busy', UNAVAILABLE: 'Unavailable' };

/* The backend list shape is { data: [...], pagination: {...} }. This also
   tolerates a few close variants so one small shape difference can't blank
   the page. */
function normalizeResponse(res) {
  const d = res?.data;
  let items = [];
  if (Array.isArray(d)) items = d;
  else if (Array.isArray(d?.results)) items = d.results;
  else if (Array.isArray(d?.items)) items = d.items;
  else if (Array.isArray(d?.workers)) items = d.workers;
  else if (Array.isArray(d?.gigs)) items = d.gigs;

  const p = res?.pagination || d?.pagination || {};
  return {
    items,
    page: Number(p.page) || 1,
    totalPages: Number(p.totalPages ?? p.pages) || 1,
    total: typeof p.total === 'number' ? p.total : null,
  };
}

/* A worker result may be a WorkerProfile with a populated `user`, or a plain
   user document. Support both without crashing. */
function readWorker(item) {
  const hasUser = item?.user && typeof item.user === 'object';
  const user = hasUser ? item.user : item || {};
  const profile = hasUser ? item : item?.workerProfile || item || {};
  const categories = (profile.categories || user.categories || [])
    .map((c) => (typeof c === 'string' ? c : c?.name))
    .filter(Boolean);

  return {
    user,
    id: user._id,
    headline: profile.headline,
    bio: user.bio || profile.bio,
    skills: profile.skills || user.skills || [],
    categories,
    availability: profile.availability,
    gigCount: item.publishedGigCount ?? item.gigCount ?? profile.publishedGigCount,
    startingPriceKobo: item.startingPriceKobo ?? item.minPriceKobo ?? profile.startingPriceKobo,
  };
}

function WorkerCard({ item, saved, canSave, onToggleSave }) {
  const navigate = useNavigate();
  const w = readWorker(item);
  const u = w.user;
  if (!w.id) return null;

  const profilePath = `/profile/${w.id}`;
  const rating = typeof u.rating === 'number' && u.rating > 0 ? u.rating.toFixed(1) : 'New';

  return (
    <div
      className="card p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={(e) => { if (!e.target.closest('a,button')) navigate(profilePath); }}
    >
      <Link to={profilePath} className="shrink-0" aria-label={`View ${u.fullName || 'worker'} profile`}>
        {u.profileImage?.url ? (
          <img src={u.profileImage.url} className="w-14 h-14 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-lg">{u.fullName?.[0]}</div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={profilePath} className="font-semibold text-brand-navy hover:underline block truncate">{u.fullName}</Link>
        <p className="text-xs text-gray-400 truncate">
          {u.username && `@${u.username}`}
          {u.location && <span className="ml-2 inline-flex items-center gap-1"><MapPin size={10} />{u.location}</span>}
        </p>

        {w.headline && <p className="text-sm text-gray-700 mt-1 truncate">{w.headline}</p>}
        {w.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{w.bio}</p>}

        {w.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {w.skills.slice(0, 4).map((s) => <span key={s} className="chip bg-brand-bg text-brand-navy text-[11px]">{s}</span>)}
          </div>
        )}

        {w.categories.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-1.5 truncate">{w.categories.slice(0, 3).join(' · ')}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-500 fill-yellow-500" /> {rating}
            {u.reviewCount ? ` (${u.reviewCount})` : ''}
          </span>
          <span>{u.completedTasksAsWorker || 0} jobs done</span>
          {typeof w.gigCount === 'number' && <span>{w.gigCount} {w.gigCount === 1 ? 'gig' : 'gigs'}</span>}
          {w.startingPriceKobo > 0 && <span>From {formatNaira(w.startingPriceKobo)}</span>}
          {w.availability && AVAILABILITY_LABELS[w.availability] && (
            <span className={w.availability === 'AVAILABLE' ? 'text-green-600 font-medium' : ''}>{AVAILABILITY_LABELS[w.availability]}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 items-end shrink-0">
        <Link to={profilePath} className="btn-secondary text-xs py-2 px-3">View Profile</Link>
        {canSave && (
          <button type="button" onClick={() => onToggleSave(w.id)} className={`text-xs font-medium ${saved ? 'text-red-500' : 'text-brand-blue'}`}>
            {saved ? 'Unsave' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  // The URL is the single source of truth for everything except the text
  // currently being typed.
  const urlQ = params.get('q') || '';
  const type = params.get('type') === 'gigs' ? 'gigs' : 'workers';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '';
  const minRating = params.get('minRating') || '';
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);

  const [input, setInput] = useState(urlQ);
  const debouncedInput = useDebouncedValue(input, 350);
  const pushedQ = useRef(urlQ);

  const [categories, setCategories] = useState([]);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ loading: true, error: null, items: [], page: 1, totalPages: 1, total: null });

  const updateParams = useCallback((patch) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === '' || value == null) next.delete(key);
        else next.set(key, String(value));
      });
      return next;
    }, { replace: true });
  }, [setParams]);

  // typing (debounced) -> URL
  useEffect(() => {
    const value = debouncedInput.trim();
    if (value === urlQ) return;
    pushedQ.current = value;
    updateParams({ q: value, page: '' });
  }, [debouncedInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL -> input, only when the change came from outside (back button, link)
  useEffect(() => {
    if (urlQ !== pushedQ.current) {
      pushedQ.current = urlQ;
      setInput(urlQ);
    }
  }, [urlQ]);

  useEffect(() => {
    categoriesApi.list()
      .then((res) => setCategories(res?.data?.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Pre-fill which workers are already saved so the button text is correct.
  useEffect(() => {
    let cancelled = false;
    workersApi.saved({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setSavedIds(new Set(list.map((entry) => String(entry.worker?._id)).filter(Boolean)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Fetch results from the backend. `cancelled` stops slow, older requests
  // from overwriting newer results.
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    searchApi.run({
      q: urlQ || undefined,
      type,
      category: category || undefined,
      sort: sort || undefined,
      minRating: minRating || undefined,
      page,
      limit: 12,
    })
      .then((res) => {
        if (cancelled) return;
        setState({ loading: false, error: null, ...normalizeResponse(res) });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((s) => ({ ...s, items: [], loading: false, error: err?.message || 'Search failed. Please try again.' }));
      });

    return () => { cancelled = true; };
  }, [urlQ, type, category, sort, minRating, page, reloadKey]);

  const submit = (e) => {
    e.preventDefault();
    const value = input.trim();
    pushedQ.current = value;
    updateParams({ q: value, page: '' });
  };

  const changePage = (next) => {
    updateParams({ page: next > 1 ? next : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveWorker = async (workerId) => {
    const key = String(workerId);
    const wasSaved = savedIds.has(key);
    const apply = (saved) => setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(key); else next.delete(key);
      return next;
    });

    apply(!wasSaved);
    try {
      await (wasSaved ? workersApi.unsave(workerId) : workersApi.save(workerId));
    } catch {
      apply(wasSaved); // revert optimistic update
    }
  };

  const hasFilters = Boolean(urlQ || category || sort || minRating);
  const clearAll = () => { setInput(''); pushedQ.current = ''; setParams({ type }, { replace: true }); };

  return (
    <div className="space-y-4 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">{type === 'gigs' ? 'Browse Gigs' : 'Find Workers'}</h1>

      <form onSubmit={submit} role="search" className="flex items-center gap-3 card px-3 py-2">
        <SearchIcon size={18} className="text-gray-400 shrink-0" />
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search workers, usernames, skills, or services..."
          aria-label="Search workers, usernames, skills, or services"
          className="flex-1 outline-none text-sm min-w-0 bg-transparent py-1"
          autoFocus={!urlQ}
        />
      </form>

      <div className="flex gap-2">
        {[['workers', 'Workers'], ['gigs', 'Gigs']].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => updateParams({ type: key, sort: '', page: '' })}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${type === key ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <FilterChips
        options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c._id, label: c.name }))]}
        value={category}
        onChange={(value) => updateParams({ category: value, page: '' })}
      />

      <div className="flex flex-col gap-2">
        {type === 'gigs' && (
          <FilterChips options={GIG_SORT_OPTIONS} value={sort} onChange={(value) => updateParams({ sort: value, page: '' })} />
        )}
        <FilterChips options={RATING_OPTIONS} value={minRating} onChange={(value) => updateParams({ minRating: value, page: '' })} />
      </div>

      {!state.loading && !state.error && state.total != null && (
        <p className="text-xs text-gray-400">{state.total} {state.total === 1 ? 'result' : 'results'}</p>
      )}

      {state.loading ? (
        <TaskListSkeleton rows={6} />
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : state.items.length === 0 ? (
        <EmptyState
          title={`No ${type} found`}
          subtitle={hasFilters ? 'Try a different search term or clear your filters.' : `There are no ${type} to show yet. Please check back soon.`}
          action={hasFilters ? <button type="button" onClick={clearAll} className="btn-secondary text-sm">Clear search & filters</button> : null}
        />
      ) : type === 'gigs' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {state.items.map((gig) => <GigCard key={gig._id} gig={gig} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {state.items.map((item) => {
            const w = readWorker(item);
            return (
              <WorkerCard
                key={item._id || w.id}
                item={item}
                saved={savedIds.has(String(w.id))}
                canSave={Boolean(user) && String(w.id) !== String(user._id)}
                onToggleSave={toggleSaveWorker}
              />
            );
          })}
        </div>
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={changePage} />
    </div>
  );
}
