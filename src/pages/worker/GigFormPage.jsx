import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { X, Upload, Star } from 'lucide-react';
import { gigsApi } from '../../api/gigs.js';
import { categoriesApi } from '../../api/tasks.js';
import { nairaToKobo } from '../../utils/money.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';

const PACKAGE_NAMES = ['BASIC', 'STANDARD', 'PREMIUM'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Fallbacks only. The backend plan config (via /gigs/mine/limit) wins when it
// returns maxImages / maxImageSizeMB, and the backend always re-validates.
const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_IMAGE_MB = 5;

const EMPTY_FORM = {
  title: '', category: '', skills: '', description: '',
  price: '', deliveryDays: '', revisions: 1,
  included: '', excluded: '', requirementsFromClient: '', portfolioUrl: '',
};

const splitLines = (text) => (text || '').split('\n').map((s) => s.trim()).filter(Boolean);
// Packages keep their include/exclude lists as raw text while editing so that
// pressing Enter in the textarea works; they're split into arrays on save.
const packageToForm = (p) => ({
  ...p,
  deliverablesText: (p.deliverables || []).join('\n'),
  excludedText: (p.excluded || []).join('\n'),
});

const errMsg = (err) => err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.';
const isHttpUrl = (value) => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };

export default function GigFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]); // [{url, publicId}]
  const [coverPublicId, setCoverPublicId] = useState(null);
  const [usePackages, setUsePackages] = useState(false);
  const [packages, setPackages] = useState([]);
  const [status, setStatus] = useState('DRAFT');
  const [limitInfo, setLimitInfo] = useState(null);
  const [loadingGig, setLoadingGig] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Refs (not state) so a double tap / upload-then-save can never create two gigs.
  const gigIdRef = useRef(id || null);
  const createPromiseRef = useRef(null);

  const fail = (message) => {
    setError(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    categoriesApi.list()
      .then((res) => setCategories(res?.data?.categories || []))
      .catch(() => setError('Could not load categories. Please refresh the page.'));
    gigsApi.myLimit().then((res) => setLimitInfo(res?.data || null)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    setLoadingGig(true);
    gigsApi.get(id)
      .then((res) => {
        if (cancelled) return;
        const g = res.data.gig;
        setForm({
          title: g.title || '',
          category: g.category?._id || g.category || '',
          skills: (g.skills || []).join(', '),
          description: g.description || '',
          price: g.startingPriceKobo ? g.startingPriceKobo / 100 : '',
          deliveryDays: g.deliveryDays || '',
          revisions: g.revisions ?? 1,
          included: (g.included || []).join('\n'),
          excluded: (g.excluded || []).join('\n'),
          requirementsFromClient: g.requirementsFromClient || '',
          portfolioUrl: g.portfolioUrl || '',
        });
        setImages(g.images || []);
        setCoverPublicId(g.coverImage?.publicId || null);
        setUsePackages((g.packages || []).length > 0);
        setPackages((g.packages || []).map(packageToForm));
        setStatus(g.status || 'DRAFT');
      })
      .catch((err) => { if (!cancelled) setLoadError(errMsg(err)); })
      .finally(() => { if (!cancelled) setLoadingGig(false); });
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const maxImages = limitInfo?.maxImages ?? limitInfo?.maxImagesPerGig ?? DEFAULT_MAX_IMAGES;
  const maxImageMB = limitInfo?.maxImageSizeMB ?? DEFAULT_MAX_IMAGE_MB;
  const isPublished = status === 'PUBLISHED';
  const limitReached = Boolean(limitInfo) && limitInfo.remaining === 0 && !isPublished;

  const buildPayload = () => ({
    title: form.title.trim(),
    category: form.category,
    skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    description: form.description.trim(),
    startingPriceKobo: nairaToKobo(form.price || 0),
    deliveryDays: Number(form.deliveryDays) || 1,
    revisions: Number(form.revisions) || 0,
    included: form.included.split('\n').map((s) => s.trim()).filter(Boolean),
    excluded: form.excluded.split('\n').map((s) => s.trim()).filter(Boolean),
    requirementsFromClient: form.requirementsFromClient.trim() || undefined,
    portfolioUrl: form.portfolioUrl.trim() || undefined,
    packages: usePackages
      ? packages
          .filter((p) => p.name && p.priceKobo > 0)
          .map(({ deliverablesText, excludedText, ...p }) => ({
            ...p,
            deliverables: splitLines(deliverablesText),
            excluded: splitLines(excludedText),
          }))
      : [],
  });

  // Returns an error message, or '' when the form is OK.
  const validate = () => {
    if (form.title.trim().length < 5) return 'Give your gig a title (at least 5 characters).';
    if (!form.category) return 'Choose a category for your gig.';
    if (form.description.trim().length < 20) return 'Describe your service in at least 20 characters.';
    if (!(Number(form.price) > 0)) return 'Enter a price greater than ₦0.';
    if (!Number.isInteger(Number(form.deliveryDays)) || Number(form.deliveryDays) < 1) return 'Delivery time must be a whole number of days (at least 1).';
    if (!Number.isInteger(Number(form.revisions)) || Number(form.revisions) < 0) return 'Revisions must be a whole number (0 or more).';
    if (form.portfolioUrl.trim() && !isHttpUrl(form.portfolioUrl.trim())) return 'Portfolio link must start with http:// or https://';
    if (usePackages && !packages.some((p) => p.name && p.priceKobo > 0)) {
      return 'Set a price for at least one package, or turn packages off.';
    }
    return '';
  };

  // Creates the draft once. Everyone awaiting it shares the same request.
  const ensureGigExists = async () => {
    if (gigIdRef.current) return { gigId: gigIdRef.current, created: false };
    if (!createPromiseRef.current) {
      createPromiseRef.current = gigsApi.create(buildPayload())
        .then(({ data }) => { gigIdRef.current = data.gig._id; return data.gig._id; })
        .finally(() => { createPromiseRef.current = null; });
    }
    const newId = await createPromiseRef.current;
    return { gigId: newId, created: true };
  };

  const persist = async () => {
    const { gigId, created } = await ensureGigExists();
    if (!created) await gigsApi.update(gigId, buildPayload());
    return gigId;
  };

  const saveDraft = async () => {
    setError('');
    const problem = validate();
    if (problem) return fail(problem);
    setSaving(true);
    try {
      await persist();
      navigate('/worker/gigs');
    } catch (err) {
      fail(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setError('');
    const problem = validate();
    if (problem) return fail(problem);
    // The server requires a cover image to publish (the first image becomes the cover).
    if (!isPublished && images.length === 0) {
      return fail('Add at least one image before publishing. Your first image becomes the cover.');
    }
    setSaving(true);
    try {
      const gigId = await persist();
      if (!isPublished) await gigsApi.publish(gigId);
      navigate('/worker/gigs');
    } catch (err) {
      // e.g. the server-side plan limit was hit. The draft is still saved.
      fail(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setError('');

    if (images.length + files.length > maxImages) return fail(`You can add up to ${maxImages} images per gig.`);
    const badType = files.find((f) => !ALLOWED_IMAGE_TYPES.includes(f.type));
    if (badType) return fail(`"${badType.name}" isn't supported. Use JPG, PNG or WebP images.`);
    const tooBig = files.find((f) => f.size > maxImageMB * 1024 * 1024);
    if (tooBig) return fail(`"${tooBig.name}" is larger than ${maxImageMB}MB.`);

    // A gig must exist before images can be attached, so the basics are needed first.
    if (!gigIdRef.current) {
      const problem = validate();
      if (problem) return fail(`Fill in the basics before adding images. ${problem}`);
    }

    setUploading(true);
    try {
      const { gigId } = await ensureGigExists();
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const { data } = await gigsApi.uploadImages(gigId, formData);
      setImages(data.gig.images);
      setCoverPublicId(data.gig.coverImage?.publicId || null);
    } catch (err) {
      fail(errMsg(err));
    } finally {
      setUploading(false);
    }
  };

  const setCover = async (publicId) => {
    try {
      await gigsApi.setCoverImage(gigIdRef.current, publicId);
      setCoverPublicId(publicId);
    } catch (err) { fail(errMsg(err)); }
  };

  const removeImage = async (publicId) => {
    try {
      const { data } = await gigsApi.deleteImage(gigIdRef.current, publicId);
      setImages(data.gig.images);
      setCoverPublicId(data.gig.coverImage?.publicId || null);
    } catch (err) { fail(errMsg(err)); }
  };

  const updatePackage = (i, patch) => setPackages((pkgs) => pkgs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  if (loadingGig) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  if (loadError) return <ErrorState message={loadError} />;

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">{isEdit ? 'Edit Gig' : 'Create a Gig'}</h1>
      <p className="text-sm text-gray-400">List a service clients can order directly from you.</p>

      {error && <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      {limitReached && (
        <div className="card p-4 bg-orange-50 border-orange-100 text-sm text-orange-700">
          You've reached your plan's limit of {limitInfo.limit} published {limitInfo.limit === 1 ? 'gig' : 'gigs'}. You can still save this as a draft.{' '}
          <Link to="/settings/pro" className="font-semibold text-brand-blue">Upgrade to Pro</Link> to publish more.
        </div>
      )}

      <div className="card p-5 space-y-4">
        <div>
          <label htmlFor="gig-title" className="text-sm font-medium text-brand-navy">Gig title</label>
          <input id="gig-title" className="input-field mt-2" placeholder="e.g. I will design a professional flyer" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>

        <div>
          <span className="text-sm font-medium text-brand-navy">Category</span>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {categories.map((c) => (
              <button key={c._id} type="button" aria-pressed={form.category === c._id} onClick={() => set('category', c._id)} className={`text-xs rounded-xl py-2.5 px-1 border ${form.category === c._id ? 'border-brand-navy bg-brand-bg font-semibold text-brand-navy' : 'border-gray-200 text-gray-500'}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="gig-skills" className="text-sm font-medium text-brand-navy">Skills / tags (comma separated)</label>
          <input id="gig-skills" className="input-field mt-2" placeholder="e.g. logo design, flyer, canva" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
        </div>

        <div>
          <label htmlFor="gig-desc" className="text-sm font-medium text-brand-navy">Description</label>
          <textarea id="gig-desc" className="input-field mt-2 min-h-[120px]" placeholder="Describe exactly what you offer..." value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-brand-navy">Images</h3>
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.publicId} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100">
              <img src={img.url} className="w-full h-full object-cover" alt="" />
              <button type="button" aria-label="Remove image" onClick={() => removeImage(img.publicId)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"><X size={12} /></button>
              <button
                type="button"
                onClick={() => setCover(img.publicId)}
                className={`absolute bottom-1 left-1 right-1 text-[10px] font-semibold rounded-md py-1 ${coverPublicId === img.publicId ? 'bg-brand-navy text-white' : 'bg-white/90 text-brand-navy'}`}
              >
                {coverPublicId === img.publicId ? <span className="flex items-center justify-center gap-1"><Star size={10} /> Cover</span> : 'Set as cover'}
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer">
              <Upload size={18} />
              <span className="text-[10px] mt-1">{uploading ? 'Uploading...' : 'Add image'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} className="hidden" onChange={(e) => { uploadImages(e.target.files); e.target.value = ''; }} />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-400">Up to {maxImages} images (JPG, PNG or WebP, max {maxImageMB}MB each). Fill in the title, category, description, price and delivery first. The first upload becomes your cover.</p>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-brand-navy">Pricing & delivery</h3>
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Use Basic / Standard / Premium packages</span>
          <input
            type="checkbox"
            checked={usePackages}
            onChange={(e) => {
              setUsePackages(e.target.checked);
              if (e.target.checked && packages.length === 0) {
                setPackages(PACKAGE_NAMES.map((name) => ({ name, priceKobo: 0, deliveryDays: 1, revisions: 1, deliverablesText: '', excludedText: '' })));
              }
            }}
            className="h-4 w-4"
          />
        </label>

        {usePackages && (
          <div className="space-y-3">
            {packages.map((pkg, i) => (
              <div key={pkg.name} className="border border-gray-100 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-brand-navy">{pkg.name}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor={`pkg-${i}-price`} className="block text-[11px] font-medium text-gray-500 mb-1">Price (₦)</label>
                    <input id={`pkg-${i}-price`} className="input-field text-xs" type="number" min="0" inputMode="numeric" placeholder="e.g. 5000" value={pkg.priceKobo ? pkg.priceKobo / 100 : ''} onChange={(e) => updatePackage(i, { priceKobo: nairaToKobo(e.target.value || 0) })} />
                  </div>
                  <div>
                    <label htmlFor={`pkg-${i}-days`} className="block text-[11px] font-medium text-gray-500 mb-1">Delivery time (days)</label>
                    <input id={`pkg-${i}-days`} className="input-field text-xs" type="number" min="1" inputMode="numeric" placeholder="e.g. 3" value={pkg.deliveryDays} onChange={(e) => updatePackage(i, { deliveryDays: Number(e.target.value) || 1 })} />
                  </div>
                  <div>
                    <label htmlFor={`pkg-${i}-rev`} className="block text-[11px] font-medium text-gray-500 mb-1">Free revisions</label>
                    <input id={`pkg-${i}-rev`} className="input-field text-xs" type="number" min="0" inputMode="numeric" placeholder="e.g. 2" value={pkg.revisions} onChange={(e) => updatePackage(i, { revisions: Number(e.target.value) || 0 })} />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">
                  Delivery time = days you need to deliver the first version. Free revisions = how many times the client can ask you to change the work at no extra cost.
                </p>
                <div>
                  <label htmlFor={`pkg-${i}-inc`} className="block text-[11px] font-medium text-gray-500 mb-1">What's included in {pkg.name} (one per line)</label>
                  <textarea id={`pkg-${i}-inc`} className="input-field text-xs min-h-[70px]" placeholder={'e.g. 1 logo concept\nSource file'} value={pkg.deliverablesText || ''} onChange={(e) => updatePackage(i, { deliverablesText: e.target.value })} />
                </div>
                <div>
                  <label htmlFor={`pkg-${i}-exc`} className="block text-[11px] font-medium text-gray-500 mb-1">What's NOT included in {pkg.name} (one per line)</label>
                  <textarea id={`pkg-${i}-exc`} className="input-field text-xs min-h-[70px]" placeholder={'e.g. Commercial license\nPrinting'} value={pkg.excludedText || ''} onChange={(e) => updatePackage(i, { excludedText: e.target.value })} />
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400">The "starting price" shown on your gig card comes from the base price/delivery fields below. The general "What's included / excluded" lists further down apply to every package.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="gig-price" className="text-sm font-medium text-brand-navy">{usePackages ? 'Starting price (₦)' : 'Price (₦)'}</label>
            <input id="gig-price" className="input-field mt-2" type="number" min="0" inputMode="numeric" value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div>
            <label htmlFor="gig-days" className="text-sm font-medium text-brand-navy">Delivery time (days)</label>
            <input id="gig-days" className="input-field mt-2" type="number" min="1" inputMode="numeric" value={form.deliveryDays} onChange={(e) => set('deliveryDays', e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Days you need to deliver the work.</p>
          </div>
        </div>
        <div>
          <label htmlFor="gig-revisions" className="text-sm font-medium text-brand-navy">Free revisions included</label>
          <input id="gig-revisions" className="input-field mt-2" type="number" min="0" inputMode="numeric" value={form.revisions} onChange={(e) => set('revisions', e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">How many times the client can ask you to change the work at no extra cost.</p>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-brand-navy">Deliverables</h3>
        <div>
          <label htmlFor="gig-included" className="text-sm font-medium text-brand-navy">What's included (one per line)</label>
          <textarea id="gig-included" className="input-field mt-2 min-h-[80px]" value={form.included} onChange={(e) => set('included', e.target.value)} />
        </div>
        <div>
          <label htmlFor="gig-excluded" className="text-sm font-medium text-brand-navy">What's excluded (one per line)</label>
          <textarea id="gig-excluded" className="input-field mt-2 min-h-[80px]" value={form.excluded} onChange={(e) => set('excluded', e.target.value)} />
        </div>
        <div>
          <label htmlFor="gig-reqs" className="text-sm font-medium text-brand-navy">What you need from the client</label>
          <textarea id="gig-reqs" className="input-field mt-2" placeholder="e.g. logo files, brand colors, reference images" value={form.requirementsFromClient} onChange={(e) => set('requirementsFromClient', e.target.value)} />
        </div>
        <div>
          <label htmlFor="gig-portfolio" className="text-sm font-medium text-brand-navy">Portfolio link (optional)</label>
          <input id="gig-portfolio" className="input-field mt-2" placeholder="https://..." value={form.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3">
        {!isPublished && (
          <button type="button" onClick={saveDraft} disabled={saving || uploading} className="btn-secondary flex-1 disabled:opacity-50">Save Draft</button>
        )}
        <button type="button" onClick={publish} disabled={saving || uploading || limitReached} className="btn-primary flex-1">
          {saving ? 'Saving...' : isPublished ? 'Save Changes' : 'Publish Gig'}
        </button>
      </div>
    </div>
  );
}
