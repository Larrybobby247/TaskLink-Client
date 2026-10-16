import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { formatNaira } from '../../utils/money.js';

export default function GigCard({ gig }) {
  return (
    <Link to={`/gigs/${gig._id}`} className="card overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {gig.coverImage?.url ? (
          <img src={gig.coverImage.url} alt={gig.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🗂️</div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5">
          {gig.worker?.profileImage?.url ? (
            <img src={gig.worker.profileImage.url} className="w-5 h-5 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-semibold">{gig.worker?.fullName?.[0]}</div>
          )}
          <span className="text-xs text-gray-500 truncate">{gig.worker?.username ? `@${gig.worker.username}` : gig.worker?.fullName}</span>
        </div>

        <p className="text-sm font-semibold text-brand-navy line-clamp-2 flex-1">{gig.title}</p>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            {gig.worker?.rating?.toFixed?.(1) || 'New'}
            {gig.worker?.reviewCount ? ` (${gig.worker.reviewCount})` : ''}
          </span>
          <span className="flex items-center gap-1"><Clock size={12} /> {gig.deliveryDays}d</span>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Starting at</span>
          <span className="font-bold text-brand-navy text-sm">{formatNaira(gig.startingPriceKobo)}</span>
        </div>
      </div>
    </Link>
  );
}
