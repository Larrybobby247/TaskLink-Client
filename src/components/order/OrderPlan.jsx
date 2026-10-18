import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ListChecks, Layers } from 'lucide-react';
import { ordersApi, paymentsApi } from '../../api/orders.js';
import StatusBadge from '../ui/StatusBadge.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import { formatNaira, nairaToKobo } from '../../utils/money.js';

const errText = (err) => err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.';

/* -------------------------------------------------------------------------- */
/* Read-only summary of the plan (shown to both sides)                         */
/* -------------------------------------------------------------------------- */
export function PlanSummary({ plan, title = 'Work plan', hideMilestones = false }) {
  if (!plan || (!plan.structure && !(plan.requirements || []).length)) return null;
  const milestones = plan.useMilestones ? plan.milestones || [] : [];

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-brand-navy">{title}</h3>

      {plan.requirements?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-brand-navy mb-2 flex items-center gap-1.5"><ListChecks size={15} /> Requirements</h4>
          <ul className="space-y-1.5">
            {plan.requirements.map((r, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.structure && (
        <div>
          <h4 className="text-sm font-semibold text-brand-navy mb-2 flex items-center gap-1.5"><Layers size={15} /> How the work will be structured</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{plan.structure}</p>
        </div>
      )}

      {!hideMilestones && (
      <div>
        <h4 className="text-sm font-semibold text-brand-navy mb-2">Payment</h4>
        {milestones.length > 0 ? (
          <ol className="space-y-2">
            {milestones.map((m, i) => (
              <li key={m._id || i} className="flex items-start justify-between gap-3 border border-gray-100 rounded-xl p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-navy">{i + 1}. {m.title}</p>
                  {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                </div>
                <p className="text-sm font-semibold text-brand-navy shrink-0">{formatNaira(m.amountKobo)}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-600">One payment for the whole job.</p>
        )}
      </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Worker: list requirements, structure and (optionally) milestones           */
/* -------------------------------------------------------------------------- */
export function WorkerPlanForm({ order, onDone }) {
  const existing = order.plan || {};
  const total = order.agreedAmountKobo;

  const [requirements, setRequirements] = useState(
    existing.requirements?.length ? existing.requirements : ['']
  );
  const [structure, setStructure] = useState(existing.structure || '');
  const [useMilestones, setUseMilestones] = useState(Boolean(existing.useMilestones));
  const [milestones, setMilestones] = useState(
    existing.milestones?.length
      ? existing.milestones.map((m) => ({ title: m.title, description: m.description || '', amount: m.amountKobo / 100 }))
      : [{ title: '', description: '', amount: '' }, { title: '', description: '', amount: '' }]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const assignedKobo = milestones.reduce((sum, m) => sum + (Number(m.amount) > 0 ? nairaToKobo(m.amount) : 0), 0);
  const remainingKobo = total - assignedKobo;

  const setReq = (i, value) => setRequirements((list) => list.map((r, idx) => (idx === i ? value : r)));
  const setMs = (i, patch) => setMilestones((list) => list.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const submit = async () => {
    setError('');
    const cleanReqs = requirements.map((r) => r.trim()).filter(Boolean);
    if (cleanReqs.length === 0) return setError('List at least one requirement (what you need from the client).');
    if (structure.trim().length < 10) return setError('Describe how you will structure the work (at least 10 characters).');

    let payloadMilestones;
    if (useMilestones) {
      if (milestones.some((m) => !m.title.trim() || !(Number(m.amount) > 0))) {
        return setError('Give every milestone a title and an amount.');
      }
      if (remainingKobo !== 0) {
        return setError(`Milestone amounts must add up to ${formatNaira(total)}. ${remainingKobo > 0 ? `${formatNaira(remainingKobo)} is still unassigned.` : `You are ${formatNaira(-remainingKobo)} over.`}`);
      }
      payloadMilestones = milestones.map((m) => ({
        title: m.title.trim(),
        description: m.description.trim() || undefined,
        amountKobo: nairaToKobo(m.amount),
      }));
    }

    setBusy(true);
    try {
      await ordersApi.submitPlan(order._id, {
        requirements: cleanReqs,
        structure: structure.trim(),
        milestones: payloadMilestones,
      });
      await onDone();
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-brand-navy">Send your work plan</h3>
        <p className="text-sm text-gray-500 mt-1">
          The client chose you. Before they pay, tell them what you need from them and how you'll do the job. They'll review it and approve it or ask for changes.
        </p>
      </div>

      {existing.clientFeedback && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3">
          <p className="text-sm font-semibold text-yellow-800">The client asked for changes</p>
          <p className="text-sm text-yellow-900 whitespace-pre-wrap mt-1">{existing.clientFeedback}</p>
        </div>
      )}

      {error && <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      <div>
        <label className="text-sm font-medium text-brand-navy">Requirements (what you need from the client)</label>
        <p className="text-xs text-gray-400 mt-0.5">One item per box, e.g. "Logo file", "Brand colours", "Access to the website".</p>
        <div className="space-y-2 mt-2">
          {requirements.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input className="input-field" aria-label={`Requirement ${i + 1}`} placeholder={`Requirement ${i + 1}`} value={r} maxLength={300} onChange={(e) => setReq(i, e.target.value)} />
              {requirements.length > 1 && (
                <button type="button" aria-label="Remove requirement" onClick={() => setRequirements((list) => list.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 px-1"><Trash2 size={16} /></button>
              )}
            </div>
          ))}
        </div>
        {requirements.length < 20 && (
          <button type="button" onClick={() => setRequirements((list) => [...list, ''])} className="text-sm font-medium text-brand-blue mt-2 flex items-center gap-1"><Plus size={14} /> Add requirement</button>
        )}
      </div>

      <div>
        <label htmlFor="plan-structure" className="text-sm font-medium text-brand-navy">How the work will be structured</label>
        <p className="text-xs text-gray-400 mt-0.5">The steps you'll follow, what the client will receive and roughly when.</p>
        <textarea id="plan-structure" className="input-field mt-2 min-h-[120px]" maxLength={3000} placeholder="e.g. 1. Day 1-2: draft concepts. 2. Day 3: client feedback. 3. Day 4-5: final files delivered." value={structure} onChange={(e) => setStructure(e.target.value)} />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span>
            <span className="text-sm font-medium text-brand-navy block">Split payment into milestones</span>
            <span className="text-xs text-gray-400">Total: {formatNaira(total)}. The client pays and approves each milestone one at a time instead of paying everything upfront.</span>
          </span>
          <input type="checkbox" className="h-4 w-4 shrink-0" checked={useMilestones} onChange={(e) => setUseMilestones(e.target.checked)} />
        </label>

        {useMilestones && (
          <div className="mt-4 space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-brand-navy">Milestone {i + 1}</p>
                  {milestones.length > 2 && (
                    <button type="button" aria-label={`Remove milestone ${i + 1}`} onClick={() => setMilestones((list) => list.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  )}
                </div>
                <input className="input-field text-sm" aria-label={`Milestone ${i + 1} title`} placeholder="Title, e.g. First draft" value={m.title} maxLength={100} onChange={(e) => setMs(i, { title: e.target.value })} />
                <input className="input-field text-sm" aria-label={`Milestone ${i + 1} description`} placeholder="What the client gets (optional)" value={m.description} maxLength={500} onChange={(e) => setMs(i, { description: e.target.value })} />
                <div>
                  <label htmlFor={`ms-amt-${i}`} className="block text-[11px] font-medium text-gray-500 mb-1">Amount (₦)</label>
                  <input id={`ms-amt-${i}`} className="input-field text-sm" type="number" min="100" inputMode="numeric" placeholder="e.g. 10000" value={m.amount} onChange={(e) => setMs(i, { amount: e.target.value })} />
                </div>
              </div>
            ))}

            {milestones.length < 10 && (
              <button type="button" onClick={() => setMilestones((list) => [...list, { title: '', description: '', amount: '' }])} className="text-sm font-medium text-brand-blue flex items-center gap-1"><Plus size={14} /> Add milestone</button>
            )}

            <p className={`text-sm font-medium ${remainingKobo === 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {remainingKobo === 0
                ? `Milestones add up to ${formatNaira(total)} ✓`
                : remainingKobo > 0
                  ? `${formatNaira(remainingKobo)} left to assign (total ${formatNaira(total)})`
                  : `${formatNaira(-remainingKobo)} over the total of ${formatNaira(total)}`}
            </p>
          </div>
        )}
      </div>

      <button type="button" onClick={submit} disabled={busy} className="btn-primary w-full">
        {busy ? 'Sending...' : existing.clientFeedback ? 'Send updated plan' : 'Send plan to client'}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Client: review the plan -> approve / ask for changes / pick another worker  */
/* -------------------------------------------------------------------------- */
export function ClientPlanReview({ order, onDone, onWorkerDeclined }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showChanges, setShowChanges] = useState(false);
  const [declining, setDeclining] = useState(false);

  const accept = async () => {
    setBusy(true);
    setError('');
    try {
      await ordersApi.respondToPlan(order._id, { action: 'ACCEPT' });
      await onDone();
    } catch (err) { setError(errText(err)); } finally { setBusy(false); }
  };

  const requestChanges = async () => {
    setBusy(true);
    setError('');
    try {
      await ordersApi.respondToPlan(order._id, { action: 'REQUEST_CHANGES', feedback: feedback.trim() });
      setFeedback('');
      setShowChanges(false);
      await onDone();
    } catch (err) { setError(errText(err)); } finally { setBusy(false); }
  };

  return (
    <>
      <PlanSummary plan={order.plan} title={`${order.worker?.fullName?.split(' ')[0] || 'The worker'}'s work plan`} />

      <div className="card p-5 space-y-3">
        <h3 className="font-semibold text-brand-navy">Does this plan work for you?</h3>
        {error && <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

        <button type="button" onClick={accept} disabled={busy} className="btn-primary w-full">{busy ? 'Please wait...' : 'Approve plan & continue to payment'}</button>

        {showChanges ? (
          <div className="space-y-2">
            <textarea className="input-field min-h-[90px]" placeholder="What would you like the worker to change?" value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={1000} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowChanges(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="button" onClick={requestChanges} disabled={busy || feedback.trim().length < 5} className="btn-primary flex-1">Send request</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowChanges(true)} disabled={busy} className="btn-secondary w-full">Ask for changes</button>
        )}

        <button type="button" onClick={() => setDeclining(true)} disabled={busy} className="w-full text-sm font-medium text-red-500 py-2">Not a fit? Choose a different worker</button>
      </div>

      {declining && (
        <ConfirmModal
          title="Choose a different worker?"
          description="This worker will be told you went another way and your task will reopen so you can pick someone else from your applicants. You haven't paid anything yet."
          confirmLabel="Choose another worker"
          danger
          onConfirm={async () => {
            await ordersApi.declineWorker(order._id);
            onWorkerDeclined();
          }}
          onClose={() => setDeclining(false)}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Client: payment (single payment, or one milestone at a time)               */
/* -------------------------------------------------------------------------- */
export function PaymentPanel({ order }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const milestones = order.plan?.useMilestones ? order.plan.milestones || [] : [];
  const nextUnpaid = milestones.find((m) => m.status === 'PENDING_PAYMENT');

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await paymentsApi.initialize(order._id);
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(errText(err));
      setBusy(false);
    }
  };

  if (milestones.length === 0) {
    return (
      <div className="card p-5">
        <p className="text-sm text-gray-600 mb-3">
          {order.plan?.acceptedAt ? 'Your plan is approved. ' : ''}Pay to let the worker start - the money is held safely until you approve the work.
        </p>
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <button onClick={pay} disabled={busy} className="btn-primary w-full">{busy ? 'Redirecting...' : `Pay ${formatNaira(order.agreedAmountKobo)}`}</button>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-brand-navy">Milestone payments</h3>
        <p className="text-sm text-gray-500 mt-1">Pay one milestone at a time. Each payment is held safely until you approve that milestone's work.</p>
      </div>
      <ol className="space-y-2">
        {milestones.map((m, i) => (
          <li key={m._id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
            <div className="flex items-start gap-2 min-w-0">
              {m.status === 'APPROVED' ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> : <Circle size={16} className="text-gray-300 mt-0.5 shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-navy truncate">{i + 1}. {m.title}</p>
                <p className="text-xs text-gray-400">{formatNaira(m.amountKobo)}</p>
              </div>
            </div>
            <StatusBadge status={m.status} />
          </li>
        ))}
      </ol>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {nextUnpaid && (
        <button onClick={pay} disabled={busy} className="btn-primary w-full">
          {busy ? 'Redirecting...' : `Pay ${formatNaira(nextUnpaid.amountKobo)} for "${nextUnpaid.title}"`}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress list shown once a milestone job is running                         */
/* -------------------------------------------------------------------------- */
export function MilestoneProgress({ order }) {
  const milestones = order.plan?.useMilestones ? order.plan.milestones || [] : [];
  if (milestones.length === 0) return null;
  return (
    <div className="card p-5 space-y-3">
      <h3 className="font-semibold text-brand-navy">Milestones</h3>
      <ol className="space-y-2">
        {milestones.map((m, i) => (
          <li key={m._id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-navy truncate">{i + 1}. {m.title}</p>
              <p className="text-xs text-gray-400">{formatNaira(m.amountKobo)}</p>
            </div>
            <StatusBadge status={m.status} />
          </li>
        ))}
      </ol>
    </div>
  );
}
