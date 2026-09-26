import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { formatNaira } from '../../utils/money.js';

const RESOLUTIONS = [
  { value: 'RESOLVED_CLIENT', label: 'Resolve in favor of client (order cancelled)' },
  { value: 'RESOLVED_WORKER', label: 'Resolve in favor of worker (order completed)' },
  { value: 'PARTIAL_RESOLUTION', label: 'Partial resolution' },
  { value: 'CLOSED', label: 'Close without action' },
];

export default function AdminDisputeDetailPage() {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [note, setNote] = useState('');
  const [resolution, setResolution] = useState('RESOLVED_CLIENT');
  const [resolutionText, setResolutionText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => adminApi.getDispute(id).then((res) => setDispute(res.data.dispute));
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  if (!dispute) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    try { await adminApi.addDisputeNote(id, note.trim()); setNote(''); await load(); } finally { setBusy(false); }
  };

  const resolve = async () => {
    if (!resolutionText.trim()) return;
    setBusy(true);
    try { await adminApi.resolveDispute(id, { status: resolution, resolution: resolutionText.trim() }); await load(); } finally { setBusy(false); }
  };

  const order = dispute.order;

  return (
    <div className="space-y-5 pb-10">
      <Link to="/admin/disputes" className="text-sm text-brand-blue">← Back to disputes</Link>

      <div className="card p-5">
        <div className="flex items-start justify-between">
          <h1 className="font-bold text-brand-navy">{dispute.reason}</h1>
          <StatusBadge status={dispute.status} />
        </div>
        <p className="text-sm text-gray-600 mt-3">{dispute.description}</p>
        <p className="text-xs text-gray-400 mt-3">Opened by {dispute.openedBy?.fullName} on {new Date(dispute.createdAt).toLocaleString()}</p>

        {dispute.evidence?.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {dispute.evidence.map((e, i) => (
              <a key={i} href={e.url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue underline">Evidence {i + 1}</a>
            ))}
          </div>
        )}
      </div>

      {order && (
        <div className="card p-5">
          <h3 className="font-semibold text-brand-navy mb-2">Order details</h3>
          <p className="text-sm">{order.task?.title}</p>
          <p className="text-xs text-gray-400 mt-1">
            Client: {order.client?.fullName} · Worker: {order.worker?.fullName} · Amount: {formatNaira(order.agreedAmountKobo)}
          </p>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy mb-3">Internal notes</h3>
        <div className="space-y-2 mb-3">
          {dispute.adminNotes?.length ? dispute.adminNotes.map((n, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
              <p>{n.note}</p>
              <p className="text-xs text-gray-400 mt-1">{n.admin?.fullName || 'Admin'} · {new Date(n.createdAt).toLocaleString()}</p>
            </div>
          )) : <p className="text-sm text-gray-400">No notes yet.</p>}
        </div>
        <textarea className="input-field mb-2" placeholder="Add an internal note (not visible to users)..." value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={addNote} disabled={busy || !note.trim()} className="btn-secondary text-sm">Add note</button>
      </div>

      {!['RESOLVED_CLIENT', 'RESOLVED_WORKER', 'CLOSED'].includes(dispute.status) && (
        <div className="card p-5">
          <h3 className="font-semibold text-brand-navy mb-3">Resolve dispute</h3>
          <select className="input-field mb-3" value={resolution} onChange={(e) => setResolution(e.target.value)}>
            {RESOLUTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <textarea className="input-field mb-3" placeholder="Explain the resolution (visible to both parties)..." value={resolutionText} onChange={(e) => setResolutionText(e.target.value)} />
          <button onClick={resolve} disabled={busy || !resolutionText.trim()} className="btn-primary w-full">{busy ? 'Resolving...' : 'Resolve dispute'}</button>
        </div>
      )}
    </div>
  );
}
