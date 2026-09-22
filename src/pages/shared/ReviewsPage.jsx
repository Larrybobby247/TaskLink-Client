import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function ReviewsPage() {
  const { userId } = useParams();
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    api.get(`/reviews/user/${userId}`).then((res) => setReviews(res.data.data));
  }, [userId]);

  if (!reviews) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-navy">Reviews</h1>
      {reviews.length ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{r.reviewer?.fullName}</p>
                <p className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No reviews yet." />
      )}
    </div>
  );
}
