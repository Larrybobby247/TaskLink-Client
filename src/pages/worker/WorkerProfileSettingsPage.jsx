import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Layers } from 'lucide-react';
import { usersApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';

export default function WorkerProfileSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ headline: '', skills: '', availability: 'AVAILABLE' });
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let cancelled = false;
    usersApi.getMyWorkerProfile()
      .then((res) => {
        if (cancelled) return;
        const p = res.data.workerProfile;
        setProfile(p);
        setForm({ headline: p.headline || '', skills: (p.skills || []).join(', '), availability: p.availability || 'AVAILABLE' });
      })
      .catch((err) => { if (!cancelled) setLoadError(err?.message || 'Could not load your worker profile.'); });
    return () => { cancelled = true; };
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await usersApi.updateWorkerProfile({
        headline: form.headline,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        availability: form.availability,
      });
      setProfile(data.workerProfile);
      setMessage({ type: 'success', text: 'Profile saved.' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.errors?.[0]?.message || err?.message || 'Could not save your profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loadError) return <ErrorState message={loadError} />;
  if (!profile) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  return (
    <div className="space-y-5 pb-10 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-brand-navy">Worker Profile</h1>

      <div className="flex flex-wrap gap-3">
        {user?._id && (
          <Link to={`/profile/${user._id}`} className="btn-secondary text-sm flex items-center gap-1.5 py-2.5 px-4"><Eye size={15} /> View Public Profile</Link>
        )}
        <Link to="/worker/gigs" className="btn-secondary text-sm flex items-center gap-1.5 py-2.5 px-4"><Layers size={15} /> My Gigs</Link>
      </div>

      <form onSubmit={save} className="card p-5 space-y-3">
        {message.text && (
          <div role={message.type === 'error' ? 'alert' : 'status'} className={`text-sm rounded-lg p-3 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{message.text}</div>
        )}
        <input className="input-field" aria-label="Headline" placeholder="Headline (e.g. Graphic designer & flyer specialist)" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
        <input className="input-field" aria-label="Skills" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        <div className="flex gap-2">
          {['AVAILABLE', 'BUSY', 'UNAVAILABLE'].map((a) => (
            <button key={a} type="button" aria-pressed={form.availability === a} onClick={() => setForm({ ...form, availability: a })} className={`chip ${form.availability === a ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>
              {a}
            </button>
          ))}
        </div>
        <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
      </form>
    </div>
  );
}
