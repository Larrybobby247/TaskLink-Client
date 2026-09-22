import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, code });
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    try {
      await authApi.resendCode({ email });
      setCooldown(60);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm card p-6 text-center">
        <h1 className="text-xl font-bold text-brand-navy mb-1">Verify your email</h1>
        <p className="text-sm text-gray-400 mb-6">Enter the 6-digit code sent to {email || 'your email'}.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="input-field text-center text-2xl tracking-[0.5em]"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="------"
          />
          <button className="btn-primary w-full" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        <button onClick={resend} disabled={cooldown > 0} className="text-brand-blue text-sm font-medium mt-4 disabled:text-gray-300">
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  );
}
