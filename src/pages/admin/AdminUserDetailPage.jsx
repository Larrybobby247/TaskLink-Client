import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.js';
import ConfirmModal from '../../components/admin/ConfirmModal.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatNaira } from '../../utils/money.js';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const load = () => adminApi.getUser(id).then((res) => setData(res.data));
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  if (!data) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  const { user, tasks, ordersAsClient, ordersAsWorker, balanceKobo } = data;

  const runAction = async () => {
    const { type } = confirmAction;
    if (type === 'verify') await adminApi.verifyUser(user._id);
    if (type === 'suspend') await adminApi.suspendUser(user._id, confirmAction.reason);
    if (type === 'unsuspend') await adminApi.unsuspendUser(user._id);
    if (type === 'deactivate') await adminApi.deactivateUser(user._id);
    load();
  };

  return (
    <div className="space-y-5 pb-10">
      <Link to="/admin/users" className="text-sm text-brand-blue">← Back to users</Link>

      <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          {user.profileImage?.url ? (
            <img src={user.profileImage.url} className="w-14 h-14 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold">{user.fullName?.[0]}</div>
          )}
          <div>
            <p className="font-bold text-brand-navy">{user.fullName} {user.identityVerified && <span className="text-brand-blue text-sm">✓ Verified</span>}</p>
            <p className="text-sm text-gray-400">@{user.username} · {user.email} · {user.phone}</p>
            <div className="flex gap-2 mt-2">
              <StatusBadge status={user.accountStatus} />
              {user.plan === 'PRO' && <span className="chip bg-purple-50 text-purple-600">PRO</span>}
              <span className="chip bg-gray-100 text-gray-500">{user.role}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!user.identityVerified && <button onClick={() => setConfirmAction({ type: 'verify' })} className="btn-secondary text-sm">Verify</button>}
          {user.accountStatus === 'ACTIVE' ? (
            <button onClick={() => setConfirmAction({ type: 'suspend' })} className="btn-secondary text-sm text-yellow-700">Suspend</button>
          ) : user.accountStatus === 'SUSPENDED' ? (
            <button onClick={() => setConfirmAction({ type: 'unsuspend' })} className="btn-secondary text-sm text-green-700">Unsuspend</button>
          ) : null}
          {user.accountStatus !== 'DEACTIVATED' && (
            <button onClick={() => setConfirmAction({ type: 'deactivate' })} className="btn-secondary text-sm text-red-500">Deactivate</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4"><p className="text-xs text-gray-400">Wallet balance</p><p className="font-bold text-brand-navy">{formatNaira(balanceKobo)}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-400">Rating</p><p className="font-bold text-brand-navy">⭐ {user.rating?.toFixed?.(1) || '—'} ({user.reviewCount || 0})</p></div>
        <div className="card p-4"><p className="text-xs text-gray-400">Tasks completed (worker)</p><p className="font-bold text-brand-navy">{user.completedTasksAsWorker || 0}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-400">Tasks completed (client)</p><p className="font-bold text-brand-navy">{user.completedTasksAsClient || 0}</p></div>
      </div>

      <button onClick={() => setAdjustOpen(true)} className="text-sm text-brand-blue font-medium">+ Create a balance adjustment</button>

      <div>
        <h3 className="font-semibold text-brand-navy mb-2">Posted tasks ({tasks.length})</h3>
        <div className="card divide-y divide-gray-100">
          {tasks.length ? tasks.map((t) => (
            <div key={t._id} className="p-3 flex items-center justify-between text-sm">
              <span className="truncate">{t.title}</span>
              <StatusBadge status={t.status} />
            </div>
          )) : <p className="p-3 text-sm text-gray-400">No tasks posted.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-brand-navy mb-2">Orders as client ({ordersAsClient.length})</h3>
          <div className="card divide-y divide-gray-100">
            {ordersAsClient.length ? ordersAsClient.map((o) => (
              <div key={o._id} className="p-3 flex items-center justify-between text-sm">
                <span>{formatNaira(o.agreedAmountKobo)}</span>
                <StatusBadge status={o.status} />
              </div>
            )) : <p className="p-3 text-sm text-gray-400">None yet.</p>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-brand-navy mb-2">Orders as worker ({ordersAsWorker.length})</h3>
          <div className="card divide-y divide-gray-100">
            {ordersAsWorker.length ? ordersAsWorker.map((o) => (
              <div key={o._id} className="p-3 flex items-center justify-between text-sm">
                <span>{formatNaira(o.workerNetAmountKobo)}</span>
                <StatusBadge status={o.status} />
              </div>
            )) : <p className="p-3 text-sm text-gray-400">None yet.</p>}
          </div>
        </div>
      </div>

      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === 'verify' ? 'Verify user' :
            confirmAction.type === 'suspend' ? 'Suspend user' :
            confirmAction.type === 'unsuspend' ? 'Unsuspend user' : 'Deactivate user'
          }
          description={`This will affect ${user.fullName}'s account.`}
          danger={confirmAction.type === 'suspend' || confirmAction.type === 'deactivate'}
          requireReason={confirmAction.type === 'suspend'}
          onConfirm={async (reason) => { confirmAction.reason = reason; await runAction(); }}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {adjustOpen && (
        <BalanceAdjustmentModal userId={user._id} onDone={() => { setAdjustOpen(false); load(); }} onClose={() => setAdjustOpen(false)} />
      )}
    </div>
  );
}

function BalanceAdjustmentModal({ userId, onDone, onClose }) {
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState('credit');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!amount || !reason.trim()) { setError('Amount and reason are required'); return; }
    setBusy(true);
    setError('');
    try {
      const amountKobo = Math.round(Number(amount) * 100) * (direction === 'debit' ? -1 : 1);
      await adminApi.createBalanceAdjustment({ userId, amountKobo, reason: reason.trim() });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-brand-navy mb-3">Balance adjustment</h3>
        <p className="text-xs text-gray-400 mb-4">
          This creates an explicit, audited ledger entry (never a direct balance edit) —
          your admin id, the reason, and a timestamp are recorded with it.
        </p>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{error}</div>}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setDirection('credit')} className={`chip flex-1 justify-center ${direction === 'credit' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Credit (+)</button>
          <button onClick={() => setDirection('debit')} className={`chip flex-1 justify-center ${direction === 'debit' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>Debit (−)</button>
        </div>
        <input className="input-field mb-3" type="number" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <textarea className="input-field mb-4" placeholder="Reason (required, e.g. 'refund for order #123 dispute resolution')" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={busy} className="btn-primary flex-1">{busy ? 'Saving...' : 'Create adjustment'}</button>
        </div>
      </div>
    </div>
  );
}
