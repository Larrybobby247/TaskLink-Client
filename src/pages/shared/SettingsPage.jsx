import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { usersApi, subscriptionsApi } from '../../api/users.js';

export default function SettingsPage() {
  const { user, updateLocalUser } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
  });

  const [bankForm, setBankForm] = useState({
    bankName: user?.bankDetails?.bankName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    accountName: user?.bankDetails?.accountName || '',
  });

  const [saving, setSaving] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [proLoading, setProLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data } = await usersApi.updateProfile(form);
      updateLocalUser(data.user);
    } finally {
      setSaving(false);
    }
  };

  const saveBankDetails = async (e) => {
    e.preventDefault();
    setSavingBank(true);

    try {
      // Create this endpoint in your API if it doesn't already exist.
      const { data } = await usersApi.updateBankDetails(bankForm);
      updateLocalUser(data.user);
    } finally {
      setSavingBank(false);
    }
  };

  const goPro = async () => {
    setProLoading(true);

    try {
      const { data } = await subscriptionsApi.initialize();
      window.location.href = data.authorizationUrl;
    } finally {
      setProLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-10 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-brand-navy">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account, payments and TaskLink preferences.
        </p>
      </div>

      {/* ACCOUNT */}
      <form onSubmit={save} className="card p-5 space-y-3">
        <div className="mb-2">
          <h3 className="font-semibold text-brand-navy">Account information</h3>
          <p className="text-sm text-gray-500">
            Update the information shown on your TaskLink profile.
          </p>
        </div>

        <input
          className="input-field"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) =>
            setForm({ ...form, fullName: e.target.value })
          }
        />

        <input
          className="input-field"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <input
          className="input-field"
          placeholder="Location"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
        />

        <textarea
          className="input-field min-h-[100px]"
          placeholder="Tell clients a little about yourself"
          value={form.bio}
          onChange={(e) =>
            setForm({ ...form, bio: e.target.value })
          }
        />

        <button
          className="btn-primary w-full"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      {/* BANK DETAILS */}
      <form onSubmit={saveBankDetails} className="card p-5 space-y-3">
        <div className="mb-3">
          <h3 className="font-semibold text-brand-navy">
            Payment account
          </h3>

          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> This is the bank account TaskLink
              will use when sending your earnings from completed tasks.
              Make sure the account details belong to you and are correct.
            </p>
          </div>
        </div>

        <input
          className="input-field"
          placeholder="Bank name"
          value={bankForm.bankName}
          onChange={(e) =>
            setBankForm({
              ...bankForm,
              bankName: e.target.value,
            })
          }
        />

        <input
          className="input-field"
          placeholder="Account number"
          inputMode="numeric"
          maxLength={10}
          value={bankForm.accountNumber}
          onChange={(e) =>
            setBankForm({
              ...bankForm,
              accountNumber: e.target.value.replace(/\D/g, ''),
            })
          }
        />

        <input
          className="input-field"
          placeholder="Account name"
          value={bankForm.accountName}
          onChange={(e) =>
            setBankForm({
              ...bankForm,
              accountName: e.target.value,
            })
          }
        />

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={savingBank}
        >
          {savingBank ? 'Saving...' : 'Save bank details'}
        </button>
      </form>

      {/* PLANS */}
      <div className="card p-5">
        <div className="mb-5">
          <h3 className="font-semibold text-brand-navy">
            TaskLink plans
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Choose the plan that works best for how you use TaskLink.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {/* FREE PLAN */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-brand-navy">
                  Free
                </h4>
                <p className="text-sm text-gray-500">
                  ₦0 forever
                </p>
              </div>

              {user?.plan !== 'PRO' && (
                <span className="chip bg-gray-100 text-gray-600">
                  Current plan
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">

              <p className="font-medium text-gray-700">
                Included:
              </p>

              <ul className="space-y-2 text-gray-600">
                <li>✓ Browse available tasks</li>
                <li>✓ Post tasks</li>
                <li>✓ Apply for tasks</li>
                <li>✓ Receive payments</li>
                <li>✓ Basic profile</li>
                <li>✓ Standard support</li>
              </ul>

              <p className="font-medium text-gray-700 pt-3">
                Limitations:
              </p>

              <ul className="space-y-2 text-gray-500">
                <li>× Limited applications</li>
                <li>× No Pro badge</li>
                <li>× No priority support</li>
              </ul>
            </div>
          </div>

          {/* PRO PLAN */}
          <div className="border-2 border-brand-blue rounded-xl p-4 relative">

            <span className="absolute -top-3 left-4 px-2 py-1 text-xs font-semibold rounded-full bg-brand-blue text-white">
              PRO
            </span>

            <div className="flex items-center justify-between mb-3 pt-2">
              <div>
                <h4 className="font-semibold text-brand-navy">
                  TaskLink Pro
                </h4>

                <p className="text-sm text-gray-500">
                  ₦2,500
                </p>
              </div>

              {user?.plan === 'PRO' && (
                <span className="chip bg-green-50 text-green-700">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">

              <p className="font-medium text-gray-700">
                Everything in Free, plus:
              </p>

              <ul className="space-y-2 text-gray-600">
                <li>✓ Unlimited applications</li>
                <li>✓ Pro profile badge</li>
                <li>✓ Priority support</li>
                <li>✓ Access to Pro features as they are introduced</li>
              </ul>

              <p className="font-medium text-gray-700 pt-3">
                Not included:
              </p>

              <ul className="space-y-2 text-gray-500">
                <li>× Does not guarantee task approval</li>
                <li>× Does not guarantee earnings</li>
              </ul>
            </div>

            {user?.plan !== 'PRO' && (
              <button
                onClick={goPro}
                disabled={proLoading}
                className="btn-primary w-full mt-5"
              >
                {proLoading
                  ? 'Redirecting...'
                  : 'Upgrade to Pro — ₦2,500'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy">
          Security
        </h3>

        <p className="text-sm text-gray-500 mt-1 mb-4">
          Keep your TaskLink account secure.
        </p>

        <button
          type="button"
          className="w-full border rounded-lg px-4 py-3 text-sm font-medium text-brand-navy hover:bg-gray-50"
        >
          Change password
        </button>
      </div>

      {/* NOTIFICATIONS */}
      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy">
          Notifications
        </h3>

        <p className="text-sm text-gray-500 mt-1 mb-4">
          Choose how you want TaskLink to notify you.
        </p>

        <div className="space-y-4">

          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Task updates
              </p>
              <p className="text-xs text-gray-500">
                Updates about your tasks and applications.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Payment notifications
              </p>
              <p className="text-xs text-gray-500">
                Get notified about payments and withdrawals.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4"
            />
          </label>
        </div>
      </div>

      {/* ACCOUNT ACTIONS */}
      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy">
          Account
        </h3>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            className="w-full border rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Deactivate account
          </button>
        </div>
      </div>

    </div>
  );
        }
