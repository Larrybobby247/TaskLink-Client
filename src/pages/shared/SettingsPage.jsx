import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { usersApi, subscriptionsApi } from '../../api/users.js';
import { withdrawalsApi } from '../../api/orders.js';

export default function SettingsPage() {
  const { user, updateLocalUser } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || '', bio: user?.bio || '', location: user?.location || '', phone: user?.phone || '',
  });
  const [bankForm, setBankForm] = useState({
    bankName: user?.bankDetails?.bankName || '', accountNumber: user?.bankDetails?.accountNumber || '', accountName: user?.bankDetails?.accountName || '',
  });
  const [saving, setSaving] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [proLoading, setProLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const { data } = await usersApi.updateProfile(form); updateLocalUser(data.user); } finally { setSaving(false); }
  };

  const saveBankDetails = async (e) => {
    e.preventDefault(); setSavingBank(true);
    try {
      const { data } = await withdrawalsApi.addBankAccount(bankForm);
      updateLocalUser(data.user || { bankDetails: data.bankDetails || bankForm });
    } finally { setSavingBank(false); }
  };

  const goPro = async () => {
    setProLoading(true);
    try { const { data } = await subscriptionsApi.initialize(); window.location.href = data.authorizationUrl; } finally { setProLoading(false); }
  };

  return (
    <div className="space-y-5 pb-10 max-w-2xl mx-auto">
      <div><h1 className="text-xl font-bold text-brand-navy">Settings</h1><p className="text-sm text-gray-500 mt-1">Manage your account, payments and TaskLink preferences.</p></div>
      <form onSubmit={save} className="card p-5 space-y-3">
        <h3 className="font-semibold text-brand-navy">Account information</h3>
        <input className="input-field" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input-field" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <textarea className="input-field min-h-[100px]" placeholder="Tell clients a little about yourself" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
      </form>
      <form onSubmit={saveBankDetails} className="card p-5 space-y-3">
        <h3 className="font-semibold text-brand-navy">Payment account</h3>
        <p className="text-sm text-gray-500">This is the bank account TaskLink will use for your earnings and withdrawals.</p>
        <input className="input-field" placeholder="Bank name" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} required />
        <input className="input-field" placeholder="Account number" inputMode="numeric" maxLength={10} value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '') })} required />
        <input className="input-field" placeholder="Account name" value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} required />
        <button type="submit" className="btn-primary w-full" disabled={savingBank}>{savingBank ? 'Saving...' : 'Save bank details'}</button>
      </form>
      <div className="card p-5"><h3 className="font-semibold text-brand-navy">TaskLink plans</h3><button onClick={goPro} disabled={proLoading} className="btn-primary w-full mt-5">{proLoading ? 'Redirecting...' : 'Upgrade to Pro — ₦2,500'}</button></div>
    </div>
  );
}
