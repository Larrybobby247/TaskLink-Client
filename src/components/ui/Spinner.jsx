import React from 'react';
import logo from '../../assets/logo.png';

export default function Spinner({ size = 120, className = '', animation = 'orbit' }) {
  const animationClasses = {
    orbit: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    float: 'animate-[float_1.8s_ease-in-out_infinite]',
  };

  const animationDuration = {
    orbit: '1.4s',
    pulse: '1.8s',
    bounce: '1.2s',
    float: '1.8s',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full bg-brand-navy/10 blur-md animate-pulse" />
      <div className="absolute inset-0 rounded-full border border-brand-blue/25 animate-spin" style={{ animationDuration: animationDuration[animation] || '1.4s' }} />
      <div className="absolute inset-[10%] rounded-full border border-brand-blue/20 animate-[spin_2.2s_linear_infinite_reverse]" />

      <img
        src={logo}
        alt="Loading"
        className={`relative z-10 h-full w-full object-contain drop-shadow-[0_0_16px_rgba(37,99,235,0.35)] ${animationClasses[animation] || animationClasses.orbit}`}
        style={{ animationDuration: animationDuration[animation] || '1.4s' }}
      />
    </div>
  );
}
