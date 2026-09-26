import React from 'react';

export default function AdminStatCard({ label, value, sub, tone = 'default' }) {
  const toneClasses = {
    default: 'text-brand-navy',
    green: 'text-green-600',
    red: 'text-red-500',
    yellow: 'text-yellow-600',
  };
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-xl font-bold mt-1 ${toneClasses[tone] || toneClasses.default}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
