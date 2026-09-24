import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { messagesApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatMessageTime } from '../../utils/time.js';

const getId = (value) => String(value?._id || value?.id || value || '');

export default function ConversationPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const currentUserId = getId(user);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [messagesRes, conversationsRes] = await Promise.all([
        messagesApi.messages(conversationId),
        messagesApi.conversations(),
      ]);
      setMessages(messagesRes.data || []);
      setConversation(
        (conversationsRes.data || []).find((item) => item._id === conversationId) || null
      );
    } catch (err) {
      setError(err?.message || 'Unable to load this conversation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    load();
    messagesApi.markRead(conversationId).catch(() => {});
  }, [conversationId]); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const nextText = text.trim();
    if (!nextText || sending) return;

    setSending(true);
    setError('');
    try {
      await messagesApi.send(conversationId, { text: nextText });
      setText('');
      await load();
    } catch (err) {
      setError(err?.message || 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const participants = conversation?.participants || [];
  const other =
    participants.find((participant) => getId(participant) !== currentUserId) ||
    participants[0];

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[78vh] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <Link
          to="/messages"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
          aria-label="Back to messages"
        >
          <ArrowLeft size={19} />
        </Link>
        {other?.profileImage?.url ? (
          <img
            src={other.profileImage.url}
            className="w-10 h-10 rounded-full object-cover"
            alt={other.fullName || 'Conversation participant'}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand-bg text-brand-navy flex items-center justify-center font-bold">
            {other?.fullName?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-brand-navy truncate">
            {other?.fullName || 'Conversation'}
          </p>
          <p className="text-xs text-gray-400">Conversation</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50/70">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">Loading messages...</p>
        ) : error && !messages.length ? (
          <p className="text-center text-sm text-red-500 py-8">{error}</p>
        ) : messages.length ? (
          messages.map((message) => {
            const isMine = getId(message.sender) === currentUserId;
            return (
              <div
                key={message._id}
                className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (
                  other?.profileImage?.url ? (
                    <img src={other.profileImage.url} className="w-7 h-7 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-brand-bg text-brand-navy flex items-center justify-center text-xs font-bold">
                      {other?.fullName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )
                )}
                <div className={`max-w-[78%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine ? 'bg-brand-navy text-white rounded-br-md' : 'bg-white text-gray-700 rounded-bl-md'}`}>
                    {message.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {formatMessageTime(message.createdAt || message.sentAt || message.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet. Start the conversation.</p>
        )}
        <div ref={bottomRef} />
      </div>

      {error && messages.length > 0 && <p className="px-4 py-2 text-sm text-red-500 bg-red-50">{error}</p>}
      <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white">
        <input
          className="input-field flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="btn-primary p-3" disabled={sending || !text.trim()} aria-label="Send message">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
