import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart, ShieldCheck, MapPin, MessageSquareOff, Wallet, Star, ClipboardCheck } from 'lucide-react';
import PageHero from '../../components/public/PageHero.jsx';
import Reveal from '../../components/public/Reveal.jsx';
import CtaBanner from '../../components/public/CtaBanner.jsx';
import usePageTitle from '../../hooks/usePageTitle.js';

const VALUES = [
  { icon: Zap, title: 'Simple', text: 'Posting a task or applying for one should take minutes, not hours. We cut everything that gets in the way.' },
  { icon: Heart, title: 'Useful', text: 'We build for everyday needs: a flyer, a delivery, a typed assignment, a repaired door. Small jobs matter.' },
  { icon: ShieldCheck, title: 'Trustworthy', text: 'Clear rules, confirmed payments, honest reviews and a team that steps in when something goes wrong.' },
  { icon: MapPin, title: 'Local first', text: 'We start with the people around you: campuses, neighbourhoods and small businesses across Nigeria.' },
];

const PROBLEMS = [
  { icon: MessageSquareOff, title: 'Scattered and informal', text: 'Small jobs usually get arranged in group chats and word of mouth, with no record of who agreed to what.' },
  { icon: Wallet, title: 'Payment worries', text: 'Clients fear paying upfront for work that never arrives. Workers fear finishing a job and never being paid.' },
  { icon: Star, title: 'No reputation to build on', text: 'Good work goes unrecognised, so talented people keep starting from zero with every new client.' },
];

const SOLUTIONS = [
  { icon: ClipboardCheck, text: 'Every task has a clear brief, budget and deadline, and the agreed price is locked in once you choose someone.' },
  { icon: Wallet, text: 'Payment is confirmed through Paystack before work starts, and the worker is paid out once the client approves the result.' },
  { icon: Star, text: 'Both sides leave reviews after each task, so reputation follows people from job to job.' },
  { icon: ShieldCheck, text: 'If something goes wrong, either side can raise a dispute and our team will review it.' },
];

export default function AboutPage() {
  usePageTitle('About');
  return (
    <>
      <PageHero
        tag="About TaskLink"
        title="We make small jobs easy to post, easy to find and safe to complete."
        subtitle="TaskLink connects people who need things done with people who have the skills to do them, starting in Nigeria."
      />

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[.12em] text-brand-blue">Our mission</span>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-tight tracking-tight text-brand-navy">Everyone has a skill. Everyone has a task.</h2>
            <p className="mt-5 text-slate-500">
              Somewhere near you, a student can type faster than anyone in class, a freelancer is between projects, and a neighbour is a brilliant photographer.
              Somewhere else, a shop owner needs a flyer by tonight and a parent needs a tutor this week.
            </p>
            <p className="mt-4 text-slate-500">
              TaskLink exists to put those two groups in touch, quickly and with confidence. We want anyone to be able to earn from what they are good at,
              and anyone to be able to get help without the stress of guessing who to trust.
            </p>
          </Reveal>
          <Reveal delay={100} className="rounded-3xl bg-brand-navy p-8 text-white md:p-10">
            <p className="text-2xl font-extrabold leading-snug tracking-tight">“Need something done? Find someone who can do it.”</p>
            <p className="mt-4 text-blue-200/80">One account. Post tasks when you need help, switch to earning mode when you want to work. No separate sign-ups, ever.</p>
            <Link to="/register" className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-brand-blue transition hover:-translate-y-px">Join TaskLink</Link>
          </Reveal>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-slate-200 bg-[#F7F9FC] py-16 md:py-20">
        <Reveal className="container-x text-center">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[.12em] text-brand-blue">The problem</span>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight text-brand-navy">Getting small jobs done shouldn't be this hard</h2>
        </Reveal>
        <div className="container-x mt-12 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="rounded-2xl border border-slate-200 bg-white p-7">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-50"><Icon size={24} className="text-brand-blue" /></div>
              <h3 className="mb-2 text-lg font-bold text-brand-navy">{title}</h3>
              <p className="text-sm text-slate-500">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal>
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[.12em] text-brand-blue">How we help</span>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-tight tracking-tight text-brand-navy">Structure, safety and reputation in one place</h2>
            <p className="mt-5 text-slate-500">TaskLink adds the missing pieces around a simple idea, so both sides can focus on the work itself.</p>
          </Reveal>
          <div className="space-y-4">
            {SOLUTIONS.map(({ icon: Icon, text }, i) => (
              <Reveal key={text} delay={i * 70} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50"><Icon size={22} className="text-brand-blue" /></div>
                <p className="self-center text-[.95rem] text-slate-600">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-brand-navy py-16 md:py-20">
        <Reveal className="container-x text-center">
          <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[.12em] text-blue-300">What we believe</span>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight text-white">Our values</h2>
        </Reveal>
        <div className="container-x mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 70} className="rounded-2xl border border-white/10 bg-white/[.06] p-7">
              <div className="mb-4 grid h-[46px] w-[46px] place-items-center rounded-xl bg-blue-400/20"><Icon size={22} className="text-blue-300" /></div>
              <h3 className="mb-2 text-[1.05rem] font-bold text-white">{title}</h3>
              <p className="text-sm text-blue-200/80">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="pt-20 mb-24"><CtaBanner /></div>
    </>
  );
}
