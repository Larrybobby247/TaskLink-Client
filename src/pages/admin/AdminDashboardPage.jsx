import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { formatNaira } from '../../utils/money.js';
import Spinner from '../../components/ui/Spinner.jsx';

const METRIC_LABELS = {
  totalUsers: 'Total Users', newUsersLast30d: 'New Users (30d)', totalTasks: 'Total Tasks',
  activeTasks: 'Active Tasks', completedTasks: 'Completed Tasks', cancelledTasks: 'Cancelled Tasks',
  disputedOrders: 'Disputed Orders', pendingWithdrawals: 'Pending Withdrawals',
  pendingDisputes: 'Pending Disputes', proSubscriptions: 'Pro Subscriptions',
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setMetrics(res.data.data));
  }, []);

  if (!metrics) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-brand-navy">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(METRIC_LABELS).map(([key, label]) => (
          <div key={key} className="card p-4">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-xl font-bold text-brand-navy mt-1">{metrics[key]}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs text-gray-400">Total Transaction Volume</p>
          <p className="text-xl font-bold text-brand-navy mt-1">{formatNaira(metrics.totalTransactionVolumeKobo)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400">Platform Revenue</p>
          <p className="text-xl font-bold text-green-600 mt-1">{formatNaira(metrics.platformRevenueKobo)}</p>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        User, task, payment, withdrawal, and dispute management tables use the same
        <code className="mx-1 bg-gray-100 px-1.5 py-0.5 rounded">/api/admin/*</code>
        endpoints documented in the README — build out dedicated table views here as needed.
      </p>
    </div>
  );
}
