import React, { useState } from 'react';

/**
 * Generic confirmation modal for destructive/important admin actions
 * (suspend, deactivate, reject withdrawal, resolve dispute, etc).
 * Pass `requireReason` to force a short text explanation before confirming -
 * every admin action that writes an AdminActionLog entry on the backend
 * benefits from having a reason attached.
 */
export default function ConfirmModal({
  title, description, confirmLabel = 'Confirm', danger = false,
  requireReason = false, showReasonField = requireReason, reasonPlaceholder = 'Reason (required)',
  onConfirm, onClose,
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('Please provide a reason');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-brand-navy mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{error}</div>}
        {showReasonField && (
          <textarea
            className="input-field mb-4"
            placeholder={reasonPlaceholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={busy} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className={`flex-1 font-semibold rounded-xl px-5 py-3 text-white ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-navy hover:bg-brand-navyDark'} disabled:opacity-50`}
          >
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
