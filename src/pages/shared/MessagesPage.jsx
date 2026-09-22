import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messagesApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { timeAgo } from '../../utils/time.js';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(null);

  useEffect(() => {
    messagesApi.conversations().then((res) => setConversations(res.data));
  }, []);

  if (!conversations) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-navy">Messages</h1>
      {conversations.length ? (
        <div className="space-y-2">
          {conversations.map((c) => {
            const other = c.participants.find((p) => p._id !== user._id) || c.participants[0];
            return (
              <Link key={c._id} to={`/messages/${c._id}`} className="card p-4 flex items-center gap-3">
                {other?.profileImage?.url ? (
                  <img src={other.profileImage.url} className="w-11 h-11 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-semibold">{other?.fullName?.[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{other?.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{c.lastMessage || 'No messages yet'}</p>
                </div>
                <span className="text-[11px] text-gray-300">{timeAgo(c.lastMessageAt)}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No conversations yet." subtitle="Messages start once you apply to or accept a task." />
      )}
    </div>
  );
}
