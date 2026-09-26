import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.js';
import FilterChips from '../../components/admin/FilterChips.jsx';
import Pagination from '../../components/admin/Pagination.jsx';
import ConfirmModal from '../../components/admin/ConfirmModal.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { formatNaira } from '../../utils/money.js';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: '', label: 'All' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
];

export default function AdminWithdrawalsPage() {
  const [status, setStatus] = useState('PENDING');
  const [state, setState] = useState({ loading: true, items: [], page: 1, totalPages: 1 });
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve'|'reject', withdrawal }

  const load = (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    adminApi.listWithdrawals({ status: status || undefined, page, limit: 15 })
      .then((res) => setState({ loading: false, items: res.data, ...res.pagination }));
  };
  useEffect(() => { load(1); }, [status]); // eslint-disable-line

  const runAction = async (reasonOrCode) => {
    const { type, withdrawal } = confirmAction;
    if (type === 'approve') await adminApi.approveWithdrawal(withdrawal._id, reasonOrCode || undefined);
    else await adminApi.rejectWithdrawal(withdrawal._id, reasonOrCode);
    load(state.page);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Withdrawals</h1>
        <p className="text-sm text-gray-400">Review and process worker payout requests.</p>
      </div>

      <FilterChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      {state.loading ? (
        <TaskListSkeleton rows={6} />
      ) : state.items.length ? (
        <div className="space-y-3">
          {state.items.map((w) => (
            <div key={w._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{w.user?.fullName} <span className="text-xs text-gray-400 font-normal">({w.user?.email})</span></p>
                <p className="text-xs text-gray-400 mt-1">
                  {w.bankName} · {w.accountName} · ****{w.accountNumberLast4}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">Ref: {w.reference} · Requested {new Date(w.requestedAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="font-bold text-brand-navy">{formatNaira(w.netAmountKobo)}</p>
                  {w.feeKobo > 0 && <p className="text-xs text-gray-400">Fee: {formatNaira(w.feeKobo)}</p>}
                </div>
                <StatusBadge status={w.status} />
              </div>
              {w.status === 'PENDING' && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setConfirmAction({ type: 'reject', withdrawal: w })} className="btn-secondary text-sm text-red-500 flex-1 sm:flex-none">Reject</button>
                  <button onClick={() => setConfirmAction({ type: 'approve', withdrawal: w })} className="btn-primary text-sm flex-1 sm:flex-none">Approve</button>
                </div>
              )}
              {w.status === 'FAILED' && w.failureReason && (
                <p className="text-xs text-red-500 w-full">Reason: {w.failureReason}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No withdrawal requests found" />
      )}

      <Pagination page={state.page} totalPages={state.totalPages} onChange={load} />

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === 'approve' ? 'Approve withdrawal' : 'Reject withdrawal'}
          description={
            confirmAction.type === 'approve'
              ? `Confirm the Paystack transfer for ${formatNaira(confirmAction.withdrawal.netAmountKobo)} has been sent to ${confirmAction.withdrawal.accountName}. Optionally paste the Paystack transfer code below.`
              : `This returns ${formatNaira(confirmAction.withdrawal.amountKobo)} to ${confirmAction.withdrawal.user?.fullName}'s wallet.`
          }
          confirmLabel={confirmAction.type === 'approve' ? 'Approve' : 'Reject'}
          danger={confirmAction.type === 'reject'}
          showReasonField
          requireReason={confirmAction.type === 'reject'}
          reasonPlaceholder={confirmAction.type === 'approve' ? 'Paystack transfer code (optional)' : 'Reason (required)'}
          onConfirm={runAction}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
