import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { messagesApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ConversationPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const load = () => messagesApi.messages(conversationId).then((res) => setMessages(res.data));
  useEffect(() => { load(); }, [conversationId]); // eslint-disable-line
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setText('');
    await messagesApi.send(conversationId, { text });
    load();
  };

  return (
    <div className="flex flex-col h-[75vh]">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {messages.map((m) => (
          <div key={m._id} className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.sender === user._id ? 'bg-brand-navy text-white ml-auto' : 'bg-white'}`}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-100 pt-3">
        <input className="input-field flex-1" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-primary p-3"><Send size={18} /></button>
      </form>
    </div>
  );
}
