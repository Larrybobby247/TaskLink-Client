import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { formatNaira } from '../../utils/money.js';
import { timeUntil } from '../../utils/time.js';

export default function TaskCard({ task }) {
  return (
    <Link to={`/tasks/${task._id}`} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: `${task.category?.color || '#1E3A5F'}1A` }}>
        <span>{task.category?.icon ? '🗂️' : '📌'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-brand-navy truncate">{task.title}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
          <span className="flex items-center gap-1"><MapPin size={12} /> {task.isRemote ? 'Online' : task.location}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {timeUntil(task.deadline)}</span>
        </div>
        {task.category?.name && <span className="chip bg-brand-bg text-brand-navy mt-2">{task.category.name}</span>}
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-green-600">{formatNaira(task.budgetKobo)}</p>
        <span className="btn-primary text-xs py-2 px-4 mt-2 inline-block">Apply</span>
      </div>
    </Link>
  );
}
