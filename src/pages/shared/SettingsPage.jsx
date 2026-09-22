import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { usersApi, subscriptionsApi } from '../../api/users.js';

export default function SettingsPage() {
  const { user, updateLocalUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', bio: user?.bio || '', location: user?.location || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [proLoading, setProLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersApi.updateProfile(form);
      updateLocalUser(data.user);
    } finally {
      setSaving(false);
    }
  };

  const goPro = async () => {
    setProLoading(true);
    try {
      const { data } = await subscriptionsApi.initialize();
      window.location.href = data.authorizationUrl;
    } finally {
      setProLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-10 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-brand-navy">Settings</h1>

      <form onSubmit={save} className="card p-5 space-y-3">
        <h3 className="font-semibold text-brand-navy">Account</h3>
        <input className="input-field" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input-field" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <textarea className="input-field" placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
      </form>

      <div id="pro" className="card p-5">
        <h3 className="font-semibold text-brand-navy mb-1">TaskLink Pro</h3>
        <p className="text-sm text-gray-500 mb-3">Unlimited applications, lower fees, priority support.</p>
        {user?.plan === 'PRO' ? (
          <span className="chip bg-green-50 text-green-700">Active</span>
        ) : (
          <button onClick={goPro} disabled={proLoading} className="btn-primary w-full">{proLoading ? 'Redirecting...' : 'Upgrade to Pro'}</button>
        )}
      </div>
    </div>
  );
}
