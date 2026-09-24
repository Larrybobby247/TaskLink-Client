import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messagesApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { timeAgo } from '../../utils/time.js';

const getId = (value) => String(value?._id || value?.id || value || '');

const getLastMessage = (conversation) => {
  const message = conversation.lastMessage;
  if (message && typeof message === 'object') return message;
  return null;
};

const getLastMessageText = (conversation) => {
  const message = getLastMessage(conversation);
  return message?.text || conversation.lastMessageText || conversation.preview || (typeof conversation.lastMessage === 'string' ? conversation.lastMessage : '') || 'No messages yet';
};

const getLastMessageSenderId = (conversation) => {
  const message = getLastMessage(conversation);
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

const getUnreadCount = (conversation, currentUserId) => {
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

  // If the API gives us the last sender but no count, an incoming last message
  // is unread until the backend supplies a more precise read state.
  return getLastMessageSenderId(conversation) && getLastMessageSenderId(conversation) !== currentUserId ? 1 : 0;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(null);
  const currentUserId = getId(user);

  useEffect(() => {
    messagesApi.conversations().then((res) => setConversations(res.data || []));
  }, []);

  if (!conversations) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Stay connected with your clients and workers.</p>
      </div>

      {conversations.length ? (
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const participants = conversation.participants || [];
            const other = participants.find((participant) => getId(participant) !== currentUserId) || participants[0];
            const unreadCount = getUnreadCount(conversation, currentUserId);
            const sentByMe = getLastMessageSenderId(conversation) === currentUserId;
            const lastMessageText = getLastMessageText(conversation);

            return (
              <Link
                key={conversation._id}
                to={`/messages/${conversation._id}`}
                className={`card p-4 flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-md ${unreadCount > 0 ? 'border-brand-blue/30 bg-blue-50/40' : ''}`}
              >
                {other?.profileImage?.url ? (
                  <img src={other.profileImage.url} className="w-12 h-12 rounded-full object-cover shrink-0" alt={other.fullName || 'Conversation participant'} />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-bg text-brand-navy flex items-center justify-center font-bold text-lg shrink-0">
                    {other?.fullName?.[0]?.toUpperCase() || '?'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-brand-navy' : 'font-semibold text-brand-navy'}`}>
                      {other?.fullName || 'Conversation'}
                    </p>
                    {unreadCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-brand-blue shrink-0" aria-label="Unread message" />}
                  </div>
                  <p className={`text-sm truncate mt-1 ${unreadCount > 0 ? 'font-semibold text-gray-700' : 'text-gray-400'}`}>
                    {sentByMe && <span className="font-semibold text-brand-navy">You: </span>}
                    {lastMessageText}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[11px] ${unreadCount > 0 ? 'font-semibold text-brand-blue' : 'text-gray-400'}`}>
                    {timeAgo(conversation.lastMessageAt || getLastMessage(conversation)?.createdAt)}
                  </span>
                  {unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand-blue text-white text-[11px] font-bold flex items-center justify-center" aria-label={`${unreadCount} unread messages`}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No conversations yet." subtitle="Messages start once the client and worker begin working together." />
      )}
    </div>
  );
}
