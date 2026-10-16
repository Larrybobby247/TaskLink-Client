import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { gigsApi } from '../../api/gigs.js';
import { messagesApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { formatNaira } from '../../utils/money.js';

export default function GigDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [requirements, setRequirements] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    gigsApi.get(id).then((res) => setGig(res.data.gig)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!gig) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const isOwner = String(gig.worker._id) === String(user._id);
  const price = selectedPackage ? gig.packages.find((p) => p.name === selectedPackage)?.priceKobo : gig.startingPriceKobo;

  const placeOrder = async () => {
    setOrderError('');
    setOrdering(true);
    try {
      const { data } = await gigsApi.order(gig._id, { packageName: selectedPackage || undefined, requirements: requirements || undefined });
      navigate(`/client/orders/${data.order._id}`);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setOrdering(false);
    }
  };

  const contactWorker = async () => {
    setMessaging(true);
    try {
      const { data } = await messagesApi.startConversationForGig(gig._id);
      navigate(`/messages/${data.conversation._id}`);
    } finally {
      setMessaging(false);
    }
  };

  const images = gig.images?.length ? gig.images : gig.coverImage?.url ? [gig.coverImage] : [];

  return (
    <div className="space-y-5 pb-10">
      <div className="card overflow-hidden">
        <div className="aspect-video bg-gray-100">
          {images[activeImage]?.url ? (
            <img src={images[activeImage].url} alt={gig.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🗂️</div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {images.map((img, i) => (
              <button key={img.publicId} onClick={() => setActiveImage(i)} className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 ${i === activeImage ? 'border-brand-navy' : 'border-transparent'}`}>
                <img src={img.url} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <span className="chip bg-brand-bg text-brand-navy">{gig.category?.name}</span>
        <h1 className="text-lg font-bold text-brand-navy mt-2">{gig.title}</h1>

        <Link to={`/profile/${gig.worker._id}`} className="flex items-center gap-3 mt-4">
          {gig.worker.profileImage?.url ? (
            <img src={gig.worker.profileImage.url} className="w-10 h-10 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold">{gig.worker.fullName?.[0]}</div>
          )}
          <div>
            <p className="font-medium text-sm text-brand-navy">{gig.worker.fullName}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Star size={11} className="text-yellow-500 fill-yellow-500" /> {gig.worker.rating?.toFixed?.(1) || 'New'} ({gig.worker.reviewCount || 0}) · {gig.worker.completedTasksAsWorker || 0} jobs done
            </p>
          </div>
        </Link>

        <h3 className="font-semibold text-brand-navy mt-5 mb-1">Description</h3>
        <p className="text-sm text-gray-600 whitespace-pre-line">{gig.description}</p>

        {gig.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {gig.skills.map((s) => <span key={s} className="chip bg-gray-100 text-gray-600">{s}</span>)}
          </div>
        )}

        {(gig.included?.length > 0 || gig.excluded?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            {gig.included?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-brand-navy mb-2">What's included</h4>
                <ul className="space-y-1.5">
                  {gig.included.map((item) => <li key={item} className="text-sm text-gray-600 flex items-start gap-1.5"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />{item}</li>)}
                </ul>
              </div>
            )}
            {gig.excluded?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-brand-navy mb-2">Not included</h4>
                <ul className="space-y-1.5">
                  {gig.excluded.map((item) => <li key={item} className="text-sm text-gray-400 flex items-start gap-1.5"><XCircle size={14} className="text-gray-300 shrink-0 mt-0.5" />{item}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {gig.requirementsFromClient && (
          <>
            <h4 className="text-sm font-semibold text-brand-navy mt-5 mb-1">What I'll need from you</h4>
            <p className="text-sm text-gray-600">{gig.requirementsFromClient}</p>
          </>
        )}
      </div>

      {isOwner ? (
        <Link to={`/worker/gigs/${gig._id}/edit`} className="btn-primary w-full text-center block">Edit This Gig</Link>
      ) : gig.status !== 'PUBLISHED' ? (
        <div className="card p-5 text-center bg-gray-50">
          <p className="text-sm text-gray-500">This gig isn't currently accepting new orders.</p>
        </div>
      ) : (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-brand-navy">Order this gig</h3>
          {orderError && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{orderError}</div>}

          {gig.packages?.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {gig.packages.map((pkg) => (
                <button
                  key={pkg.name}
                  onClick={() => setSelectedPackage(pkg.name)}
                  className={`text-left rounded-xl border p-3 ${selectedPackage === pkg.name ? 'border-brand-navy bg-brand-bg' : 'border-gray-200'}`}
                >
                  <p className="text-[11px] font-bold text-brand-navy">{pkg.name}</p>
                  <p className="text-sm font-semibold mt-1">{formatNaira(pkg.priceKobo)}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1"><Clock size={10} /> {pkg.deliveryDays}d</p>
                </button>
              ))}
            </div>
          )}

          <textarea
            className="input-field min-h-[90px]"
            placeholder="Any extra details the worker should know before starting?"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-bold text-brand-navy">{formatNaira(price)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={contactWorker} disabled={messaging} className="btn-secondary text-sm flex items-center gap-1.5">
                <MessageCircle size={15} /> Contact
              </button>
              <button onClick={placeOrder} disabled={ordering || (gig.packages?.length > 0 && !selectedPackage)} className="btn-primary text-sm">
                {ordering ? 'Placing order...' : 'Order This Gig'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
