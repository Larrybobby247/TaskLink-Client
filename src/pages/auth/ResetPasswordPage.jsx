import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.js';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword({ token: params.get('token'), email: params.get('email'), ...form });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm card p-6">
        <h1 className="text-xl font-bold text-brand-navy mb-1 text-center">Set a new password</h1>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 my-4">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3 mt-4">
          <input className="input-field" type="password" placeholder="New password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Saving...' : 'Reset password'}</button>
        </form>
      </div>
    </div>
  );
}
