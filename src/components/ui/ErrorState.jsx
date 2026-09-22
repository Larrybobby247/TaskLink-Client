import React from 'react';
import { AlertTriangle } from 'lucide-react';
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <AlertTriangle size={32} className="text-red-400 mb-3" />
      <p className="text-sm text-gray-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4 text-sm">Try again</button>
      )}
    </div>
  );
}
