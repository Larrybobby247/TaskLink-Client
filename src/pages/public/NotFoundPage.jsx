import React from 'react';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle.js';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-gradient-to-b from-[#F4F8FE] to-white px-6 pt-24 text-center">
      <div>
        <p className="text-7xl font-extrabold tracking-tight text-brand-blue">404</p>
        <h1 className="mt-4 text-2xl font-extrabold text-brand-navy">We couldn't find that page</h1>
        <p className="mx-auto mt-3 max-w-sm text-slate-500">The link may be broken or the page may have moved. Let's get you back on track.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">Back to home</Link>
          <Link to="/contact" className="btn-secondary">Contact support</Link>
        </div>
      </div>
    </section>
  );
}
