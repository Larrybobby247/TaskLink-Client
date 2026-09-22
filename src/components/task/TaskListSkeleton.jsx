import React from 'react';
export default function TaskListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
          <div className="w-11 h-11 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-2 bg-gray-100 rounded w-1/3" />
          </div>
          <div className="h-6 w-16 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}
