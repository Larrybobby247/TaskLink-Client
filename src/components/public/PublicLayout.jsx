import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/landing.css';

const NAV = [
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

const FOOTER_PRODUCT = [
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/tasks', label: 'Find Tasks' },
  { to: '/register', label: 'Post a Task' },
  { to: '/faq', label: 'FAQ' },
];
const FOOTER_COMPANY = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
const FOOTER_LEGAL = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
];

/** Scrolls to #hash targets (smoothly) or back to the top on route change. */
function useScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
}

export default function PublicLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useScrollManager();

  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = (to) =>
    `text-[.925rem] font-medium transition-colors hover:text-brand-navy ${location.pathname === to ? 'text-brand-navy' : 'text-slate-500'}`;

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased">
      {/* ---------- Navbar ---------- */}
      <header className={`fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md transition-shadow ${scrolled || open ? 'border-b border-slate-200 shadow-sm' : 'border-b border-transparent'}`}>
        <div className="container-x flex h-[72px] items-center justify-between">
          <Logo />

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            {NAV.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass(l.to)}>{l.label}</Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Link to="/" className="rounded-xl bg-brand-blue px-6 py-3 text-[.95rem] font-semibold text-white shadow-[0_4px_14px_rgba(47,111,228,.3)] transition hover:-translate-y-px hover:bg-blue-700">
                Open App
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2.5 text-[.95rem] font-semibold text-brand-navy transition hover:text-brand-blue">Log In</Link>
                <Link to="/register" className="rounded-xl bg-brand-blue px-6 py-3 text-[.95rem] font-semibold text-white shadow-[0_4px_14px_rgba(47,111,228,.3)] transition hover:-translate-y-px hover:bg-blue-700">Sign Up</Link>
              </>
            )}
          </div>

          <button
            className="p-2 text-brand-navy md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-100 bg-white px-6 pb-5 pt-2 md:hidden">
            {NAV.map((l) => (
              <Link key={l.to} to={l.to} className="block border-b border-slate-100 py-3.5 text-base font-medium text-slate-700">{l.label}</Link>
            ))}
            <div className="mt-4 flex flex-col gap-3">
              {user ? (
                <Link to="/" className="rounded-xl bg-brand-blue py-3 text-center font-semibold text-white">Open App</Link>
              ) : (
                <>
                  <Link to="/register" className="rounded-xl bg-brand-blue py-3 text-center font-semibold text-white">Sign Up</Link>
                  <Link to="/login" className="rounded-xl border border-slate-200 py-3 text-center font-semibold text-brand-navy">Log In</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>{children ?? <Outlet />}</main>

      {/* ---------- Footer ---------- */}
      <footer className="bg-brand-navy pb-8 pt-16 text-blue-100/70">
        <div className="container-x">
          <div className="grid gap-10 border-b border-white/10 pb-11 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo light className="mb-3.5" />
              <p className="max-w-[260px] text-[.95rem]">Need something done? Find someone nearby.</p>
            </div>
            {[['Product', FOOTER_PRODUCT], ['Company', FOOTER_COMPANY], ['Legal', FOOTER_LEGAL]].map(([title, links]) => (
              <div key={title}>
                <h4 className="mb-4 text-[.85rem] font-bold uppercase tracking-[.08em] text-white">{title}</h4>
                <ul className="space-y-3">
                  {links.map((l) => (
                    <li key={l.label}><Link to={l.to} className="text-[.92rem] transition-colors hover:text-white">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-7 text-[.82rem] sm:justify-between">
            <span>© {new Date().getFullYear()} TaskLink. All rights reserved.</span>
            <span>Simple. Useful. Trustworthy.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
