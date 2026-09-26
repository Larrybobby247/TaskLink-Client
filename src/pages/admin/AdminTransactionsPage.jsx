import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.js';
import FilterChips from '../../components/admin/FilterChips.jsx';
import Pagination from '../../components/admin/Pagination.jsx';
import AdminStatCard from '../../components/admin/AdminStatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { formatNaira } from '../../utils/money.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

export default function AdminTransactionsPage() {
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    adminApi.listPayments({ status: status || undefined, page, limit: 15 })
      .then((res) => setState({ loading: false, items: res.data, ...res.pagination }));
  };
  useEffect(() => { load(1); }, [status]); // eslint-disable-line

  const successfulOnPage = state.items.filter((p) => p.status === 'SUCCESS');
  const pageVolume = successfulOnPage.reduce((sum, p) => sum + p.amountKobo, 0);
  const pageFees = successfulOnPage.reduce((sum, p) => sum + (p.platformFeeKobo || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Transactions</h1>
        <p className="text-sm text-gray-400">Every Paystack payment processed on the platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AdminStatCard label="Volume (this page)" value={formatNaira(pageVolume)} sub="Successful payments shown below" />
        <AdminStatCard label="Platform fees (this page)" value={formatNaira(pageFees)} tone="green" />
      </div>

      <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      {state.loading ? (
        <TaskListSkeleton rows={8} />
      ) : state.items.length ? (
        <div className="card divide-y divide-gray-100 overflow-x-auto">
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50 min-w-[700px]">
            <span className="col-span-3">User</span>
            <span className="col-span-2">Type</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2">Platform fee</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1">Date</span>
          </div>
          {state.items.map((p) => (
            <div key={p._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-4 py-3 items-center min-w-[700px] md:min-w-0 text-sm">
              <div className="md:col-span-3 min-w-0">
                <p className="font-medium truncate">{p.user?.fullName || 'Unknown'}</p>
                <p className="text-xs text-gray-400 truncate">{p.paystackReference}</p>
              </div>
              <span className="md:col-span-2 text-xs">{p.paymentType?.replace(/_/g, ' ')}</span>
              <span className="md:col-span-2 font-semibold">{formatNaira(p.amountKobo)}</span>
              <span className="md:col-span-2 text-green-600">{formatNaira(p.platformFeeKobo || 0)}</span>
              <span className="md:col-span-2"><StatusBadge status={p.status} /></span>
              <span className="md:col-span-1 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No transactions found" />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />
    </div>
  );
}
