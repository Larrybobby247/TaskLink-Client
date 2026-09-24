import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Home,
  ClipboardList,
  Briefcase,
  Wallet,
  MessageCircle,
  Bell,
  Bookmark,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  Crown,
} from 'lucide-react';

import { messagesApi, notificationsApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';

const getId = (value) => String(value?._id || value?.id || value || '');

const getLastMessageSenderId = (conversation) => {
  const message = conversation.lastMessage && typeof conversation.lastMessage === 'object'
    ? conversation.lastMessage
    : null;

  return getId(
    conversation.lastMessageSender ||
      conversation.lastMessageSenderId ||
      conversation.lastSender ||
      message?.sender ||
      message?.senderId ||
      message?.user ||
      conversation.lastMessage?.userId
  );
};

const getUnreadMessageCount = (conversation, currentUserId) => {
  const directCount = conversation.unreadCount ?? conversation.unreadMessages ?? conversation.unreadMessageCount;
  if (typeof directCount === 'number') return directCount;

  const unreadForUser = conversation.unreadByUser?.[currentUserId];
  if (typeof unreadForUser === 'number') return unreadForUser;

  if (Array.isArray(conversation.unreadBy)) {
    const entry = conversation.unreadBy.find((item) => getId(item.user || item.userId || item) === currentUserId);
    if (typeof entry?.count === 'number') return entry.count;
    if (entry) return 1;
  }

  if (conversation.unread === true || conversation.hasUnread || conversation.isUnread || conversation.lastMessageRead === false) return 1;
  if (conversation.unread === false || conversation.hasUnread === false || conversation.isUnread === false || conversation.lastMessageRead === true) return 0;

  return getLastMessageSenderId(conversation) && getLastMessageSenderId(conversation) !== currentUserId ? 1 : 0;
};

const getResponseItems = (response, key) => {
  if (Array.isArray(response?.data)) return response.data;
  return response?.data?.[key] || [];
};

export default function SideMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const currentUserId = getId(user);

  useEffect(() => {
    if (!open) return undefined;

    let mounted = true;

    const loadUnreadCounts = async () => {
      const [notificationResult, conversationResult] = await Promise.allSettled([
        notificationsApi.list(),
        messagesApi.conversations(),
      ]);

      if (!mounted) return;

      if (notificationResult.status === 'fulfilled') {
        const notifications = getResponseItems(notificationResult.value, 'notifications');
        setUnreadNotifications(notifications.filter((notification) => !notification.isRead).length);
      }

      if (conversationResult.status === 'fulfilled') {
        const conversations = getResponseItems(conversationResult.value, 'conversations');
        setUnreadMessages(
          conversations.reduce(
            (total, conversation) => total + getUnreadMessageCount(conversation, currentUserId),
            0,
          ),
        );
      }
    };

    loadUnreadCounts();
    const interval = window.setInterval(loadUnreadCounts, 60_000);
    window.addEventListener('focus', loadUnreadCounts);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', loadUnreadCounts);
    };
  }, [open, currentUserId]);

  if (!open) return null;

  const countLabel = (count) => (count > 99 ? '99+' : count);

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/client/tasks', label: 'My Tasks', icon: ClipboardList },
    { to: '/worker/jobs', label: 'My Jobs', icon: Briefcase },
    { to: '/wallet', label: 'Wallet', icon: Wallet },
    { to: '/messages', label: 'Messages', icon: MessageCircle, count: unreadMessages },
    { to: '/notifications', label: 'Notifications', icon: Bell, count: unreadNotifications },
    { to: '/tasks/saved', label: 'Saved', icon: Bookmark },
    { to: '/profile', label: 'Reviews', icon: Star },
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

      <aside className="absolute top-0 right-0 h-[100dvh] w-[320px] max-w-[90vw] bg-white shadow-2xl flex flex-col overflow-hidden pb-20">
        <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {user?.profileImage?.url ? (
                <img src={user.profileImage.url} className="w-11 h-11 rounded-full object-cover shrink-0" alt="" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-brand-navy shrink-0">
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-brand-navy truncate">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">@{user?.username || 'user'}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 shrink-0" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <nav className="px-4 py-4 space-y-1">
            {items.map(({ to, label, icon: Icon, count = 0 }) => (
              <Link key={to} to={to} onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-brand-navy transition-colors">
                <span className="relative shrink-0">
                  <Icon size={19} strokeWidth={2} />
                  {count > 0 && <span className="absolute -right-2 -top-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center font-bold">{countLabel(count)}</span>}
                </span>
                <span className="text-sm font-medium flex-1">{label}</span>
                {count > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">{countLabel(count)}</span>}
              </Link>
            ))}

            <div className="py-2"><hr className="border-gray-100" /></div>

            <Link to="/settings" onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-brand-navy transition-colors">
              <Settings size={19} strokeWidth={2} />
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <Link to="/help" onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-brand-navy transition-colors">
              <HelpCircle size={19} strokeWidth={2} />
              <span className="text-sm font-medium">Help & Support</span>
            </Link>
            <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-brand-navy transition-colors text-left">
              <LogOut size={19} strokeWidth={2} />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </nav>
        </div>

        {user?.plan !== 'PRO' && (
          <div className="shrink-0 p-4 border-t border-gray-100 bg-white">
            <Link to="/settings/pro" onClick={onClose} className="flex items-center gap-3 w-full rounded-2xl p-4 bg-brand-bg border border-brand-navy/5 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0"><Crown size={20} className="text-brand-navy" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-brand-navy">Upgrade to Pro</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Lower fees, priority support and more.</p>
              </div>
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
