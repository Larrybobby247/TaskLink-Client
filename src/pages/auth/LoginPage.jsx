import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (!data.emailVerified) {
        navigate('/verify-email', { state: { email: form.email } });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-md card p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold text-xl mx-auto mb-3">T</div>
          <h1 className="text-xl font-bold text-brand-navy">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1">Need something done? Find someone nearby.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input-field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-brand-blue">Forgot password?</Link>
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          New to TaskLink? <Link to="/register" className="text-brand-blue font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
