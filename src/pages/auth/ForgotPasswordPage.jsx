import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm card p-6 text-center">
        <h1 className="text-xl font-bold text-brand-navy mb-1">Reset your password</h1>
        {sent ? (
          <p className="text-sm text-gray-500 mt-4">If an account exists for {email}, a reset link has been sent.</p>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button className="btn-primary w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
            </form>
          </>
        )}
        <Link to="/login" className="text-brand-blue text-sm font-medium mt-5 inline-block">Back to login</Link>
      </div>
    </div>
  );
}
