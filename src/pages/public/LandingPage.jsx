import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pencil, Users, CreditCard, Check, Clock, Star, ShieldCheck, BadgeCheck, Activity, Palette, FileText,
  Monitor, Truck, BookOpen, Camera, Wrench, Sparkles, Share2, CalendarDays, GraduationCap, Briefcase,
  Store, User, Check, Circle, Headset, ChartNoAxesCombined, 
} from 'lucide-react';
import Reveal from '../../components/public/Reveal.jsx';
import CtaBanner from '../../components/public/CtaBanner.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';
import { tasksApi } from '../../api/tasks.js';
import { formatNaira } from '../../utils/money.js';
import { timeUntil } from '../../utils/time.js';

const PHONE_TASKS = [
  { title: 'Need a flyer designed', price: '₦1,500', tag: 'Design', due: 'Due today' },
  { title: 'Research 20 Nigerian tech startups', price: '₦5,000', tag: 'Virtual Assistance', due: '2 days' },
  { title: 'Make me a CV', price: '₦3,000', tag: 'CV/Resume', due: '12 hours' },
  { title: 'Build a simple website', price: '₦30,000', tag: 'Websites', due: '2 days' },
];

const STEPS = [
  { icon: Pencil, title: 'Post a Task', text: 'Tell us what you need, set your budget and deadline.' },
  { icon: Users, title: 'Find the Right Person', text: 'Review applications and choose the person with the skills you need.' },
  { icon: CreditCard, title: 'Get It Done', text: 'Work together, approve the result, and pay securely through Paystack.' },
];

const CLIENT_POINTS = ['Post tasks in minutes', 'Receive applications', 'Choose who works with you', 'Track your task from start to finish'];
const WORKER_POINTS = ['Discover tasks near you', 'Apply for jobs that fit your skills', 'Build your reputation with reviews', 'Get paid for your skills'];

const CATEGORIES = [
  { icon: Palette, label: 'Design' },
  { icon: FileText, label: 'Writing' },
  { icon: Monitor, label: 'Websites' },
  { icon: Truck, label: 'CV/Resume' },
  { icon: BookOpen, label: 'Tutoring' },
  { icon: ChartNoAxesCombined, label: 'Data Analysis' },
  { icon: Headset, label: 'Virtual Assistance' },
  { icon: Share2, label: 'Social Media' },
];

const EXAMPLE_TASKS = [
  { category: 'Design', title: 'Need a flyer designed today', meta: 'Online • 6 hours', price: '₦1,500' },
  { category: 'Writing', title: 'Need someone to type an assignment', meta: '24 hours', price: '₦3,000' },
  { category: 'Delivery', title: 'Delivery across campus', meta: '3 hours', price: '₦1,000' },
  { category: 'Photography', title: 'Looking for a photographer', meta: '2 hours', price: '₦10,000' },
];

const TRUST = [
  { icon: Star, title: 'Ratings & Reviews', text: 'See honest feedback from real tasks before you choose who to work with.' },
  { icon: ShieldCheck, title: 'Secure Payments', text: 'Payment is confirmed through Paystack before work begins, and the worker is paid out after you approve the result.' },
  { icon: BadgeCheck, title: 'Verified Profiles', text: 'Look for the verified badge to know a profile has been checked by our team.' },
  { icon: Activity, title: 'Task Tracking', text: 'Follow every step of your task, from posting to completion, in one place.' },
];

const AUDIENCES = [
  { icon: GraduationCap, title: 'Students', text: 'Earn between classes with typing, tutoring, data entry and design work, or get quick help with your own tasks.' },
  { icon: Briefcase, title: 'Freelancers', text: 'Find steady small jobs, build a portfolio and grow a reputation that follows you.' },
  { icon: Store, title: 'Small businesses', text: 'Get flyers, social posts, photos and errands handled without hiring full time.' },
  { icon: User, title: 'Individuals', text: 'From cleaning a room to building a website, find someone reliable close to you.' },
];

function SectionHead({ tag, title, sub, light = false }) {
  return (
    <Reveal className="container-x text-center">
      <span className={`mb-3.5 inline-block text-xs font-bold uppercase tracking-[.12em] ${light ? 'text-blue-300' : 'text-brand-blue'}`}>{tag}</span>
      <h2 className={`text-[clamp(1.75rem,3.4vw,2.5rem)] font-extrabold leading-tight tracking-tight ${light ? 'text-white' : 'text-brand-navy'}`}>{title}</h2>
      {sub && <p className={`mx-auto mb-3 mt-4 max-w-xl text-[1.05rem] ${light ? 'text-blue-200/80' : 'text-slate-500'}`}>{sub}</p>}
    </Reveal>
  );
}

export default function LandingPage() {
  usePageTitle('');
  const [live, setLive] = useState({ loading: true, items: [] });

  // Real tasks from the API when there are any; otherwise we show clearly-labelled examples.
  useEffect(() => {
    let mounted = true;
    tasksApi.search({ limit: 4 })
      .then((res) => mounted && setLive({ loading: false, items: res.data || [] }))
      .catch(() => mounted && setLive({ loading: false, items: [] }));
    return () => { mounted = false; };
  }, []);

  const hasLive = live.items.length > 0;

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F8FE] to-white pb-20 pt-36 md:pb-24 mb-24">
        <div className="pointer-events-none absolute -right-48 -top-48 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(47,111,228,.12),transparent_65%)]" />
        <div className="container-x relative grid items-center gap-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-[7px] text-[.8rem] font-semibold text-brand-blue shadow-sm">
              <span className="h-[7px] w-[7px] rounded-full bg-green-500" /> Trusted task marketplace
            </span>
            <h1 className="text-[clamp(2.35rem,5.2vw,3.7rem)] font-extrabold leading-[1.12] tracking-tight text-brand-navy">
              Need something done?<br /><span className="text-brand-blue">Find someone nearby.</span>
            </h1>
            <p className="mb-8 mt-5 max-w-[480px] text-[1.13rem] text-slate-500">
              TaskLink makes it easy to find skilled people for everyday tasks, while giving people a simple way to earn from their skills.
            </p>
            <div className="flex flex-col gap-3.5 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center rounded-[14px] bg-brand-blue px-8 py-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(47,111,228,.3)] transition hover:-translate-y-px hover:bg-blue-700">Get Started</Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-[14px] border-[1.5px] border-slate-200 bg-white px-8 py-[15px] font-semibold text-brand-navy transition hover:-translate-y-px hover:border-brand-blue hover:text-brand-blue">Explore How It Works</a>
            </div>
            <div className="mt-9 flex items-center gap-3.5 text-sm text-slate-500">
              <div className="flex" aria-hidden="true">
                {[['A', 'bg-brand-blue'], ['T', 'bg-sky-500'], ['K', 'bg-violet-600'], ['+', 'bg-amber-500']].map(([l, c], i) => (
                  <span key={l} className={`grid h-[34px] w-[34px] place-items-center rounded-full border-[2.5px] border-white text-[.7rem] font-bold text-white ${c} ${i ? '-ml-2.5' : ''}`}>{l}</span>
                ))}
              </div>
              <span>Made for students, freelancers and small businesses across Nigeria</span>
            </div>
          </div>

          {/* Phone preview */}
          <div className="relative flex justify-center">
            <div className="animate-floaty absolute left-0 top-9 hidden items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:flex lg:-left-3">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-emerald-50"><Check size={20} className="text-emerald-500" /></span>
              <div><strong className="block text-[.82rem] text-slate-800">Payment confirmed</strong><small className="text-xs text-slate-500">Before work begins</small></div>
            </div>

            <div className="w-80 max-w-full rounded-[36px] bg-brand-navy p-3 shadow-[0_24px_60px_rgba(21,44,72,.28)] lg:rotate-2" aria-label="Preview of the TaskLink app showing live task listings">
              <div className="min-h-[480px] rounded-[26px] bg-[#F5F7FB] px-4 py-[18px]">
                <div className="flex justify-between px-2 pb-3.5 text-[.7rem] font-semibold text-brand-navy"><span>9:41</span><span>●●●</span></div>
                <p className="px-1.5 pb-3 text-[.95rem] font-bold text-brand-navy">Tasks near you</p>
                {PHONE_TASKS.map((t) => (
                  <div key={t.title} className="mb-2.5 rounded-[14px] border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[.82rem] font-semibold leading-snug text-slate-800">{t.title}</h4>
                      <span className="whitespace-nowrap text-[.8rem] font-bold text-brand-blue">{t.price}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2.5 text-[.68rem] text-slate-500">
                      <span className="rounded-md bg-blue-50 px-[7px] py-0.5 font-semibold text-brand-blue">{t.tag}</span><span>{t.due}</span>
                    </div>
                  </div>
                ))}
                <div className="mt-1 rounded-xl bg-brand-navy py-[11px] text-center text-[.78rem] font-semibold text-white">Search tasks</div>
              </div>
            </div>

            <div className="animate-floaty absolute bottom-16 right-0 hidden items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:flex lg:-right-2" style={{ animationDelay: '2.2s' }}>
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-blue-50"><Star size={19} className="text-brand-blue" /></span>
              <div><strong className="block text-[.82rem] text-slate-800">Real reviews</strong><small className="text-xs text-slate-500">From completed tasks</small></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="scroll-mt-24 border-y border-slate-200 bg-[#F7F9FC] py-20 md:py-24">
        <SectionHead tag="How It Works" title="Getting things done is this simple" sub="Three easy steps, no complicated processes, no guesswork." />
        <div className="container-x mt-14 grid gap-7 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 90} className="rounded-2xl border border-slate-200 bg-white p-8 transition hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(21,44,72,.10)]">
              <div className="mb-4 text-[.8rem] font-extrabold tracking-widest text-brand-blue">0{i + 1}</div>
              <div className="mb-5 grid h-[52px] w-[52px] place-items-center rounded-2xl bg-blue-50"><Icon size={26} className="text-brand-blue" /></div>
              <h3 className="mb-2.5 text-[1.15rem] font-bold text-brand-navy">{title}</h3>
              <p className="text-[.93rem] text-slate-500">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ TWO WAYS ============ */}
      <section id="post-a-task" className="scroll-mt-24 py-20 md:py-24">
        <SectionHead tag="For Everyone" title="Two ways to use TaskLink" sub="One account does both. Post a task today, earn tomorrow, switch modes whenever you like." />
        <div className="container-x mt-14 grid gap-7 lg:grid-cols-2">
          <Reveal className="rounded-[20px] bg-brand-navy p-9 text-white transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(21,44,72,.25)] md:p-10">
            <span className="mb-3.5 block text-xs font-bold uppercase tracking-widest text-blue-300">I Need Something Done</span>
            <h3 className="mb-2 text-2xl font-extrabold tracking-tight">Get help with any task</h3>
            <p className="mb-5 text-[.95rem] text-blue-100/80">From one-off errands to professional projects, find the right person fast.</p>
            <ul className="mb-8">
              {CLIENT_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 py-[7px] text-[.94rem]">
                  <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-blue-400/20"><Check size={12} strokeWidth={3.5} className="text-blue-300" /></span>{p}
                </li>
              ))}
            </ul>
            <Link to="/register" className="inline-flex rounded-[14px] border border-white/35 px-8 py-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10">Post a Task</Link>
          </Reveal>

          <Reveal delay={90} className="rounded-[20px] border border-slate-200 bg-white p-9 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(21,44,72,.14)] md:p-10">
            <span className="mb-3.5 block text-xs font-bold uppercase tracking-widest text-brand-blue">I Want to Earn</span>
            <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-brand-navy">Turn your skills into income</h3>
            <p className="mb-5 text-[.95rem] text-slate-500">Discover tasks that match what you're good at and get paid for doing them.</p>
            <ul className="mb-8">
              {WORKER_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 py-[7px] text-[.94rem] text-slate-800">
                  <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-blue-50"><Check size={12} strokeWidth={3.5} className="text-brand-blue" /></span>{p}
                </li>
              ))}
            </ul>
            <Link to="/register" className="inline-flex rounded-[14px] bg-brand-blue px-8 py-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(47,111,228,.3)] transition hover:-translate-y-px hover:bg-blue-700">Start Earning</Link>
          </Reveal>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="border-y border-slate-200 bg-[#F7F9FC] py-20 md:py-24">
        <SectionHead tag="Popular Tasks" title="Whatever you need, there's a category for it" />
        <div className="container-x mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map(({ icon: Icon, label }, i) => (
            <Reveal key={label} delay={(i % 5) * 60}>
              <Link to="/tasks" className="block rounded-[14px] border border-slate-200 bg-white px-3.5 py-6 text-center transition hover:-translate-y-[3px] hover:border-blue-200 hover:shadow-[0_8px_28px_rgba(21,44,72,.10)]">
                <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-blue-50"><Icon size={22} className="text-brand-blue" /></div>
                <span className="text-[.86rem] font-semibold text-slate-800">{label}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ LIVE / EXAMPLE TASKS ============ */}
      <section id="find-tasks" className="scroll-mt-24 py-20 md:py-24">
        <SectionHead
          tag={hasLive ? 'Live on TaskLink' : 'Examples'}
          title={hasLive ? 'Tasks people are posting right now' : 'The kind of tasks you can post or pick up'}
        />
        <div className="container-x mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {live.loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />)
            : hasLive
              ? live.items.map((t) => (
                <Reveal key={t._id}>
                  <Link to={`/tasks/${t._id}`} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-[22px] transition hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(21,44,72,.10)]">
                    <div className="mb-2.5 text-[.72rem] font-bold uppercase tracking-wider text-brand-blue">{t.category?.name || 'Task'}</div>
                    <h4 className="flex-1 text-[.98rem] font-semibold leading-snug text-slate-800">{t.title}</h4>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3.5">
                      <span className="flex items-center gap-1.5 text-[.78rem] text-slate-500"><Clock size={13} />{t.isRemote ? 'Online' : t.location} • {timeUntil(t.deadline)}</span>
                      <span className="text-[.95rem] font-bold text-brand-navy">{formatNaira(t.budgetKobo)}</span>
                    </div>
                  </Link>
                </Reveal>
              ))
              : EXAMPLE_TASKS.map((t) => (
                <Reveal key={t.title}>
                  <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-[22px]">
                    <div className="mb-2.5 text-[.72rem] font-bold uppercase tracking-wider text-brand-blue">{t.category}</div>
                    <h4 className="flex-1 text-[.98rem] font-semibold leading-snug text-slate-800">{t.title}</h4>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3.5">
                      <span className="flex items-center gap-1.5 text-[.78rem] text-slate-500"><Clock size={13} />{t.meta}</span>
                      <span className="text-[.95rem] font-bold text-brand-navy">{t.price}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to={hasLive ? '/tasks' : '/register'} className="inline-flex rounded-[14px] border-[1.5px] border-slate-200 bg-white px-8 py-[15px] font-semibold text-brand-navy transition hover:-translate-y-px hover:border-brand-blue hover:text-brand-blue">
            {hasLive ? 'View All Tasks' : 'Create an account to get started'}
          </Link>
        </Reveal>
      </section>

      {/* ============ TRUST ============ */}
      <section className="bg-brand-navy py-20 md:py-24">
        <SectionHead light tag="Why TaskLink" title="Built to make getting things done easier." sub="We keep every task safe, clear, and fair for the person posting and the person doing the work." />
        <div className="container-x mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 70} className="rounded-2xl border border-white/10 bg-white/[.06] p-7 transition hover:-translate-y-[3px] hover:bg-white/10">
              <div className="mb-[18px] grid h-[46px] w-[46px] place-items-center rounded-xl bg-blue-400/20"><Icon size={24} className="text-blue-300" /></div>
              <h3 className="mb-2 text-[1.02rem] font-bold text-white">{title}</h3>
              <p className="text-sm text-blue-200/80">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ BUILT FOR ============ */}
      <section className="py-20 md:py-24">
        <SectionHead tag="Built For" title="Real people with real things to get done" sub="TaskLink starts in Nigeria, with the people who need small jobs done most." />
        <div className="container-x mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 70} className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(21,44,72,.10)]">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-50"><Icon size={24} className="text-brand-blue" /></div>
              <h3 className="mb-2 text-lg font-bold text-brand-navy">{title}</h3>
              <p className="text-sm text-slate-500">{text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to="/about" className="inline-flex items-center gap-2 font-semibold text-brand-blue hover:underline"><CheckCircle2 size={18} /> Learn more about TaskLink</Link>
        </Reveal>
      </section>

      <CtaBanner />
      <div className="mb-24"></div>
    </>
  );
}
