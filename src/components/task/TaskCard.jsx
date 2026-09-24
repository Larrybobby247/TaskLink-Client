import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { formatNaira } from '../../utils/money.js';
import { timeUntil } from '../../utils/time.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TaskCard({ task }) {
  const { user } = useAuth();

  // Check if the logged-in user is the person who posted this task
  const isOwner =
    user?._id &&
    task?.client?._id &&
    String(task.client._id) === String(user._id);

  return (
    <Link
      to={`/tasks/${task._id}`}
      className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
    >
      {/* Category Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{
          backgroundColor: `${
            task.category?.color || '#1E3A5F'
          }1A`,
        }}
      >
        <span>
          {task.category?.icon ? '🗂️' : '📌'}
        </span>
      </div>

      {/* Task Information */}
      <div className="flex-1 min-w-0">

        <p className="font-semibold text-brand-navy truncate">
          {task.title}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">

          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {task.isRemote ? 'Online' : task.location}
          </span>

          <span className="flex items-center gap-1">
            <Clock size={12} />
            {timeUntil(task.deadline)}
          </span>

        </div>

        {task.category?.name && (
          <span className="chip bg-brand-bg text-brand-navy mt-2">
            {task.category.name}
          </span>
        )}

      </div>

      {/* Budget + Action */}
      <div className="text-right shrink-0">

        <p className="font-bold text-green-600">
          {formatNaira(task.budgetKobo)}
        </p>

        {isOwner ? (
          <span className="btn-primary text-xs py-2 px-4 mt-2 inline-block">
            Manage
          </span>
        ) : (
          <span className="btn-primary text-xs py-2 px-4 mt-2 inline-block">
            Apply
          </span>
        )}

      </div>
    </Link>
  );
}
