import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/users.js';

export default function WorkerProfileSettingsPage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ headline: '', skills: '', availability: 'AVAILABLE' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersApi.getMyWorkerProfile().then((res) => {
      const p = res.data.workerProfile;
      setProfile(p);
      setForm({ headline: p.headline || '', skills: (p.skills || []).join(', '), availability: p.availability });
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersApi.updateWorkerProfile({
        headline: form.headline,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        availability: form.availability,
      });
      setProfile(data.workerProfile);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-5 pb-10 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-brand-navy">Worker Profile</h1>
      <form onSubmit={save} className="card p-5 space-y-3">
        <input className="input-field" placeholder="Headline (e.g. Graphic designer & flyer specialist)" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
        <input className="input-field" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        <div className="flex gap-2">
          {['AVAILABLE', 'BUSY', 'UNAVAILABLE'].map((a) => (
            <button key={a} type="button" onClick={() => setForm({ ...form, availability: a })} className={`chip ${form.availability === a ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>
              {a}
            </button>
          ))}
        </div>
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
      </form>
    </div>
  );
}
