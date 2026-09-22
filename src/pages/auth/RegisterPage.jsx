import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: '', referralCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(err.errors?.[0]?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-10">
      <div className="w-full max-w-md card p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold text-xl mx-auto mb-3">T</div>
          <h1 className="text-xl font-bold text-brand-navy">Create your TaskLink account</h1>
          <p className="text-sm text-gray-400 mt-1">Post tasks or earn money — one account for both.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <input className="input-field" name="fullName" placeholder="Full name" value={form.fullName} onChange={onChange} required />
          <input className="input-field" name="username" placeholder="Username" value={form.username} onChange={onChange} required />
          <input className="input-field" type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
          <input className="input-field" name="phone" placeholder="Phone number" value={form.phone} onChange={onChange} required />
          <input className="input-field" type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} required />
          <input className="input-field" type="password" name="confirmPassword" placeholder="Confirm password" value={form.confirmPassword} onChange={onChange} required />
          <input className="input-field" name="referralCode" placeholder="Referral code (optional)" value={form.referralCode} onChange={onChange} />
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account? <Link to="/login" className="text-brand-blue font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
