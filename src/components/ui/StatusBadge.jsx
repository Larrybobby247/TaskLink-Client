import React from 'react';

const COLORS = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-blue-50 text-blue-600',
  APPLICATIONS_OPEN: 'bg-blue-50 text-blue-600',
  PAUSED: 'bg-yellow-50 text-yellow-700',
  WORKER_SELECTED: 'bg-purple-50 text-purple-600',
  AWAITING_PAYMENT: 'bg-orange-50 text-orange-600',
  PAYMENT_SECURED: 'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-green-50 text-green-700',
  SUBMITTED: 'bg-indigo-50 text-indigo-600',
  REVISION_REQUESTED: 'bg-yellow-50 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-50 text-red-600',
  DISPUTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  PENDING: 'bg-blue-50 text-blue-600',
  SHORTLISTED: 'bg-purple-50 text-purple-600',
  ACCEPTED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-600',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
};

export default function StatusBadge({ status }) {
  const cls = COLORS[status] || 'bg-gray-100 text-gray-600';
  return <span className={`chip ${cls}`}>{status?.replace(/_/g, ' ')}</span>;
}
