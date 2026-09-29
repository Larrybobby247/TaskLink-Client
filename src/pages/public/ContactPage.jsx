import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, LifeBuoy, ShieldAlert, Clock } from 'lucide-react';
import PageHero from '../../components/public/PageHero.jsx';
import Reveal from '../../components/public/Reveal.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { SITE } from '../../config/site.js';

const TOPICS = ['General question', 'Payment issue', 'Account help', 'Report a user or task', 'Partnership / business'];

const CARDS = [
  { icon: Mail, title: 'Email us', text: SITE.supportEmail, href: `mailto:${SITE.supportEmail}` },
  { icon: LifeBuoy, title: 'Help centre', text: 'Read answers to common questions', to: '/faq' },
  { icon: ShieldAlert, title: 'Report a problem', text: 'Log in and use the report option on any task, message or profile', to: '/login' },
];

export default function ContactPage() {
  usePageTitle('Contact');
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], message: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // No backend endpoint is needed: this opens the visitor's email app pre-filled
  // to our support inbox. Swap in an API call later if you'd like an in-app form.
  const onSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[${form.topic}] from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${SITE.supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <PageHero tag="Contact" title="We're here to help" subtitle="Questions, feedback or something not working right? Reach out and a real person will get back to you." />

      <section className="pb-20 md:pb-24">
        <div className="container-x grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <div className="space-y-4">
            {CARDS.map(({ icon: Icon, title, text, href, to }, i) => {
              const inner = (
                <>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50"><Icon size={22} className="text-brand-blue" /></div>
                  <div className="min-w-0">
                    <p className="font-bold text-brand-navy">{title}</p>
                    <p className="break-words text-sm text-slate-500">{text}</p>
                  </div>
                </>
              );
              const cls = 'flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(21,44,72,.10)]';
              return (
                <Reveal key={title} delay={i * 70}>
                  {href ? <a href={href} className={cls}>{inner}</a> : <Link to={to} className={cls}>{inner}</Link>}
                </Reveal>
              );
            })}
            <Reveal className="flex items-center gap-3 rounded-2xl bg-blue-50 p-5 text-sm text-slate-600">
              <Clock size={20} className="shrink-0 text-brand-blue" />
              We aim to reply within one to two working days.
            </Reveal>
          </div>

          <Reveal delay={100}>
            <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-extrabold text-brand-navy">Send us a message</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-brand-navy">Your name</label>
                  <input id="c-name" className="input-field" value={form.name} onChange={set('name')} required />
                </div>
                <div>
                  <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-brand-navy">Email</label>
                  <input id="c-email" type="email" className="input-field" value={form.email} onChange={set('email')} required />
                </div>
              </div>
              <div>
                <label htmlFor="c-topic" className="mb-1.5 block text-sm font-medium text-brand-navy">Topic</label>
                <select id="c-topic" className="input-field" value={form.topic} onChange={set('topic')}>
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-msg" className="mb-1.5 block text-sm font-medium text-brand-navy">Message</label>
                <textarea id="c-msg" className="input-field min-h-[140px]" value={form.message} onChange={set('message')} required minLength={10} />
              </div>
              <button className="btn-primary w-full">Send message</button>
              <p className="text-center text-xs text-slate-400">This opens your email app with your message ready to send.</p>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
