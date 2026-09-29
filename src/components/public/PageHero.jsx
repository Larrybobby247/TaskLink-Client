import React from 'react';

/** Compact hero used at the top of inner pages (About, FAQ, Contact, legal). */
export default function PageHero({ tag, title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F8FE] to-white pb-14 pt-36 text-center md:pb-16">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(47,111,228,.12),transparent_65%)]" />
      <div className="container-x relative">
        {tag && <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[.12em] text-brand-blue">{tag}</span>}
        <h1 className="mx-auto max-w-3xl text-[clamp(2rem,4.6vw,3.1rem)] font-extrabold leading-tight tracking-tight text-brand-navy">{title}</h1>
        {subtitle && <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">{subtitle}</p>}
      </div>
    </section>
  );
}
