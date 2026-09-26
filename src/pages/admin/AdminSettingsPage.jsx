import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.js';
import Spinner from '../../components/ui/Spinner.jsx';

export default function AdminSettingsPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const s = res.data.settings;
      setForm({
        commissionPercent: s.commissionPercent,
        proCommissionPercent: s.proCommissionPercent,
        freeApplicationLimit: s.freeApplicationLimit,
        withdrawalFeeKobo: s.withdrawalFeeKobo / 100,
        proMonthlyPriceKobo: s.proMonthlyPriceKobo / 100,
        featuredTaskPriceKobo: s.featuredTaskPriceKobo / 100,
        maxAttachmentSizeMb: s.maxAttachmentSizeMb,
        maxRevisions: s.maxRevisions,
      });
    });
  }, []);

  if (!form) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.updateSettings({
        commissionPercent: Number(form.commissionPercent),
        proCommissionPercent: Number(form.proCommissionPercent),
        freeApplicationLimit: Number(form.freeApplicationLimit),
        withdrawalFeeKobo: Math.round(Number(form.withdrawalFeeKobo) * 100),
        proMonthlyPriceKobo: Math.round(Number(form.proMonthlyPriceKobo) * 100),
        featuredTaskPriceKobo: Math.round(Number(form.featuredTaskPriceKobo) * 100),
        maxAttachmentSizeMb: Number(form.maxAttachmentSizeMb),
        maxRevisions: Number(form.maxRevisions),
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, k, suffix, step = '1' }) => (
    <div>
      <label className="text-sm font-medium text-brand-navy">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <input className="input-field" type="number" step={step} value={form[k]} onChange={(e) => set(k, e.target.value)} />
        {suffix && <span className="text-sm text-gray-400 shrink-0">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Platform Settings</h1>
        <p className="text-sm text-gray-400">
          Changes apply going forward only — historical orders and transactions keep the
          commission rate that was frozen in at the time they were created.
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
      {saved && <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3">Settings saved.</div>}

      <form onSubmit={save} className="card p-5 space-y-4">
        <Field label="Free plan commission" k="commissionPercent" suffix="%" step="0.1" />
        <Field label="Pro plan commission" k="proCommissionPercent" suffix="%" step="0.1" />
        <Field label="Free plan monthly application limit" k="freeApplicationLimit" />
        <Field label="Withdrawal fee" k="withdrawalFeeKobo" suffix="₦" />
        <Field label="Pro subscription price (monthly)" k="proMonthlyPriceKobo" suffix="₦" />
        <Field label="Featured task price" k="featuredTaskPriceKobo" suffix="₦" />
        <Field label="Max attachment size" k="maxAttachmentSizeMb" suffix="MB" />
        <Field label="Max revisions per order" k="maxRevisions" />
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
      </form>
    </div>
  );
}
