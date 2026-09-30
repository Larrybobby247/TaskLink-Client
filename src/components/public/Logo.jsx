import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Logo({ light = false, className = '' }) {
  return (
    <Link
      to="/"
      aria-label="TaskLink home"
      className={`flex items-center gap-2.5 text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-brand-navy'} ${className}`}
    >
      {/* <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-brand-navy to-brand-blue" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </span>
      TaskLink */}
      <img src={logo} alt="Logo" className='w-26 lg:w-30 '/>
    </Link>
  );
}
