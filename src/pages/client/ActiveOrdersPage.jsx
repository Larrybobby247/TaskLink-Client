import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders.js';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import TaskListSkeleton from '../../components/task/TaskListSkeleton.jsx';
import { formatNaira } from '../../utils/money.js';

export default function ActiveOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    ordersApi.client().then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-navy">Active Orders</h1>
      {loading ? (
        <TaskListSkeleton />
      ) : orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order._id} to={`/client/orders/${order._id}`} className="card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-brand-navy truncate">{order.task?.title}</p>
                <p className="text-xs text-gray-400 mt-1">{order.worker?.fullName} · {formatNaira(order.agreedAmountKobo)}</p>
              </div>
              <StatusBadge status={order.status} />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No active orders." subtitle="Select a worker from your task applications to create an order." />
      )}
    </div>
  );
}
