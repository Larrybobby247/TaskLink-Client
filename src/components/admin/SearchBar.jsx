import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search...' }) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 card px-3 py-2">
      <Search size={18} className="text-gray-400 shrink-0" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 outline-none text-sm min-w-0" />
    </form>
  );
}
