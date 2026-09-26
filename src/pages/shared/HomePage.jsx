import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Search,
  Palette,
  FilePenLine,
  Code2,
  Truck,
  GraduationCap,
  Camera,
  Wrench,
  CalendarDays,
  Video,
  Megaphone,
  Keyboard,
  Broom,
  Plus,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useMode } from '../../context/ModeContext.jsx';
import ModeSwitcher from '../../components/layout/ModeSwitcher.jsx';
import TaskCard from '../../components/task/TaskCard.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

import { tasksApi, categoriesApi } from '../../api/tasks.js';
import { walletApi } from '../../api/orders.js';
import { formatNaira } from '../../utils/money.js';


/* -------------------------------------------------------
   CATEGORY ICONS
------------------------------------------------------- */

const CATEGORY_ICONS = {
  'graphic-design': Palette,
  writing: FilePenLine,
  'cv-resume': FilePenLine,
  'website-development': Code2,
  delivery: Truck,
  tutoring: GraduationCap,
  photography: Camera,
  repairs: Wrench,
  'event-help': CalendarDays,
  'video-editing': Video,
  'social-media': Megaphone,
  'typing-data-entry': Keyboard,
  cleaning: Broom,
  other: Plus,
};


/* -------------------------------------------------------
   HOME PAGE
------------------------------------------------------- */

export default function HomePage() {
  const { user } = useAuth();
  const { mode } = useMode();

  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceKobo, setBalanceKobo] = useState(null);


  /* -------------------------------------------------------
     FETCH DATA
  ------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    Promise.all([
      categoriesApi.list(),

      tasksApi.search({
        sort: mode === 'worker' ? 'newest' : 'newest',
        limit: 4,
      }),

      mode === 'worker'
        ? walletApi.get()
        : Promise.resolve(null),
    ])
      .then(([catRes, taskRes, walletRes]) => {
        console.log('CATEGORY RESPONSE:', catRes);
        console.log('CATEGORY DATA:', catRes.data);

        if (!mounted) return;

        setCategories(catRes.data.categories || []);
        setTasks(taskRes.data || []);

        if (walletRes) {
          setBalanceKobo(walletRes.data.balanceKobo);
        } else {
          setBalanceKobo(null);
        }
      })
      .catch((error) => {
        console.error('Failed to load homepage data:', error);

        if (!mounted) return;

        setCategories([]);
        setTasks([]);
        setBalanceKobo(null);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [mode]);


  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="space-y-6">

      {/* ---------------------------------------------------
          GREETING + MODE SWITCHER
      --------------------------------------------------- */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-400">
            Good day,
          </p>

          <h1 className="text-xl font-bold text-brand-navy">
            {user?.fullName?.split(' ')[0]} 👋
          </h1>
        </div>

        <ModeSwitcher />
      </div>


      {/* ---------------------------------------------------
          WORKER WALLET BALANCE
      --------------------------------------------------- */}

      {mode === 'worker' && balanceKobo !== null && (
        <div className="bg-brand-navy text-white rounded-2xl p-5 flex items-center justify-between">

          <div>
            <p className="text-xs text-white/70">
              Wallet balance
            </p>

            <p className="text-2xl font-bold">
              {formatNaira(balanceKobo)}
            </p>
          </div>

          <Link
            to="/wallet"
            className="bg-white/10 text-sm font-semibold px-4 py-2 rounded-xl"
          >
            Withdraw
          </Link>

        </div>
      )}


      {/* ---------------------------------------------------
          HERO SECTION
      --------------------------------------------------- */}

      {mode === 'client' ? (
        <div className="bg-brand-navy text-white rounded-2xl p-6">

          <h2 className="text-lg font-bold mb-1">
            Need something done?
          </h2>

          <p className="text-sm text-white/70 mb-4">
            Post a task and get it done by someone nearby.
          </p>

          <Link
            to="/tasks/create"
            className="bg-white text-brand-navy font-semibold rounded-xl px-5 py-3 inline-block"
          >
            Post a Task
          </Link>

        </div>
      ) : (
        <div className="bg-brand-navy text-white rounded-2xl p-6">

          <h2 className="text-lg font-bold mb-1">
            Ready to earn today?
          </h2>

          <p className="text-sm text-white/70 mb-4">
            Browse quick tasks that match your skills.
          </p>

          <Link
            to="/tasks"
            className="bg-white text-brand-navy font-semibold rounded-xl px-5 py-3 inline-block"
          >
            Find Tasks
          </Link>

        </div>
      )}


      {/* ---------------------------------------------------
          SEARCH
      --------------------------------------------------- */}

      <Link
        to="/tasks"
        className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 text-gray-400 shadow-sm"
      >
        <Search size={18} />

        <span className="text-sm">
          Search for a task (e.g. design, delivery, tutoring...)
        </span>
      </Link>


      {/* ---------------------------------------------------
          CATEGORIES
      --------------------------------------------------- */}

      <div>

        <h3 className="font-semibold text-brand-navy text-lg mb-4">
          Categories
        </h3>

        <div className="grid grid-cols-4 gap-x-3 gap-y-5">

          {categories.slice(0, 8).map((category) => {

            const Icon =
              CATEGORY_ICONS[category.slug] || Plus;

            return (
              <Link
                key={category._id}
                to={`/tasks?category=${category._id}`}
                className="flex flex-col items-center text-center group"
              >

                {/* Icon container */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-150 group-active:scale-95"
                  style={{
                    backgroundColor: `${category.color}1A`,
                  }}
                >

                  <Icon
                    size={26}
                    strokeWidth={2.2}
                    style={{
                      color: category.color,
                    }}
                  />

                </div>


                {/* Category name */}
                <span className="text-[11px] font-medium text-gray-600 leading-tight">
                  {category.name}
                </span>

              </Link>
            );
          })}

        </div>

      </div>


      {/* ---------------------------------------------------
          QUICK TASKS
      --------------------------------------------------- */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <h3 className="font-semibold text-brand-navy">
            ⚡ Quick Tasks
          </h3>

          <Link
            to="/tasks"
            className="text-sm text-brand-blue font-medium"
          >
            See all
          </Link>

        </div>


        {/* Loading */}
        {loading ? (

          <TaskListSkeleton />

        ) : tasks.length ? (

          /* Tasks */
          <div className="space-y-3">

            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
              />
            ))}

          </div>

        ) : (

          /* Empty state */
          <EmptyState
            title="No tasks yet"
            subtitle="Check back soon, or post the first one!"
          />

        )}

      </div>

    </div>
  );
        }
