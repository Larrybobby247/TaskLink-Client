import React, { useEffect, useState } from 'react';
import {
  isPushSupported, getNotificationPermission, requestPushPermissionAndSubscribe, unsubscribeFromPush,
} from '../../push/registerPush.js';

/**
 * Drop this into SettingsPage.jsx's Notifications section, alongside the
 * email preference toggles, e.g.:
 *
 *   <PushNotificationToggle />
 *
 * Self-contained - reads/writes browser permission + the backend
 * subscription directly, no props needed.
 */
export default function PushNotificationToggle() {
  const [supported] = useState(isPushSupported());
  const [permission, setPermission] = useState(getNotificationPermission());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onVisibility = () => setPermission(getNotificationPermission());
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  if (!supported) {
    return (
      <div className="flex items-center justify-between gap-4 opacity-60">
        <div>
          <p className="text-sm font-medium text-gray-700">Push notifications</p>
          <p className="text-xs text-gray-500">Not supported in this browser.</p>
        </div>
      </div>
    );
  }

  const enable = async () => {
    setBusy(true);
    try {
      const { permission: granted } = await requestPushPermissionAndSubscribe();
      setPermission(granted);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await unsubscribeFromPush();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-700">Push notifications</p>
        <p className="text-xs text-gray-500">
          {permission === 'denied'
            ? 'Blocked in your browser settings — enable notifications for this site there to turn this back on.'
            : 'Get new task and activity alerts on this device, even when TaskLink isn\'t open.'}
        </p>
      </div>
      {permission === 'granted' ? (
        <button type="button" onClick={disable} disabled={busy} className="text-xs font-medium text-red-500 shrink-0">
          {busy ? '...' : 'Turn off'}
        </button>
      ) : permission === 'denied' ? (
        <span className="chip bg-gray-100 text-gray-400 shrink-0">Blocked</span>
      ) : (
        <button type="button" onClick={enable} disabled={busy} className="text-xs font-medium text-brand-blue shrink-0">
          {busy ? 'Enabling...' : 'Turn on'}
        </button>
      )}
    </div>
  );
}
