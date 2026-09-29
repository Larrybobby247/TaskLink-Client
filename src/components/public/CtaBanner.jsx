import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';

export default function CtaBanner({
  title = "Whatever needs to get done, there's someone who can help.",
  text = 'Join TaskLink and connect with people who need your skills, or people who can help you get things done.',
}) {
  return (
    <div className="container-x pb-20 md:pb-24">
      <Reveal className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-blue to-brand-navy px-7 py-16 text-center text-white md:px-12 md:py-20">
        <div className="pointer-events-none absolute -bottom-40 -left-28 h-[420px] w-[420px] rounded-full bg-white/[.07]" />
        <div className="pointer-events-none absolute -right-24 -top-36 h-[360px] w-[360px] rounded-full bg-white/[.07]" />
        <h2 className="relative mx-auto max-w-2xl text-[clamp(1.7rem,3.6vw,2.6rem)] font-extrabold leading-tight tracking-tight">{title}</h2>
        <p className="relative mx-auto mb-9 mt-4 max-w-lg text-blue-100">{text}</p>
        <div className="relative flex flex-col justify-center gap-3.5 sm:flex-row">
          <Link to="/register" className="rounded-2xl bg-white px-8 py-4 font-semibold text-brand-blue shadow-lg transition hover:-translate-y-0.5">Create Your Account</Link>
          <Link to="/login" className="rounded-2xl border border-white/40 px-8 py-4 font-semibold text-white transition hover:border-white hover:bg-white/10">Log In</Link>
        </div>
      </Reveal>
    </div>
  );
}
