import React from 'react';
import PageHero from './PageHero.jsx';
import { SITE } from '../../config/site.js';

/** Shared layout for Privacy / Terms: hero, sticky table of contents, numbered sections. */
export default function LegalLayout({ title, intro, sections }) {
  const slug = (i) => `section-${i + 1}`;
  return (
    <>
      <PageHero tag="Legal" title={title} subtitle={`Last updated: ${SITE.legalUpdated}`} />
      <section className="pb-20 md:pb-24">
        <div className="container-x grid gap-12 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5" aria-label="On this page">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">On this page</p>
              <ol className="space-y-2 text-sm">
                {sections.map((s, i) => (
                  <li key={s.heading}>
                    <a href={`#${slug(i)}`} className="text-slate-500 transition hover:text-brand-blue">{i + 1}. {s.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="max-w-3xl">
            {intro && <p className="mb-10 text-[1.02rem] leading-relaxed text-slate-600">{intro}</p>}
            {sections.map((s, i) => (
              <div key={s.heading} id={slug(i)} className="mb-10 scroll-mt-28">
                <h2 className="mb-3 text-xl font-extrabold text-brand-navy">{i + 1}. {s.heading}</h2>
                {s.paragraphs?.map((p) => <p key={p} className="mb-3 leading-relaxed text-slate-600">{p}</p>)}
                {s.list && (
                  <ul className="mb-3 list-disc space-y-1.5 pl-5 text-slate-600">
                    {s.list.map((item) => <li key={item} className="leading-relaxed">{item}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
