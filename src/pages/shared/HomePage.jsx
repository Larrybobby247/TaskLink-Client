import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Search,
  Palette,
  FileText,
  Code,
  Truck,
  GraduationCap,
  Camera,
  Wrench,
  CalendarDays,
  Video,
  Megaphone,
  Keyboard,
  Brush,
  Plus,
  BarChart,
  Headphones,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useMode } from '../../context/ModeContext.jsx';

import ModeSwitcher from '../../components/layout/ModeSwitcher.jsx';
import TaskCard from '../../components/task/TaskCard.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import GigCard from '../../components/gig/GigCard.jsx';

import { tasksApi, categoriesApi } from '../../api/tasks.js';
import { gigsApi } from '../../api/gigs.js';
import { walletApi } from '../../api/orders.js';
import { formatNaira } from '../../utils/money.js';

/* -------------------------------------------------------
CATEGORY ICONS
------------------------------------------------------- */

const CATEGORY_ICONS = {
  'graphic-design': Palette,
  writing: FileText,
  'cv-resume': FileText,
  'website-development': Code,
  delivery: Truck,
  tutoring: GraduationCap,
  photography: Camera,
  repairs: Wrench,
  'event-help': CalendarDays,
  'video-editing': Video,
  'social-media': Megaphone,
  'typing-data-entry': Keyboard,
  cleaning: Brush,
  'data-analysis': BarChart,
  'virtual-assistance': Headphones,
  other: Plus,
};

/* -------------------------------------------------------
RESPONSE HELPERS
------------------------------------------------------- */

function getTasks(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tasks)) return data.tasks;
  return [];
}

function getGigs(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.gigs)) return data.gigs;
  return [];
}

/* -------------------------------------------------------
HOME PAGE
------------------------------------------------------- */

export default function HomePage() {
  const { user } = useAuth();
  const { mode } = useMode();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [gigs, setGigs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [balanceKobo, setBalanceKobo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState(false);

  /* -------------------------------------------------------
  FETCH DATA
  ------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function loadHomePage() {
      setLoading(true);
      setLoadError(false);

      // Clear mode-specific data while the new mode loads.
      setTasks([]);
      setGigs([]);
      setBalanceKobo(null);

      try {
        const [categoryResult, listingResult, walletResult] = await Promise.all([
          categoriesApi.list(),

          mode === 'client'
            ? gigsApi.featured(6)
            : tasksApi.search({
                sort: 'newest',
                limit: 4,
              }),

          mode === 'worker' ? walletApi.get() : Promise.resolve(null),
        ]);

        if (!mounted) return;

        setCategories(
          Array.isArray(categoryResult?.data?.categories)
            ? categoryResult.data.categories
            : []
        );

        if (mode === 'client') {
          setGigs(getGigs(listingResult?.data));
          setTasks([]);
        } else {
          setTasks(getTasks(listingResult?.data));
          setGigs([]);
        }

        if (walletResult) {
          setBalanceKobo(walletResult.data?.balanceKobo ?? null);
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error);

        if (!mounted) return;

        setCategories([]);
        setTasks([]);
        setGigs([]);
        setBalanceKobo(null);
        setLoadError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHomePage();

    return () => {
      mounted = false;
    };
  }, [mode]);

  /* -------------------------------------------------------
  CATEGORY NAVIGATION
  ------------------------------------------------------- */

  const categoryHref = (categoryId) => {
    const encodedId = encodeURIComponent(categoryId);

    return mode === 'client'
      ? `/tasks/create?category=${encodedId}`
      : `/tasks?category=${encodedId}`;
  };

  /* -------------------------------------------------------
  WORKER SEARCH
  ------------------------------------------------------- */

  const submitSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}&type=workers`);
  };

  /* -------------------------------------------------------
  CATEGORY SORTING
  Show up to seven regular categories and "Other" last.
  ------------------------------------------------------- */

  const sortedCategories = [
    ...categories.filter((category) => category.slug !== 'other').slice(0, 7),
    ...categories.filter((category) => category.slug === 'other'),
  ].slice(0, 8);

  /* -------------------------------------------------------
  RENDER
  ------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* GREETING AND MODE SWITCHER */}

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-400">Good day,</p>

          <h1 className="text-xl font-bold text-brand-navy">
            {user?.fullName?.split(' ')[0] || 'there'} 👋
          </h1>
        </div>

        <ModeSwitcher />
      </section>

      {/* WORKER WALLET */}

      {mode === 'worker' && balanceKobo !== null && (
        <section className="flex items-center justify-between rounded-2xl bg-brand-navy p-5 text-white">
          <div>
            <p className="text-xs text-white/70">Wallet balance</p>

            <p className="text-2xl font-bold">{formatNaira(balanceKobo)}</p>
          </div>

          <Link
            to="/wallet"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
          >
            Withdraw
          </Link>
        </section>
      )}

      {/* HERO */}

      {mode === 'client' ? (
        <section className="rounded-2xl bg-brand-navy p-6 text-white">
          <h2 className="mb-1 text-lg font-bold">Need something done?</h2>

          <p className="mb-4 text-sm text-white/70">
            Post a task and connect with someone who can get it done.
          </p>

          <Link
            to="/tasks/create"
            className="inline-block rounded-xl bg-white px-5 py-3 font-semibold text-brand-navy"
          >
            Post a Task
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl bg-brand-navy p-6 text-white">
          <h2 className="mb-1 text-lg font-bold">Ready to earn today?</h2>

          <p className="mb-4 text-sm text-white/70">
            Browse tasks that match your skills.
          </p>

          <Link
            to="/tasks"
            className="inline-block rounded-xl bg-white px-5 py-3 font-semibold text-brand-navy"
          >
            Find Tasks
          </Link>
        </section>
      )}

      {/* SEARCH */}

      {mode === 'client' ? (
        <form
          onSubmit={submitSearch}
          role="search"
          className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
        >
          <Search size={18} className="shrink-0 text-gray-400" />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search workers, usernames, skills, or services..."
            aria-label="Search workers, usernames, skills, or services"
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="rounded-lg bg-brand-navy px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>
        </form>
      ) : (
        <Link
          to="/tasks"
          className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-gray-400 shadow-sm"
        >
          <Search size={18} />

          <span className="text-sm">
            Search for a task (e.g. design, websites, tutoring...)
          </span>
        </Link>
      )}

      {/* CATEGORIES */}

      <section>
        <h3 className="mb-4 text-lg font-semibold text-brand-navy">Categories</h3>

        {loading && categories.length === 0 ? (
          <div className="grid grid-cols-4 gap-x-3 gap-y-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse text-center">
                <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-gray-100" />

                <div className="mx-auto h-3 w-12 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : sortedCategories.length > 0 ? (
          <div className="grid grid-cols-4 gap-x-3 gap-y-5">
            {sortedCategories.map((category) => {
              const Icon = CATEGORY_ICONS[category.slug] || Plus;

              const color = /^#[0-9a-fA-F]{6}$/.test(category.color || '')
                ? category.color
                : '#64748b';

              return (
                <Link
                  key={category._id}
                  to={categoryHref(category._id)}
                  className="group flex flex-col items-center text-center"
                >
                  <div
                    className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-150 group-active:scale-95"
                    style={{
                      backgroundColor: `${color}1A`,
                    }}
                  >
                    <Icon size={26} strokeWidth={2.2} style={{ color }} />
                  </div>

                  <span className="text-[11px] font-medium leading-tight text-gray-600">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {loadError
              ? 'Categories could not be loaded. Please refresh and try again.'
              : 'No categories available yet.'}
          </p>
        )}
      </section>

      {/* CLIENT: FEATURED GIGS */}

      {mode === 'client' && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-brand-navy">✨ Featured Gigs</h3>

            <Link to="/search?type=gigs" className="text-sm font-medium text-brand-blue">
              Explore Gigs
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : gigs.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={loadError ? 'Unable to load gigs' : 'No gigs yet'}
              subtitle={
                loadError
                  ? 'Please refresh the page and try again.'
                  : 'Check back soon, or explore categories to find a worker.'
              }
            />
          )}
        </section>
      )}

      {/* WORKER: QUICK TASKS */}

      {mode === 'worker' && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-brand-navy">⚡ Quick Tasks</h3>

            <Link to="/tasks" className="text-sm font-medium text-brand-blue">
              See all
            </Link>
          </div>

          {loading ? (
            <TaskListSkeleton />
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={loadError ? 'Unable to load tasks' : 'No tasks yet'}
              subtitle={
                loadError
                  ? 'Please refresh the page and try again.'
                  : 'Check back soon for new tasks.'
              }
            />
          )}
        </section>
      )}
    </div>
  );
}