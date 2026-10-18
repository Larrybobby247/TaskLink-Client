import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { tasksApi, applicationsApi } from '../../api/tasks.js';
import { ordersApi } from '../../api/orders.js';
import { messagesApi } from '../../api/users.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatNaira } from '../../utils/money.js';

// What the client should know / do next, depending on where the selected order is.
const ORDER_STAGE_TEXT = {
  AWAITING_PLAN: (name) => `Waiting for ${name} to send their requirements and work plan.`,
  PLAN_REVIEW: (name) => `${name} sent a work plan. Review it to continue.`,
  AWAITING_PAYMENT: () => 'You approved the plan. Make payment so the work can start.',
};

export default function TaskApplicationsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState(null);
  const [task, setTask] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    tasksApi.applications(taskId)
      .then((res) => {
        setApplications(res.data.applications);
        setTask(res.data.task || null);
        setActiveOrder(res.data.activeOrder || null);
      })
      .catch((err) => setLoadError(err.message));
  useEffect(() => { load(); }, [taskId]); // eslint-disable-line

  if (loadError) return <ErrorState message={loadError} />;
  if (!applications) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const doAction = async (fn) => {
    setBusy(true);
    setActionError('');
    try { await fn(); await load(); } catch (err) { setActionError(err.message); } finally { setBusy(false); }
  };

  const confirmSelect = async () => {
    setBusy(true);
    setActionError('');
    try {
      const { data } = await ordersApi.selectWorker(confirming._id);

      // Create the conversation while the accepted application ID is available.
      // It is non-blocking: the order exists either way.
      try {
        await messagesApi.startConversation(confirming._id);
      } catch (err) {
        console.warn('Could not create order conversation:', err);
      }

      navigate(`/client/orders/${data.order._id}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  };

  const amountFor = (app) =>
    task?.budgetType === 'NEGOTIABLE' && app.proposedAmountKobo ? app.proposedAmountKobo : task?.budgetKobo || 0;

  const selectedName = activeOrder?.worker?.fullName?.split(' ')[0] || 'your worker';
  const locked = Boolean(activeOrder); // a worker is already selected for this task

  return (
    <div className="space-y-4 pb-10">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Applications</h1>
        {task?.title && <p className="text-sm text-gray-400 mt-0.5 truncate">{task.title}</p>}
      </div>

      {actionError && <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{actionError}</div>}

      {activeOrder && (
        <div className="card p-4 bg-purple-50 border-purple-100 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-brand-navy">You selected {activeOrder.worker?.fullName || 'a worker'}</p>
            <StatusBadge status={activeOrder.status} />
          </div>
          <p className="text-sm text-gray-600">
            {(ORDER_STAGE_TEXT[activeOrder.status] || (() => 'This job is underway.'))(selectedName)}
          </p>
          <Link to={`/client/orders/${activeOrder._id}`} className="btn-primary text-sm inline-block">Open order</Link>
        </div>
      )}

      {applications.length === 0 ? (
        <EmptyState title="No applications yet." />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const open = app.status === 'PENDING' || app.status === 'SHORTLISTED';
            const profilePath = `/profile/${app.worker?._id}`;
            return (
              <div key={app._id} className="card p-4">
                <div className="flex items-center gap-3">
                  <Link to={profilePath} className="shrink-0" aria-label={`View ${app.worker?.fullName || 'applicant'}'s profile`}>
                    {app.worker?.profileImage?.url ? (
                      <img src={app.worker.profileImage.url} className="w-11 h-11 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-semibold">{app.worker?.fullName?.[0]}</div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={profilePath} className="font-semibold truncate hover:text-brand-blue block">{app.worker?.fullName}</Link>
                    <p className="text-xs text-gray-400">⭐ {app.worker?.rating?.toFixed?.(1) || '—'} · {app.worker?.reviewCount || 0} reviews · {app.worker?.completedTasksAsWorker || 0} tasks completed</p>
                  </div>
                  {app.proposedAmountKobo ? <p className="font-bold text-green-600 shrink-0">{formatNaira(app.proposedAmountKobo)}</p> : null}
                </div>

                <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{app.message}</p>
                {app.estimatedCompletionHours ? (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock size={12} /> Estimated {app.estimatedCompletionHours} hour{app.estimatedCompletionHours === 1 ? '' : 's'}</p>
                ) : null}

                <div className="flex flex-wrap gap-2 mt-3">
                  <Link to={profilePath} className="btn-secondary text-sm flex items-center justify-center gap-1.5 flex-1 min-w-[120px]">
                    <User size={14} /> View profile
                  </Link>
                  {open && !locked && (
                    <>
                      <button disabled={busy} onClick={() => doAction(() => applicationsApi.shortlist(app._id))} className="btn-secondary text-sm flex-1 min-w-[100px]">
                        {app.status === 'SHORTLISTED' ? 'Shortlisted ✓' : 'Shortlist'}
                      </button>
                      <button disabled={busy} onClick={() => setConfirming(app)} className="btn-primary text-sm flex-1 min-w-[100px]">Accept</button>
                      <button disabled={busy} onClick={() => doAction(() => applicationsApi.reject(app._id))} className="text-red-500 text-sm px-3">Reject</button>
                    </>
                  )}
                  {!open && <StatusBadge status={app.status} />}
                </div>
                {open && locked && <p className="text-xs text-gray-400 mt-2">On hold while you work with {selectedName}. If you choose a different worker, you can accept this applicant instead.</p>}
              </div>
            );
          })}
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-brand-navy mb-2">Accept this worker?</h3>
            <p className="text-sm text-gray-600 mb-2">
              You are selecting <strong>{confirming.worker?.fullName}</strong> for <strong>{formatNaira(amountFor(confirming))}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Next they will send you what they need from you and how they will do the job. You review it first, and you only pay once you approve it. If it isn't right you can pick a different applicant.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={confirmSelect} disabled={busy} className="btn-primary flex-1">{busy ? 'Confirming...' : 'Accept worker'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
