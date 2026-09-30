import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { usersApi, subscriptionsApi } from "../../api/users.js";
import { withdrawalsApi } from "../../api/orders.js";
import { authApi } from "../../api/auth.js";
import PasswordInput from "../../components/ui/PasswordInput.jsx";
import ConfirmModal from "../../components/ui/ConfirmModal.jsx";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function SettingsPage() {
  const { user, updateLocalUser } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    location: user?.location || "",
    phone: user?.phone || "",
  });

  const [bankForm, setBankForm] = useState({
    bankName: user?.bankDetails?.bankName || "",
    accountNumber: user?.bankDetails?.accountNumber || "",
    accountName: user?.bankDetails?.accountName || "",
  });

  // ---- Change password ----
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwOpen, setPwOpen] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // ---- Notifications ----
  const [notifPrefs, setNotifPrefs] = useState(
    user?.notificationPreferences?.email || {
      applications: true,
      payments: true,
      messages: true,
      marketing: true,
    },
  );
  const [savingNotif, setSavingNotif] = useState(false);

  // ---- Deactivate account ----
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [proLoading, setProLoading] = useState(false);

  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

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

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    setPwSaving(true);
    try {
      await authApi.changePassword(pwForm);
      setPwSuccess("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwOpen(false), 1200);
    } catch (err) {
      setPwError(err.errors?.[0]?.message || err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const uploadProfileImage = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    setImageError("");

    try {
      const formData = new FormData();
      formData.append("image", file); // backend expects the field name "image"

      // FIX: usersApi.uploadProfileImage returns the full API envelope
      // ({ success, data: { user } }), same as every other call - the
      // previous version read `response.user` (undefined) instead of
      // `response.data.user`, which is why this silently failed.
      const response = await usersApi.uploadProfileImage(formData);
      const updatedUser = response.data.user;

      setProfileImage(updatedUser.profileImage);
      updateLocalUser(updatedUser);
    } catch (err) {
      setImageError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleNotif = async (key) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next); // optimistic
    setSavingNotif(true);
    try {
      const { data } = await usersApi.updateNotificationPreferences(next);
      updateLocalUser(data.user);
    } catch {
      setNotifPrefs(notifPrefs); // revert on failure
    } finally {
      setSavingNotif(false);
    }
  };

  const confirmDeactivate = async () => {
    await usersApi.deactivateAccount();
    await logout();
    navigate("/login");
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

      {/* PROFILE PICTURE */}
      <div className="card p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-brand-navy">Profile picture</h3>

          <p className="text-sm text-gray-500 mt-1">
            Add a profile picture so people can recognize you on TaskLink.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
              {profileImage?.url ? (
                <img
                  src={profileImage.url}
                  alt={user?.fullName || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-navy text-white flex items-center justify-center text-xl font-semibold">
                  {getInitials(user?.fullName)}
                </div>
              )}
            </div>

            {uploadingImage && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs">Uploading...</span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <label
              htmlFor="profile-image"
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-blue text-white text-sm font-medium ${
                uploadingImage
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:opacity-90"
              }`}
            >
              {uploadingImage ? "Uploading..." : "Change picture"}
            </label>

            <input
              id="profile-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploadingImage}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  uploadProfileImage(file);
                }

                e.target.value = "";
              }}
            />

            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG or WebP · Maximum 5MB
            </p>

            {imageError && (
              <p className="text-sm text-red-500 mt-2">{imageError}</p>
            )}
          </div>
        </div>
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
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <input
          className="input-field"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          className="input-field"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <textarea
          className="input-field min-h-[100px]"
          placeholder="Tell clients a little about yourself"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        <button className="btn-primary w-full" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* BANK DETAILS */}
      <form onSubmit={saveBankDetails} className="card p-5 space-y-3">
        <div className="mb-3">
          <h3 className="font-semibold text-brand-navy">Payment account</h3>

          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> This is the bank account TaskLink will
              use when sending your earnings from completed tasks. Make sure the
              account details belong to you and are correct.
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
              accountNumber: e.target.value.replace(/\D/g, ""),
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
          {savingBank ? "Saving..." : "Save bank details"}
        </button>
      </form>

      {/* PLANS */}
      <div className="card p-5">
        <div className="mb-5">
          <h3 className="font-semibold text-brand-navy">TaskLink plans</h3>

          <p className="text-sm text-gray-500 mt-1">
            Choose the plan that works best for how you use TaskLink.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* FREE PLAN */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-brand-navy">Free</h4>
                <p className="text-sm text-gray-500">₦0 forever</p>
              </div>

              {user?.plan !== "PRO" && (
                <span className="chip bg-gray-100 text-gray-600">
                  Current plan
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-700">Included:</p>

              <ul className="space-y-2 text-gray-600">
                <li>✓ Browse available tasks</li>
                <li>✓ Post tasks</li>
                <li>✓ Apply for tasks</li>
                <li>✓ Receive payments</li>
                <li>✓ Basic profile</li>
                <li>✓ Standard support</li>
              </ul>

              <p className="font-medium text-gray-700 pt-3">Limitations:</p>

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
                <h4 className="font-semibold text-brand-navy">TaskLink Pro</h4>

                <p className="text-sm text-gray-500">₦2,500</p>
              </div>

              {user?.plan === "PRO" && (
                <span className="chip bg-green-50 text-green-700">Active</span>
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

              <p className="font-medium text-gray-700 pt-3">Not included:</p>

              <ul className="space-y-2 text-gray-500">
                <li>× Does not guarantee task approval</li>
                <li>× Does not guarantee earnings</li>
              </ul>
            </div>

            {user?.plan !== "PRO" && (
              <button
                onClick={goPro}
                disabled={proLoading}
                className="btn-primary w-full mt-5"
              >
                {proLoading ? "Redirecting..." : "Upgrade to Pro — ₦2,500"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy">Security</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Keep your TaskLink account secure.
        </p>

        {!pwOpen ? (
          <button
            type="button"
            onClick={() => setPwOpen(true)}
            className="w-full border rounded-lg px-4 py-3 text-sm font-medium text-brand-navy hover:bg-gray-50"
          >
            Change password
          </button>
        ) : (
          <form onSubmit={changePassword} className="space-y-3">
            {pwError && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3">
                {pwSuccess}
              </div>
            )}
            <PasswordInput
              placeholder="Current password"
              value={pwForm.currentPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, currentPassword: e.target.value })
              }
              required
            />
            <PasswordInput
              placeholder="New password"
              value={pwForm.newPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, newPassword: e.target.value })
              }
              required
              minLength={8}
            />
            <PasswordInput
              placeholder="Confirm new password"
              value={pwForm.confirmPassword}
              onChange={(e) =>
                setPwForm({ ...pwForm, confirmPassword: e.target.value })
              }
              required
              minLength={8}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPwOpen(false);
                  setPwError("");
                  setPwForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={pwSaving}
              >
                {pwSaving ? "Saving..." : "Save new password"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* NOTIFICATIONS */}
      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy">Notifications</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Choose which emails TaskLink sends you. Security emails can't be
          turned off.
        </p>

        <div className="space-y-4">
          {[
            [
              "applications",
              "Application updates",
              "New applications, acceptances and rejections.",
            ],
            [
              "payments",
              "Payment notifications",
              "Payments, orders and withdrawals.",
            ],
            ["messages", "Messages", "Email me when I get a new message."],
            [
              "marketing",
              "Product updates",
              "New features and occasional tips.",
            ],
          ].map(([key, label, desc]) => (
            <label
              key={key}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(notifPrefs[key])}
                onChange={() => toggleNotif(key)}
                disabled={savingNotif}
                className="h-4 w-4"
              />
            </label>
          ))}
        </div>
      </div>

      {/* ACCOUNT ACTIONS */}
      <div className="card p-5">
        <h3 className="font-semibold text-brand-navy">Account</h3>
        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={() => setDeactivateOpen(true)}
            className="w-full border rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Deactivate account
          </button>
        </div>
      </div>

      {deactivateOpen && (
        <ConfirmModal
          title="Deactivate your account?"
          description="You'll be logged out immediately and won't be able to sign back in until an admin reactivates your account. Any open tasks or orders will still need to be resolved."
          confirmLabel="Deactivate account"
          danger
          onConfirm={confirmDeactivate}
          onClose={() => setDeactivateOpen(false)}
        />
      )}
    </div>
  );
}
