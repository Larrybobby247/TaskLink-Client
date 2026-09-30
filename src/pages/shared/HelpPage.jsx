import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { reportsApi } from '../../api/reports.js';
import { SITE } from '../../config/site.js';

const TOPICS = [
  'Payment issue',
  'Withdrawal issue',
  'Account issue',
  'Bug / something not working',
  'Report a user or task',
  'Other',
];

export default function HelpPage() {
  const [form, setForm] = useState({ reason: TOPICS[0], description: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      // No specific target (task/user/message) - this is a general Help &
      // Support message, so it goes to admins as a SUPPORT-type report.
      await reportsApi.create({ targetType: 'SUPPORT', reason: form.reason, description: form.description });
      setSent(true);
      setForm({ reason: TOPICS[0], description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const whatsappHref = `https://wa.me/${SITE.supportWhatsApp}`;

  return (
    <div className="space-y-5 pb-10 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Help & Support</h1>
        <p className="text-sm text-gray-500 mt-1">Reach us directly, or send us a message below and our team will look into it.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <a href={`mailto:${SITE.supportEmail}`} className="card p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center"><Mail size={20} className="text-brand-blue" /></div>
          <p className="font-semibold text-sm text-brand-navy">Email</p>
          <p className="text-xs text-gray-400 break-all">{SITE.supportEmail}</p>
        </a>
        <a href={`tel:${SITE.supportPhone.replace(/\s+/g, '')}`} className="card p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center"><Phone size={20} className="text-brand-blue" /></div>
          <p className="font-semibold text-sm text-brand-navy">Call us</p>
          <p className="text-xs text-gray-400">{SITE.supportPhone}</p>
        </a>
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="card p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center"><MessageCircle size={20} className="text-green-600" /></div>
          <p className="font-semibold text-sm text-brand-navy">WhatsApp</p>
          <p className="text-xs text-gray-400">Chat with us</p>
        </a>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy mb-1">Send us a message</h3>
        <p className="text-sm text-gray-500 mb-4">This goes straight to our support team and is tracked so we can follow up.</p>

        {sent ? (
          <div className="rounded-xl bg-green-50 border border-green-100 p-4 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-700 text-sm">Message sent</p>
              <p className="text-sm text-green-600 mt-0.5">
                Thanks — we've got it. We'll get back to you by email if we need more details.
              </p>
              <button onClick={() => setSent(false)} className="text-sm font-medium text-brand-blue mt-2">Send another message</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
            <div>
              <label htmlFor="help-topic" className="text-sm font-medium text-brand-navy">What's this about?</label>
              <select
                id="help-topic"
                className="input-field mt-1.5"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              >
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="help-desc" className="text-sm font-medium text-brand-navy">Tell us what happened</label>
              <textarea
                id="help-desc"
                className="input-field mt-1.5 min-h-[130px]"
                placeholder="Include as much detail as you can — what you expected, what happened instead, and any task or order it relates to."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                minLength={10}
              />
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={sending}>
              <Send size={16} /> {sending ? 'Sending...' : 'Send message'}
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">We usually respond within one to two working days.</p>
    </div>
  );
}
