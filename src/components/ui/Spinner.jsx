import React from 'react';
export default function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-200 border-t-brand-navy ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
