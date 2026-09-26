import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.js';
import AdminStatCard from '../../components/admin/AdminStatCard.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { formatNaira } from '../../utils/money.js';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    adminApi.getDashboard().then((res) => setMetrics(res.data)).catch((err) => setError(err.message));
  };
  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!metrics) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Dashboard</h1>
        <p className="text-sm text-gray-400">Platform overview and key metrics.</p>
      </div>

      {/* Money at a glance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminStatCard label="Total Transaction Volume" value={formatNaira(metrics.totalTransactionVolumeKobo)} sub="All successful payments" />
        <AdminStatCard label="Platform Profit" value={formatNaira(metrics.platformRevenueKobo)} tone="green" sub="Total commission earned" />
        <AdminStatCard label="Pending Withdrawals" value={metrics.pendingWithdrawals} tone={metrics.pendingWithdrawals > 0 ? 'yellow' : 'default'} sub={<Link to="/admin/withdrawals" className="text-brand-blue">Review →</Link>} />
      </div>

      {/* Users & activity */}
      <div>
        <h2 className="font-semibold text-brand-navy mb-3">Users</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AdminStatCard label="Total Users" value={metrics.totalUsers} />
          <AdminStatCard label="New Users (30d)" value={metrics.newUsersLast30d} />
          <AdminStatCard label="Pro Subscriptions" value={metrics.proSubscriptions} />
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-brand-navy mb-3">Tasks & Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminStatCard label="Total Tasks" value={metrics.totalTasks} />
          <AdminStatCard label="Active Tasks" value={metrics.activeTasks} />
          <AdminStatCard label="Completed Tasks" value={metrics.completedTasks} tone="green" />
          <AdminStatCard label="Cancelled Tasks" value={metrics.cancelledTasks} tone="red" />
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-brand-navy mb-3">Needs attention</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link to="/admin/disputes">
            <AdminStatCard label="Pending Disputes" value={metrics.pendingDisputes} tone={metrics.pendingDisputes > 0 ? 'red' : 'default'} />
          </Link>
          <Link to="/admin/withdrawals">
            <AdminStatCard label="Pending Withdrawals" value={metrics.pendingWithdrawals} tone={metrics.pendingWithdrawals > 0 ? 'yellow' : 'default'} />
          </Link>
          <Link to="/admin/tasks">
            <AdminStatCard label="Disputed Orders" value={metrics.disputedOrders} tone={metrics.disputedOrders > 0 ? 'red' : 'default'} />
          </Link>
        </div>
      </div>
    </div>
  );
}
