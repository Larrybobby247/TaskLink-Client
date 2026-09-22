import React, { useEffect, useState } from 'react';
import { notificationsApi } from '../../api/users.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { timeAgo } from '../../utils/time.js';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const load = () => notificationsApi.list().then((res) => setItems(res.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  const markOne = async (id) => {
    await notificationsApi.markRead(id);
    setItems((its) => its.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-navy">Notifications</h1>
        <button onClick={markAll} className="text-sm text-brand-blue font-medium">Mark all as read</button>
      </div>

      {loading ? (
        <TaskListSkeleton />
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((n) => (
            <button key={n._id} onClick={() => markOne(n._id)} className={`card p-4 w-full text-left flex items-start gap-3 ${n.isRead ? 'opacity-60' : ''}`}>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" />}
              <div>
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-[11px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="No notifications yet." />
      )}
    </div>
  );
}
