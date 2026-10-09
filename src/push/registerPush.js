import { pushApi } from '../api/push.js';

// Push subscription keys arrive base64url-encoded; the browser's
// PushManager.subscribe() wants them as a raw Uint8Array.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

/**
 * Subscribes (or reuses an existing subscription) and syncs it to the
 * backend. Safe to call repeatedly - PushManager.getSubscription() returns
 * the existing one if already subscribed, and the backend upserts by
 * endpoint, so this never creates duplicates.
 */
export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const { data } = await pushApi.getPublicKey();
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
  }

  await pushApi.subscribe(subscription.toJSON());
  return subscription;
}

/** Call this from a user gesture (button click) - browsers require that for Notification.requestPermission(). */
export async function requestPushPermissionAndSubscribe() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { permission, subscribed: false };
  const subscription = await subscribeToPush();
  return { permission, subscribed: Boolean(subscription) };
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await pushApi.unsubscribe(subscription.endpoint);
    await subscription.unsubscribe();
  }
}
