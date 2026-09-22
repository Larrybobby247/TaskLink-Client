import React from 'react';
import { useMode } from '../../context/ModeContext.jsx';

export default function ModeSwitcher() {
  const { mode, setMode } = useMode();
  const isWorker = mode === 'worker';

  return (
    <button
      onClick={() => setMode(isWorker ? 'client' : 'worker')}
      className="
        flex items-center justify-between gap-2
        w-full sm:w-auto
        bg-white border border-gray-200
        rounded-xl sm:rounded-full
        px-3 py-2
        text-sm font-medium
        shadow-sm
        transition
        active:scale-[0.98]
      "
    >
      <span className="text-gray-700 whitespace-nowrap">
        {isWorker ? '🧑‍💻 Worker Mode' : '👤 Client Mode'}
      </span>

      <span className="text-brand-blue font-semibold whitespace-nowrap">
        → {isWorker ? 'Client' : 'Earning'}
      </span>
    </button>
  );
}