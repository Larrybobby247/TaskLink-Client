import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi, paymentsApi } from '../../api/orders.js';
import { reviewsApi } from '../../api/reviews.js';
import { messagesApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatNaira } from '../../utils/money.js';
import { Star, MessageCircle } from 'lucide-react';

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

  // Review state
  const [rating, setRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const load = async () => {
    const { data } = await ordersApi.get(id);
    const nextOrder = data.order;

    setOrder(nextOrder);

    if (nextOrder?.status === 'COMPLETED' && user) {
      const currentUserId = String(user._id || user.id || '');
      const clientId = String(nextOrder.client?._id || nextOrder.client || '');

      if (currentUserId === clientId) {
        try {
          const reviewRes = await reviewsApi.getOrderReview(nextOrder._id);
          setReviewSubmitted(Boolean(reviewRes?.data?.review));
        } catch (err) {
          if (err?.response?.status === 404) {
            setReviewSubmitted(false);
          } else {
            console.error('Failed to load existing review:', err);
            setReviewSubmitted(false);
          }
        }
      } else {
        setReviewSubmitted(false);
      }
    } else {
      setReviewSubmitted(false);
    }
  };

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id, user]);

  if (!order) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  const getUserId = (value) => {
    if (!value) return null;

    if (typeof value === 'object') {
      return String(value._id || value.id || '');
    }

    return String(value);
  };

  const currentUserId = getUserId(user);
  const clientId = getUserId(order.client);
  const workerId = getUserId(order.worker);

  const isClient = currentUserId === clientId;
  const isWorker = currentUserId === workerId;

  const openOrCreateConversation = async () => {
    if (!order || !user) return;

    const currentId = String(user._id || user.id || '');
    const orderClientId = String(order.client?._id || order.client || '');
    const orderWorkerId = String(order.worker?._id || order.worker || '');

    if (!orderClientId || !orderWorkerId) {
      setChatError('This order is missing participant details.');
      return;
    }

    if (currentId !== orderClientId && currentId !== orderWorkerId) {
      setChatError('You are not part of this order.');
      return;
    }

    setChatBusy(true);
    setChatError('');

    try {
      const conversationsRes = await messagesApi.conversations();
      const existing = (conversationsRes?.data || []).find((conversation) => {
        const participants = conversation?.participants || [];
        const hasClient = participants.some(
          (participant) => String(participant?._id || participant) === orderClientId
        );
        const hasWorker = participants.some(
          (participant) => String(participant?._id || participant) === orderWorkerId
        );

        return hasClient && hasWorker;
      });

      if (existing?._id) {
        navigate(`/messages/${existing._id}`);
        return;
      }

      const startPayload = order.applicationId || order._id;
      const created = await messagesApi.startConversation(startPayload);
      const nextConversationId =
        created?.data?.conversation?._id ||
        created?.data?._id ||
        created?.conversation?._id ||
        created?._id;

      if (nextConversationId) {
        navigate(`/messages/${nextConversationId}`);
        return;
      }

      navigate('/messages');
    } catch (err) {
      const status = err?.status || err?.response?.status;

      if (status === 409) {
        navigate('/messages');
        return;
      }

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
      await ordersApi.revision(order._id, {
        message: revisionMessage,
      });

      await load();
      setRevisionMessage('');
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    setBusy(true);

    try {
      await ordersApi.approve(order._id);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!rating) {
      setReviewError('Please select a rating.');
      return;
    }

    if (!reviewMessage.trim()) {
      setReviewError('Please write a short review.');
      return;
    }

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
      setReviewError('');
    } catch (err) {
      const status = err?.response?.status;

      if (status === 409) {
        setReviewSubmitted(true);
        setReviewError('');
        return;
      }

      setReviewError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to submit review.'
      );
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold text-brand-navy">
            {order.task?.title}
          </h1>

          <StatusBadge status={order.status} />
        </div>

        <p className="text-2xl font-bold text-green-600 mt-3">
          {formatNaira(order.agreedAmountKobo)}
        </p>

        <p className="text-xs text-gray-400">
          Platform fee: {formatNaira(order.platformFeeKobo)} · Worker gets{' '}
          {formatNaira(order.workerNetAmountKobo)}
        </p>

        {(isClient || isWorker) &&
          ['PAYMENT_SECURED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'COMPLETED'].includes(
            order.status
          ) && (
            <div className="mt-4">
              <button
                type="button"
                onClick={openOrCreateConversation}
                disabled={chatBusy}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                {chatBusy ? 'Opening chat...' : 'Message'}
              </button>

              {chatError && (
                <p className="text-sm text-red-500 mt-2">{chatError}</p>
              )}
            </div>
          )}
      </div>

      {isClient && order.status === 'AWAITING_PAYMENT' && (
        <div className="card p-5">
          <p className="text-sm text-gray-600 mb-3">
            Payment is required before the worker can start.
          </p>

          <button
            onClick={pay}
            disabled={busy}
            className="btn-primary w-full"
          >
            {busy
              ? 'Redirecting...'
              : `Pay ${formatNaira(order.agreedAmountKobo)}`}
          </button>
        </div>
      )}

      {isWorker &&
        ['IN_PROGRESS', 'REVISION_REQUESTED'].includes(order.status) && (
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-brand-navy">
              Submit your work
            </h3>

            <textarea
              className="input-field min-h-[100px]"
              placeholder="Describe what you're submitting..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button
              onClick={submitWork}
              disabled={busy || !message.trim()}
              className="btn-primary w-full"
            >
              {busy ? 'Submitting...' : 'Submit Work'}
            </button>
          </div>
        )}

      {isClient && order.status === 'SUBMITTED' && (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-brand-navy">
            Review submission
          </h3>

          {order.submissions?.length > 0 && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {
                order.submissions[order.submissions.length - 1]
                  .message
              }
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={approve}
              disabled={busy}
              className="btn-primary flex-1"
            >
              Approve
            </button>
          </div>

          <textarea
            className="input-field min-h-[80px]"
            placeholder="Explain what needs to change..."
            value={revisionMessage}
            onChange={(e) => setRevisionMessage(e.target.value)}
          />

          <button
            onClick={requestRevision}
            disabled={busy || !revisionMessage.trim()}
            className="btn-secondary w-full"
          >
            Request Revision
          </button>
        </div>
      )}

      {order.status === 'COMPLETED' && (
        <>
          <div className="card p-5 bg-green-50 border-green-100 text-center">
            <p className="font-semibold text-green-700">Task completed 🎉</p>
          </div>

          {isClient && !reviewSubmitted && (
            <div className="card p-5">
              <div className="mb-5">
                <h3 className="font-semibold text-brand-navy text-lg">
                  Rate your experience
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  How was your experience working with this worker?
                </p>
              </div>

              <form onSubmit={submitReview} className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your rating
                  </p>

                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                        aria-label={`Rate ${star} out of 5`}
                      >
                        <Star
                          size={30}
                          strokeWidth={1.8}
                          className={
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>

                  {rating > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very good'}
                      {rating === 5 && 'Excellent'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Your review
                  </label>

                  <textarea
                    className="input-field min-h-[110px]"
                    placeholder="Share your experience with this worker..."
                    value={reviewMessage}
                    onChange={(e) => setReviewMessage(e.target.value)}
                    maxLength={1000}
                  />

                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {reviewMessage.length}/1000
                  </p>
                </div>

                {reviewError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">
                    {reviewError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={reviewBusy || !rating || !reviewMessage.trim()}
                  className="btn-primary w-full"
                >
                  {reviewBusy ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {isClient && reviewSubmitted && (
            <div className="card p-5 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                  <Star size={24} className="fill-yellow-400 text-yellow-400" />
                </div>
              </div>

              <h3 className="font-semibold text-brand-navy">
                Thanks for your review!
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Your feedback has been submitted successfully.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
