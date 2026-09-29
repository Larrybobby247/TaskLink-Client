import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import PageHero from '../../components/public/PageHero.jsx';
import Reveal from '../../components/public/Reveal.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { SITE } from '../../config/site.js';

const GROUPS = [
  {
    title: 'Getting started',
    items: [
      ['Do I need separate accounts to post tasks and to earn?', 'No. Every TaskLink account can do both. You can post a task as a client, then switch to earning mode to apply for other people\'s tasks, all from the same login.'],
      ['Is TaskLink free to join?', 'Yes. Creating an account, browsing tasks and posting tasks are free. Free accounts get a monthly number of applications, and TaskLink Pro removes that limit.'],
      ['Why do I need to verify my email?', 'Verifying your email proves the address is yours, keeps fake accounts out and makes sure you receive important updates about your tasks and payments.'],
    ],
  },
  {
    title: 'Posting tasks',
    items: [
      ['How do I post a task?', 'Log in, tap Post a Task, choose a category, describe what you need, set your budget and deadline, then publish. Workers can start applying straight away.'],
      ['How do I choose who does my task?', 'Open your task to see every application, including the worker\'s message, price (for negotiable tasks), rating and past work. Chat with them, then select the person you want.'],
      ['What is a Featured (boosted) task?', 'Boosting your task pays a small fee to pin it to the top of task lists with a Featured badge for a limited time, so more workers see it.'],
    ],
  },
  {
    title: 'Payments & fees',
    items: [
      ['How does payment work?', 'After you select a worker, you pay through Paystack. We confirm the payment with Paystack before work begins. When the worker submits their work and you approve it, their earnings become available to withdraw.'],
      ['What does TaskLink charge?', 'TaskLink takes a small platform commission from completed tasks, and Pro members pay a lower rate. The exact amount is shown on your order before you pay, so there are no surprises.'],
      ['How do workers get paid out?', 'Workers add a bank account, which we verify, and can then request a withdrawal from their available earnings. Withdrawal requests are reviewed and processed by our team.'],
    ],
  },
  {
    title: 'Safety & trust',
    items: [
      ['What if the work isn\'t right?', 'Request a revision from the order page. If you and the worker can\'t agree, either of you can open a dispute and our team will review the task, messages and submitted work.'],
      ['Should I pay or chat outside TaskLink?', 'We strongly advise against it. Payments made outside TaskLink aren\'t protected by our order, review and dispute process, and we can\'t help if something goes wrong.'],
      ['How do I report a problem or a user?', 'Use the report option on tasks, messages and profiles, or contact us. Our team reviews every report and can suspend accounts that break the rules.'],
    ],
  },
];

export default function FaqPage() {
  usePageTitle('FAQ');
  return (
    <>
      <PageHero tag="FAQ" title="Frequently asked questions" subtitle="Quick answers about posting tasks, earning, payments and staying safe on TaskLink." />

      <section className="pb-20 md:pb-24">
        <div className="container-x max-w-3xl space-y-12">
          {GROUPS.map((group) => (
            <Reveal key={group.title}>
              <h2 className="mb-4 text-lg font-extrabold text-brand-navy">{group.title}</h2>
              <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {group.items.map(([q, a]) => (
                  <details key={q} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[.98rem] font-semibold text-slate-800 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      {q}
                      <ChevronDown size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-5 pb-5 text-[.94rem] leading-relaxed text-slate-500">{a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          ))}

          <Reveal className="rounded-2xl bg-blue-50 p-7 text-center">
            <h3 className="text-lg font-bold text-brand-navy">Still have a question?</h3>
            <p className="mt-2 text-sm text-slate-500">Our team is happy to help at <a className="font-semibold text-brand-blue" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.</p>
            <Link to="/contact" className="mt-5 inline-flex rounded-xl bg-brand-blue px-6 py-3 font-semibold text-white transition hover:bg-blue-700">Contact us</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
