import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, RefreshCw, CheckCircle2, XCircle, MessageCircle, ExternalLink } from 'lucide-react';
import { gigsApi } from '../../api/gigs.js';
import { messagesApi } from '../../api/users.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatNaira } from '../../utils/money.js';

const isHttpUrl = (value) => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };

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
    let cancelled = false;
    setGig(null);
    setError('');
    setActiveImage(0);
    setSelectedPackage(null);
    gigsApi.get(id)
      .then((res) => { if (!cancelled) setGig(res.data.gig); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Could not load this gig.'); });
    return () => { cancelled = true; };
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!gig) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const worker = gig.worker || {};
  const packages = gig.packages || [];
  const isOwner = Boolean(user?._id) && String(worker._id) === String(user._id);
  const chosenPackage = packages.find((p) => p.name === selectedPackage);
  const price = chosenPackage ? chosenPackage.priceKobo : gig.startingPriceKobo;
  const availability = gig.workerProfile?.availability ?? worker.availability;
  const workerUnavailable = availability === 'UNAVAILABLE';
  const images = gig.images?.length ? gig.images : gig.coverImage?.url ? [gig.coverImage] : [];
  const rating = typeof worker.rating === 'number' && worker.rating > 0 ? worker.rating.toFixed(1) : 'New';

  const placeOrder = async () => {
    setOrderError('');
    setOrdering(true);
    try {
      const { data } = await gigsApi.order(gig._id, { packageName: selectedPackage || undefined, requirements: requirements || undefined });
      navigate(`/client/orders/${data.order._id}`);
    } catch (err) {
      setOrderError(err?.errors?.[0]?.message || err?.message || 'Could not place your order.');
    } finally {
      setOrdering(false);
    }
  };

  const contactWorker = async () => {
    setOrderError('');
    setMessaging(true);
    try {
      const { data } = await messagesApi.startConversationForGig(gig._id);
      navigate(`/messages/${data.conversation._id}`);
    } catch (err) {
      setOrderError(err?.message || 'Could not start a conversation.');
    } finally {
      setMessaging(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {isOwner && gig.status !== 'PUBLISHED' && (
        <div className="card p-4 bg-blue-50 border-blue-100 flex items-center justify-between gap-3">
          <p className="text-sm text-blue-700">Preview: only you can see this gig until it's published.</p>
          <StatusBadge status={gig.status} />
        </div>
      )}

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
              <button key={img.publicId || img.url} type="button" onClick={() => setActiveImage(i)} aria-label={`Show image ${i + 1}`} className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 ${i === activeImage ? 'border-brand-navy' : 'border-transparent'}`}>
                <img src={img.url} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        {gig.category?.name && <span className="chip bg-brand-bg text-brand-navy">{gig.category.name}</span>}
        <h1 className="text-lg font-bold text-brand-navy mt-2">{gig.title}</h1>

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          {gig.deliveryDays ? <span className="flex items-center gap-1.5"><Clock size={14} /> {gig.deliveryDays} day{gig.deliveryDays === 1 ? '' : 's'} delivery</span> : null}
          {typeof gig.revisions === 'number' && <span className="flex items-center gap-1.5"><RefreshCw size={14} /> {gig.revisions} revision{gig.revisions === 1 ? '' : 's'}</span>}
        </div>

        {worker._id && (
          <div className="flex items-center justify-between gap-3 mt-4">
            <Link to={`/profile/${worker._id}`} className="flex items-center gap-3 min-w-0">
              {worker.profileImage?.url ? (
                <img src={worker.profileImage.url} className="w-10 h-10 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold">{worker.fullName?.[0]}</div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm text-brand-navy truncate">{worker.fullName}{worker.username && <span className="text-gray-400 font-normal"> @{worker.username}</span>}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Star size={11} className="text-yellow-500 fill-yellow-500" /> {rating}{worker.reviewCount ? ` (${worker.reviewCount})` : ''} · {worker.completedTasksAsWorker || 0} jobs done
                </p>
              </div>
            </Link>
            <Link to={`/profile/${worker._id}`} className="btn-secondary text-xs py-2 px-3 shrink-0">View Worker Profile</Link>
          </div>
        )}

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
            <p className="text-sm text-gray-600 whitespace-pre-line">{gig.requirementsFromClient}</p>
          </>
        )}

        {gig.portfolioUrl && isHttpUrl(gig.portfolioUrl) && (
          <a href={gig.portfolioUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue mt-5">
            <ExternalLink size={14} /> View portfolio
          </a>
        )}

        {worker._id && (
          <Link to={`/reviews/${worker._id}`} className="block text-sm font-medium text-brand-blue mt-4">See reviews for {worker.fullName?.split(' ')[0] || 'this worker'}</Link>
        )}
      </div>

      {isOwner ? (
        <Link to={`/worker/gigs/${gig._id}/edit`} className="btn-primary w-full text-center block">Edit This Gig</Link>
      ) : gig.status !== 'PUBLISHED' || workerUnavailable ? (
        <div className="card p-5 text-center bg-gray-50">
          <p className="text-sm text-gray-500">
            {workerUnavailable ? "This worker isn't taking new orders right now." : "This gig isn't currently accepting new orders."}
          </p>
          {worker._id && <Link to={`/profile/${worker._id}`} className="text-sm font-medium text-brand-blue mt-2 inline-block">View worker profile</Link>}
        </div>
      ) : (
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-brand-navy">Order this gig</h3>
          {orderError && <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{orderError}</div>}

          {packages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {packages.map((pkg) => (
                <button
                  key={pkg.name}
                  type="button"
                  aria-pressed={selectedPackage === pkg.name}
                  onClick={() => setSelectedPackage(pkg.name)}
                  className={`text-left rounded-xl border p-3 ${selectedPackage === pkg.name ? 'border-brand-navy bg-brand-bg' : 'border-gray-200'}`}
                >
                  <p className="text-[11px] font-bold text-brand-navy">{pkg.name}</p>
                  <p className="text-sm font-semibold mt-1">{formatNaira(pkg.priceKobo)}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1"><Clock size={10} /> {pkg.deliveryDays} day{pkg.deliveryDays === 1 ? '' : 's'}</p>
                  {typeof pkg.revisions === 'number' && <p className="text-[11px] text-gray-400 mt-0.5">{pkg.revisions} revision{pkg.revisions === 1 ? '' : 's'}</p>}
                </button>
              ))}
            </div>
          )}

          {chosenPackage && (chosenPackage.deliverables?.length > 0 || chosenPackage.excluded?.length > 0) && (
            <div className="rounded-xl bg-gray-50 p-3 space-y-3">
              {chosenPackage.deliverables?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-brand-navy mb-1.5">Included in {chosenPackage.name}</h4>
                  <ul className="space-y-1">
                    {chosenPackage.deliverables.map((item) => <li key={item} className="text-sm text-gray-600 flex items-start gap-1.5"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />{item}</li>)}
                  </ul>
                </div>
              )}
              {chosenPackage.excluded?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-brand-navy mb-1.5">Not included in {chosenPackage.name}</h4>
                  <ul className="space-y-1">
                    {chosenPackage.excluded.map((item) => <li key={item} className="text-sm text-gray-400 flex items-start gap-1.5"><XCircle size={14} className="text-gray-300 shrink-0 mt-0.5" />{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <textarea
            className="input-field min-h-[90px]"
            placeholder="Any extra details the worker should know before starting?"
            aria-label="Order requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-bold text-brand-navy">{formatNaira(price)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={contactWorker} disabled={messaging} className="btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-50">
                <MessageCircle size={15} /> {messaging ? 'Opening...' : 'Contact Worker'}
              </button>
              <button type="button" onClick={placeOrder} disabled={ordering || (packages.length > 0 && !selectedPackage)} className="btn-primary text-sm">
                {ordering ? 'Placing order...' : 'Order This Gig'}
              </button>
            </div>
          </div>
          {packages.length > 0 && !selectedPackage && <p className="text-xs text-gray-400">Choose a package to continue.</p>}
        </div>
      )}
    </div>
  );
}
