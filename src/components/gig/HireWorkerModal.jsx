import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { workersApi } from '../../api/users.js';
import { categoriesApi } from '../../api/tasks.js';
import { nairaToKobo } from '../../utils/money.js';

/**
 * "Hire This Worker" (spec §13) - the client defines the whole brief
 * directly (no gig involved). Submits to worker.service.js#hireWorker,
 * which creates a Task + Application and runs it through the existing
 * order.service.js#selectWorker, same as a gig order.
 */
export default function HireWorkerModal({ worker, onClose }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', budget: '', deadline: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { categoriesApi.list().then((res) => setCategories(res.data.categories)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await workersApi.hire(worker._id, {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        budgetKobo: nairaToKobo(form.budget || 0),
        deadline: new Date(form.deadline).toISOString(),
      });
      navigate(`/client/orders/${data.order._id}`);
    } catch (err) {
      setError(err.errors?.[0]?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-brand-navy">Hire {worker.fullName?.split(' ')[0]}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="What do you need done?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={5} />
          <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <textarea className="input-field min-h-[100px]" placeholder="Describe the project in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={20} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" type="number" placeholder="Budget (₦)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} required />
            <input className="input-field" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
          </div>
          <p className="text-xs text-gray-400">
            This sends {worker.fullName?.split(' ')[0]} a direct order at your proposed price. You'll pay through Paystack once they're selected, same as any other TaskLink order.
          </p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? 'Sending...' : 'Send Hire Request'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
