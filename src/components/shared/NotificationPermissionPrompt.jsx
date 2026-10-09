import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { isPushSupported, getNotificationPermission, requestPushPermissionAndSubscribe, subscribeToPush } from '../../push/registerPush.js';
import { useAuth } from '../../context/AuthContext.jsx';

const DISMISS_KEY = 'tasklink_push_prompt_dismissed';

/**
 * Mount this once in your authenticated app shell (e.g. AppLayout.jsx) -
 * see FRONTEND_INTEGRATION_SNIPPETS.md. It renders nothing most of the
 * time: only shows a small banner the first time a signed-in user hasn't
 * been asked about notifications yet, and never again if they dismiss it
 * or already answered (granted/denied) in the browser.
 */
export default function NotificationPermissionPrompt() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !isPushSupported()) return undefined;
    let cancelled = false;

    (async () => {
      const permission = getNotificationPermission();

      if (permission === 'granted') {
        // Already granted (e.g. from another session) - make sure the
        // backend has a current subscription for this device, silently.
        subscribeToPush().catch(() => {});
        return;
      }

      if (permission === 'default' && !localStorage.getItem(DISMISS_KEY) && !cancelled) {
        setVisible(true);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  if (!visible) return null;

  const enable = async () => {
    setBusy(true);
    try {
      await requestPushPermissionAndSubscribe();
    } catch {
      // If subscribing fails (e.g. push not configured on the backend yet),
      // fail quietly - the in-app /notifications page still works either way.
    } finally {
      setBusy(false);
      setVisible(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40">
      <div className="card p-4 flex items-start gap-3 shadow-lg border border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-brand-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-brand-navy">Stay in the loop</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Get notified the moment a new task drops or something happens with yours — right on your device.
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={enable} disabled={busy} className="btn-primary text-xs py-2 px-4">
              {busy ? 'Enabling...' : 'Enable notifications'}
            </button>
            <button onClick={dismiss} className="text-xs text-gray-400 font-medium px-2">Not now</button>
          </div>
        </div>
        <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 shrink-0" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
