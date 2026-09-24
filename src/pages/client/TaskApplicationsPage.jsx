import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksApi, applicationsApi } from '../../api/tasks.js';
import { ordersApi } from '../../api/orders.js';
import { messagesApi } from '../../api/users.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatNaira } from '../../utils/money.js';

export default function TaskApplicationsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => tasksApi.applications(taskId).then((res) => setApplications(res.data.applications));
  useEffect(() => { load(); }, [taskId]); // eslint-disable-line

  if (!applications) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const doAction = async (fn) => {
    setBusy(true);
    try { await fn(); await load(); } finally { setBusy(false); }
  };

  const confirmSelect = async () => {
    setBusy(true);
    try {
      const { data } = await ordersApi.selectWorker(confirming._id);

      // Create the conversation while the accepted application ID is available.
      // The order detail endpoint may not expose applicationId yet.
      try {
        await messagesApi.startConversation(confirming._id);
      } catch (err) {
        // Conversation creation is intentionally non-blocking. The order is
        // still created and the user can retry from the order page.
        console.warn('Could not create order conversation:', err);
      }

      navigate(`/client/orders/${data.order._id}`);
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">Applications</h1>

      {applications.length === 0 ? (
        <EmptyState title="No applications yet." />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app._id} className="card p-4">
              <div className="flex items-center gap-3">
                {app.worker?.profileImage?.url ? (
                  <img src={app.worker.profileImage.url} className="w-11 h-11 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-semibold">{app.worker?.fullName?.[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{app.worker?.fullName}</p>
                  <p className="text-xs text-gray-400">⭐ {app.worker?.rating?.toFixed?.(1) || '—'} · {app.worker?.completedTasksAsWorker || 0} tasks completed</p>
                </div>
                {app.proposedAmountKobo && <p className="font-bold text-green-600">{formatNaira(app.proposedAmountKobo)}</p>}
              </div>
              <p className="text-sm text-gray-600 mt-3">{app.message}</p>
              {app.status === 'PENDING' || app.status === 'SHORTLISTED' ? (
                <div className="flex gap-2 mt-3">
                  <button disabled={busy} onClick={() => doAction(() => applicationsApi.shortlist(app._id))} className="btn-secondary text-sm flex-1">Shortlist</button>
                  <button disabled={busy} onClick={() => setConfirming(app)} className="btn-primary text-sm flex-1">Accept</button>
                  <button disabled={busy} onClick={() => doAction(() => applicationsApi.reject(app._id))} className="text-red-500 text-sm px-3">Reject</button>
                </div>
              ) : (
                <span className="chip bg-gray-100 text-gray-500 mt-3 inline-block">{app.status}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-brand-navy mb-2">Confirm selection</h3>
            <p className="text-sm text-gray-600 mb-5">
              You are selecting <strong>{confirming.worker?.fullName}</strong> for{' '}
              <strong>{formatNaira(confirming.proposedAmountKobo || 0)}</strong>. Other applicants will be notified they weren't selected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmSelect} disabled={busy} className="btn-primary flex-1">{busy ? 'Confirming...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
