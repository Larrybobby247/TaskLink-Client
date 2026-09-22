import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ordersApi, paymentsApi } from '../../api/orders.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatNaira } from '../../utils/money.js';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [revisionMessage, setRevisionMessage] = useState('');

  const load = () => ordersApi.get(id).then((res) => setOrder(res.data.order));
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  if (!order) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const isClient = String(order.client._id || order.client) === String(user._id);
  const isWorker = String(order.worker._id || order.worker) === String(user._id);

  const pay = async () => {
    setBusy(true);
    try {
      const { data } = await paymentsApi.initialize(order._id);
      window.location.href = data.authorizationUrl;
    } finally {
      setBusy(false);
    }
  };

  const submitWork = async () => {
    setBusy(true);
    try {
      await ordersApi.submit(order._id, { message });
      await load();
      setMessage('');
    } finally {
      setBusy(false);
    }
  };

  const requestRevision = async () => {
    setBusy(true);
    try {
      await ordersApi.revision(order._id, { message: revisionMessage });
      await load();
      setRevisionMessage('');
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    setBusy(true);
    try { await ordersApi.approve(order._id); await load(); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <h1 className="text-lg font-bold text-brand-navy">{order.task?.title}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-2xl font-bold text-green-600 mt-3">{formatNaira(order.agreedAmountKobo)}</p>
        <p className="text-xs text-gray-400">Platform fee: {formatNaira(order.platformFeeKobo)} · Worker gets {formatNaira(order.workerNetAmountKobo)}</p>
      </div>

      {isClient && order.status === 'AWAITING_PAYMENT' && (
        <div className="card p-5">
          <p className="text-sm text-gray-600 mb-3">Payment is required before the worker can start.</p>
          <button onClick={pay} disabled={busy} className="btn-primary w-full">{busy ? 'Redirecting...' : `Pay ${formatNaira(order.agreedAmountKobo)}`}</button>
        </div>
      )}

      {isWorker && ['IN_PROGRESS', 'REVISION_REQUESTED'].includes(order.status) && (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-brand-navy">Submit your work</h3>
          <textarea className="input-field min-h-[100px]" placeholder="Describe what you're submitting..." value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={submitWork} disabled={busy || !message} className="btn-primary w-full">{busy ? 'Submitting...' : 'Submit Work'}</button>
        </div>
      )}

      {isClient && order.status === 'SUBMITTED' && (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-brand-navy">Review submission</h3>
          {order.submissions?.length > 0 && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{order.submissions[order.submissions.length - 1].message}</p>
          )}
          <div className="flex gap-3">
            <button onClick={approve} disabled={busy} className="btn-primary flex-1">Approve</button>
          </div>
          <textarea className="input-field min-h-[80px]" placeholder="Explain what needs to change..." value={revisionMessage} onChange={(e) => setRevisionMessage(e.target.value)} />
          <button onClick={requestRevision} disabled={busy || !revisionMessage} className="btn-secondary w-full">Request Revision</button>
        </div>
      )}

      {order.status === 'COMPLETED' && (
        <div className="card p-5 bg-green-50 border-green-100 text-center">
          <p className="font-semibold text-green-700">Task completed 🎉</p>
        </div>
      )}
    </div>
  );
}
