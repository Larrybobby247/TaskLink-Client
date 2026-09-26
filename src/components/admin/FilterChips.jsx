import React from 'react';

export default function FilterChips({ options, value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {options.map((opt) => {
        const key = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = value === key;
        return (
          <button
            key={String(key)}
            onClick={() => onChange(key)}
            className={`chip whitespace-nowrap ${active ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
