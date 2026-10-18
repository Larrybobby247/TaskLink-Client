import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi, paymentsApi } from '../../api/orders.js';
import { reviewsApi } from '../../api/reviews.js';
import { messagesApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { formatNaira } from '../../utils/money.js';
import { Star, MessageCircle } from 'lucide-react';
import { PlanSummary, WorkerPlanForm, ClientPlanReview, PaymentPanel, MilestoneProgress } from '../../components/order/OrderPlan.jsx';

const getUserId = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return String(value._id || value.id || '');
  return String(value);
};

// Revision messages are returned by the order API. Support the common response
// shapes so the worker can still see the request if the API returns a history
// array or a single latest-revision field.
const getLatestRevisionMessage = (order) => {
  const revisionRequests = Array.isArray(order?.revisionRequests)
    ? order.revisionRequests
    : [];

  const latestRevision =
    revisionRequests[revisionRequests.length - 1];

  return (
    latestRevision?.message ||
    ''
  );
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [revisionMessage, setRevisionMessage] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [declineOpen, setDeclineOpen] = useState(false);

  const load = async () => {
    const { data } = await ordersApi.get(id);
    const nextOrder = data.order;
    setOrder(nextOrder);

    if (nextOrder?.status === 'COMPLETED' && user) {
      const currentUserId = getUserId(user);
      const clientId = getUserId(nextOrder.client);
      if (currentUserId === clientId) {
        try {
          const reviewRes = await reviewsApi.getOrderReview(nextOrder._id);
          setReviewSubmitted(Boolean(reviewRes?.data?.review));
        } catch (err) {
          setReviewSubmitted(false);
        }
      } else {
        setReviewSubmitted(false);
      }
    } else {
      setReviewSubmitted(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id, user]);

  if (!order) {
    return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  }

  const currentUserId = getUserId(user);
  const clientId = getUserId(order.client);
  const workerId = getUserId(order.worker);
  const isClient = currentUserId === clientId;
  const isWorker = currentUserId === workerId;
  const latestRevisionMessage = getLatestRevisionMessage(order);

  // Milestone-based orders: which milestone is being worked on / reviewed right now.
  const milestones = order.plan?.useMilestones ? order.plan.milestones || [] : [];
  const hasMilestones = milestones.length > 0;
  const workingMilestone = milestones.find((m) => ['FUNDED', 'REVISION_REQUESTED'].includes(m.status));
  const reviewMilestone = milestones.find((m) => m.status === 'SUBMITTED');
  const hasUnpaidMilestone = milestones.some((m) => m.status === 'PENDING_PAYMENT');
  const planReady = Boolean(order.plan?.acceptedAt);

  const openOrCreateConversation = async () => {
    if (!order || !user) return;
    const orderClientId = getUserId(order.client);
    const orderWorkerId = getUserId(order.worker);

    if (!orderClientId || !orderWorkerId) {
      setChatError('This order is missing participant details.');
      return;
    }
    if (currentUserId !== orderClientId && currentUserId !== orderWorkerId) {
      setChatError('You are not part of this order.');
      return;
    }

    setChatBusy(true);
    setChatError('');
    try {
      const conversationsRes = await messagesApi.conversations();
      const existing = (conversationsRes?.data || []).find((conversation) => {
        const participants = conversation?.participants || [];
        const hasClient = participants.some((participant) => getUserId(participant) === orderClientId);
        const hasWorker = participants.some((participant) => getUserId(participant) === orderWorkerId);
        return hasClient && hasWorker;
      });

      if (existing?._id) {
        navigate(`/messages/${existing._id}`);
        return;
      }

      const applicationId = order.applicationId || order.application?._id || order.application;
      if (!applicationId) {
        setChatError('This order has no conversation yet and is missing its application reference. Please ask the client to open the chat from the accepted application.');
        return;
      }

      const created = await messagesApi.startConversation(applicationId);
      const conversationId = created?.data?.conversation?._id || created?.data?._id || created?.conversation?._id || created?._id;
      if (conversationId) navigate(`/messages/${conversationId}`);
      else navigate('/messages');
    } catch (err) {
      setChatError(err?.message || 'Unable to open chat right now.');
    } finally {
      setChatBusy(false);
    }
  };

  const pay = async () => {
    setBusy(true);
    try {
      const { data } = await paymentsApi.initialize(order._id);
      window.location.href = data.authorizationUrl;
    } finally { setBusy(false); }
  };

  const submitWork = async () => {
    setBusy(true);
    try {
      await ordersApi.submit(order._id, { message });
      await load();
      setMessage('');
    } finally { setBusy(false); }
  };

  const requestRevision = async () => {
    setBusy(true);
    try {
      await ordersApi.revision(order._id, { message: revisionMessage.trim() });
      await load();
      setRevisionMessage('');
    } finally { setBusy(false); }
  };

  const approve = async () => {
    setBusy(true);
    try {
      await ordersApi.approve(order._id);
      await load();
    } finally { setBusy(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating) return setReviewError('Please select a rating.');
    if (!reviewMessage.trim()) return setReviewError('Please write a short review.');

    setReviewBusy(true);
    setReviewError('');
    try {
      await reviewsApi.create({
        orderId: order._id,
        workerId: order.worker?._id || order.worker,
        rating,
        comment: reviewMessage.trim(),
      });
      setReviewSubmitted(true);
      setReviewMessage('');
    } catch (err) {
      if (err?.response?.status === 409) setReviewSubmitted(true);
      else setReviewError(err?.response?.data?.message || err?.message || 'Unable to submit review.');
    } finally { setReviewBusy(false); }
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold text-brand-navy">{order.task?.title}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-2xl font-bold text-green-600 mt-3">{formatNaira(order.agreedAmountKobo)}</p>
        <p className="text-xs text-gray-400">Platform fee: {formatNaira(order.platformFeeKobo)} · Worker gets {formatNaira(order.workerNetAmountKobo)}</p>

        {(isClient || isWorker) && ['AWAITING_PLAN', 'PLAN_REVIEW', 'AWAITING_PAYMENT', 'PAYMENT_SECURED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'COMPLETED'].includes(order.status) && (
          <div className="mt-4">
            <button type="button" onClick={openOrCreateConversation} disabled={chatBusy} className="btn-secondary w-full flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              {chatBusy ? 'Opening chat...' : 'Message'}
            </button>
            {chatError && <p className="text-sm text-red-500 mt-2">{chatError}</p>}
          </div>
        )}
      </div>

      {/* ---- Step 1: worker sends requirements + work plan ---- */}
      {order.status === 'AWAITING_PLAN' && isClient && (
        <>
          <div className="card p-5 text-center space-y-2">
            <p className="font-semibold text-brand-navy">Waiting for {order.worker?.fullName?.split(' ')[0] || 'your worker'}'s work plan</p>
            <p className="text-sm text-gray-500">
              {order.plan?.changeRequestCount > 0
                ? 'You asked for changes. They will send an updated plan for you to review.'
                : "They'll list what they need from you and how they'll do the job. You'll review it before paying anything."}
            </p>
            <button type="button" onClick={() => setDeclineOpen(true)} className="text-sm font-medium text-red-500 pt-1">Choose a different worker</button>
          </div>
          {declineOpen && (
            <ConfirmModal
              title="Choose a different worker?"
              description="This worker will be told you went another way and your task will reopen so you can pick someone else. You haven't paid anything yet."
              confirmLabel="Choose another worker"
              danger
              onConfirm={async () => {
                await ordersApi.declineWorker(order._id);
                navigate(`/client/tasks/${order.task?._id || order.task}/applications`);
              }}
              onClose={() => setDeclineOpen(false)}
            />
          )}
        </>
      )}
      {order.status === 'AWAITING_PLAN' && isWorker && <WorkerPlanForm order={order} onDone={load} />}

      {/* ---- Step 2: client reviews the plan ---- */}
      {order.status === 'PLAN_REVIEW' && isClient && (
        <ClientPlanReview
          order={order}
          onDone={load}
          onWorkerDeclined={() => navigate(`/client/tasks/${order.task?._id || order.task}/applications`)}
        />
      )}
      {order.status === 'PLAN_REVIEW' && isWorker && (
        <>
          <PlanSummary plan={order.plan} title="Your work plan" />
          <div className="card p-5 text-center bg-gray-50">
            <p className="font-semibold text-brand-navy">Waiting for the client to review your plan</p>
            <p className="text-sm text-gray-500 mt-1">You'll be notified when they approve it or ask for changes.</p>
          </div>
        </>
      )}

      {/* ---- Step 3: payment (single payment or milestone by milestone) ---- */}
      {isClient && planReady && hasUnpaidMilestone && ['AWAITING_PAYMENT', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED'].includes(order.status) && <PaymentPanel order={order} />}
      {isClient && order.status === 'AWAITING_PAYMENT' && !hasMilestones && <PaymentPanel order={order} />}
      {isWorker && order.status === 'AWAITING_PAYMENT' && (
        <>
          <PlanSummary plan={order.plan} title="Your approved work plan" hideMilestones={hasMilestones} />
          <div className="card p-5 text-center bg-gray-50">
            <p className="font-semibold text-brand-navy">{hasMilestones && milestones.some((m) => m.status === 'APPROVED') ? 'Waiting for the client to fund the next milestone' : 'Waiting for the client to pay'}</p>
            <p className="text-sm text-gray-500 mt-1">You can start as soon as the payment is secured.</p>
          </div>
        </>
      )}

      {/* ---- Agreed plan stays visible during and after the job ---- */}
      {['IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'COMPLETED'].includes(order.status) && order.plan?.structure && (
        <PlanSummary plan={order.plan} title="Agreed work plan" hideMilestones />
      )}
      {(hasMilestones && !(isClient && order.status === 'AWAITING_PAYMENT') && order.status !== 'AWAITING_PLAN' && order.status !== 'PLAN_REVIEW') && !(isClient && hasUnpaidMilestone && ['AWAITING_PAYMENT', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED'].includes(order.status)) && <MilestoneProgress order={order} />}

      {isWorker && order.status === 'REVISION_REQUESTED' && latestRevisionMessage && (
        <div className="card p-5 border-yellow-200 bg-yellow-50">
          <h3 className="font-semibold text-yellow-800">Changes requested by the client</h3>
          <p className="text-sm text-yellow-900 whitespace-pre-wrap mt-2">{latestRevisionMessage}</p>
        </div>
      )}

      {isWorker && ['IN_PROGRESS', 'REVISION_REQUESTED'].includes(order.status) && (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-brand-navy">{workingMilestone ? `Submit work for "${workingMilestone.title}"` : 'Submit your work'}</h3>
          <textarea className="input-field min-h-[100px]" placeholder="Describe what you're submitting..." value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={submitWork} disabled={busy || !message.trim()} className="btn-primary w-full">{busy ? 'Submitting...' : 'Submit Work'}</button>
        </div>
      )}

      {isClient && order.status === 'SUBMITTED' && (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-brand-navy">{reviewMilestone ? `Review "${reviewMilestone.title}"` : 'Review submission'}</h3>
          {order.submissions?.length > 0 && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{order.submissions[order.submissions.length - 1].message}</p>}
          <button onClick={approve} disabled={busy} className="btn-primary w-full">{reviewMilestone ? `Approve & release ${formatNaira(reviewMilestone.amountKobo)}` : 'Approve'}</button>
          <textarea className="input-field min-h-[80px]" placeholder="Explain what needs to change..." value={revisionMessage} onChange={(e) => setRevisionMessage(e.target.value)} />
          <button onClick={requestRevision} disabled={busy || !revisionMessage.trim()} className="btn-secondary w-full">Request Revision</button>
        </div>
      )}

      {order.status === 'COMPLETED' && (
        <>
          <div className="card p-5 bg-green-50 border-green-100 text-center"><p className="font-semibold text-green-700">Task completed 🎉</p></div>
          {isClient && !reviewSubmitted && (
            <div className="card p-5">
              <div className="mb-5"><h3 className="font-semibold text-brand-navy text-lg">Rate your experience</h3><p className="text-sm text-gray-500 mt-1">How was your experience working with this worker?</p></div>
              <form onSubmit={submitReview} className="space-y-5">
                <div><p className="text-sm font-medium text-gray-700 mb-2">Your rating</p><div className="flex items-center gap-2">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setRating(star)} aria-label={`Rate ${star} stars`}><Star size={26} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} /></button>)}</div></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-2">Your review</label><textarea className="input-field min-h-[110px]" placeholder="Share your experience with this worker..." value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} /></div>
                {reviewError && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{reviewError}</p>}
                <button type="submit" disabled={reviewBusy || !rating || !reviewMessage.trim()} className="btn-primary w-full">{reviewBusy ? 'Submitting Review...' : 'Submit Review'}</button>
              </form>
            </div>
          )}
          {isClient && reviewSubmitted && <div className="card p-5 text-center"><p className="font-semibold text-green-700">Thanks for your review!</p></div>}
        </>
      )}
    </div>
  );
}
