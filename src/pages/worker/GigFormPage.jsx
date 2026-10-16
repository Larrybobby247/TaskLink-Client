import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload, Star } from 'lucide-react';
import { gigsApi } from '../../api/gigs.js';
import { categoriesApi } from '../../api/tasks.js';
import { nairaToKobo, formatNaira } from '../../utils/money.js';

const PACKAGE_NAMES = ['BASIC', 'STANDARD', 'PREMIUM'];

export default function GigFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', category: '', skills: '', description: '',
    startingPriceKobo: '', deliveryDays: '', revisions: 1,
    included: '', excluded: '', requirementsFromClient: '', portfolioUrl: '',
  });
  const [images, setImages] = useState([]); // [{url, publicId}]
  const [coverPublicId, setCoverPublicId] = useState(null);
  const [usePackages, setUsePackages] = useState(false);
  const [packages, setPackages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [gigId, setGigId] = useState(id || null);

  useEffect(() => { categoriesApi.list().then((res) => setCategories(res.data.categories)); }, []);

  useEffect(() => {
    if (!isEdit) return;
    gigsApi.get(id).then((res) => {
      const g = res.data.gig;
      setForm({
        title: g.title, category: g.category._id, skills: (g.skills || []).join(', '), description: g.description,
        startingPriceKobo: g.startingPriceKobo / 100, deliveryDays: g.deliveryDays, revisions: g.revisions,
        included: (g.included || []).join('\n'), excluded: (g.excluded || []).join('\n'),
        requirementsFromClient: g.requirementsFromClient || '', portfolioUrl: g.portfolioUrl || '',
      });
      setImages(g.images || []);
      setCoverPublicId(g.coverImage?.publicId || null);
      setUsePackages((g.packages || []).length > 0);
      setPackages(g.packages || []);
    });
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const buildPayload = () => ({
    title: form.title,
    category: form.category,
    skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    description: form.description,
    startingPriceKobo: nairaToKobo(form.startingPriceKobo || 0),
    deliveryDays: Number(form.deliveryDays) || 1,
    revisions: Number(form.revisions) || 0,
    included: form.included.split('\n').map((s) => s.trim()).filter(Boolean),
    excluded: form.excluded.split('\n').map((s) => s.trim()).filter(Boolean),
    requirementsFromClient: form.requirementsFromClient || undefined,
    portfolioUrl: form.portfolioUrl || undefined,
    packages: usePackages ? packages.filter((p) => p.name && p.priceKobo) : [],
  });

  const ensureGigExists = async () => {
    if (gigId) return gigId;
    const { data } = await gigsApi.create(buildPayload());
    setGigId(data.gig._id);
    return data.gig._id;
  };

  const saveDraft = async () => {
    setError('');
    setSaving(true);
    try {
      const currentId = await ensureGigExists();
      if (gigId) await gigsApi.update(currentId, buildPayload());
      navigate('/worker/gigs');
    } catch (err) {
      setError(err.errors?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setError('');
    setSaving(true);
    try {
      const currentId = await ensureGigExists();
      await gigsApi.update(currentId, buildPayload());
      await gigsApi.publish(currentId);
      navigate('/worker/gigs');
    } catch (err) {
      setError(err.errors?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async (files) => {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    try {
      const currentId = await ensureGigExists();
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('images', f));
      const { data } = await gigsApi.uploadImages(currentId, formData);
      setImages(data.gig.images);
      setCoverPublicId(data.gig.coverImage?.publicId || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const setCover = async (publicId) => {
    await gigsApi.setCoverImage(gigId, publicId);
    setCoverPublicId(publicId);
  };

  const removeImage = async (publicId) => {
    const { data } = await gigsApi.deleteImage(gigId, publicId);
    setImages(data.gig.images);
    setCoverPublicId(data.gig.coverImage?.publicId || null);
  };

  const updatePackage = (i, patch) => setPackages((pkgs) => pkgs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">{isEdit ? 'Edit Gig' : 'Create a Gig'}</h1>
      <p className="text-sm text-gray-400">List a service clients can order directly from you.</p>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      <div className="card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-brand-navy">Gig title</label>
          <input className="input-field mt-2" placeholder="e.g. I will design a professional flyer" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-brand-navy">Category</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {categories.map((c) => (
              <button key={c._id} type="button" onClick={() => set('category', c._id)} className={`text-xs rounded-xl py-2.5 px-1 border ${form.category === c._id ? 'border-brand-navy bg-brand-bg font-semibold text-brand-navy' : 'border-gray-200 text-gray-500'}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-brand-navy">Skills / tags (comma separated)</label>
          <input className="input-field mt-2" placeholder="e.g. logo design, flyer, canva" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-brand-navy">Description</label>
          <textarea className="input-field mt-2 min-h-[120px]" placeholder="Describe exactly what you offer..." value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-brand-navy">Images</h3>
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.publicId} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
              <img src={img.url} className="w-full h-full object-cover" alt="" />
              <button type="button" onClick={() => removeImage(img.publicId)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"><X size={12} /></button>
              <button
                type="button"
                onClick={() => setCover(img.publicId)}
                className={`absolute bottom-1 left-1 right-1 text-[10px] font-semibold rounded-md py-1 ${coverPublicId === img.publicId ? 'bg-brand-navy text-white' : 'bg-white/90 text-brand-navy'}`}
              >
                {coverPublicId === img.publicId ? <span className="flex items-center justify-center gap-1"><Star size={10} /> Cover</span> : 'Set as cover'}
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer">
              <Upload size={18} />
              <span className="text-[10px] mt-1">{uploading ? 'Uploading...' : 'Add image'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} className="hidden" onChange={(e) => uploadImages(e.target.files)} />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-400">Up to 5 images. First upload becomes your cover automatically.</p>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-brand-navy">Pricing & delivery</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Use Basic / Standard / Premium packages</span>
          <input
            type="checkbox"
            checked={usePackages}
            onChange={(e) => {
              setUsePackages(e.target.checked);
              if (e.target.checked && packages.length === 0) {
                setPackages(PACKAGE_NAMES.map((name) => ({ name, priceKobo: 0, deliveryDays: 1, revisions: 1, deliverables: [] })));
              }
            }}
            className="h-4 w-4"
          />
        </div>

        {usePackages ? (
          <div className="space-y-3">
            {packages.map((pkg, i) => (
              <div key={pkg.name} className="border border-gray-100 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-brand-navy">{pkg.name}</p>
                <div className="grid grid-cols-3 gap-2">
                  <input className="input-field text-xs" type="number" placeholder="Price (₦)" value={pkg.priceKobo ? pkg.priceKobo / 100 : ''} onChange={(e) => updatePackage(i, { priceKobo: nairaToKobo(e.target.value || 0) })} />
                  <input className="input-field text-xs" type="number" placeholder="Days" value={pkg.deliveryDays} onChange={(e) => updatePackage(i, { deliveryDays: Number(e.target.value) || 1 })} />
                  <input className="input-field text-xs" type="number" placeholder="Revisions" value={pkg.revisions} onChange={(e) => updatePackage(i, { revisions: Number(e.target.value) || 0 })} />
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400">The "starting price" shown on your gig card below still comes from the base price/delivery fields.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-brand-navy">{usePackages ? 'Starting price (₦)' : 'Price (₦)'}</label>
            <input className="input-field mt-2" type="number" value={form.startingPriceKobo} onChange={(e) => set('startingPriceKobo', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-navy">Delivery (days)</label>
            <input className="input-field mt-2" type="number" value={form.deliveryDays} onChange={(e) => set('deliveryDays', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-navy">Revisions included</label>
          <input className="input-field mt-2" type="number" value={form.revisions} onChange={(e) => set('revisions', e.target.value)} />
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-brand-navy">Deliverables</h3>
        <div>
          <label className="text-sm font-medium text-brand-navy">What's included (one per line)</label>
          <textarea className="input-field mt-2 min-h-[80px]" value={form.included} onChange={(e) => set('included', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-navy">What's excluded (one per line)</label>
          <textarea className="input-field mt-2 min-h-[80px]" value={form.excluded} onChange={(e) => set('excluded', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-navy">What you need from the client</label>
          <textarea className="input-field mt-2" placeholder="e.g. logo files, brand colors, reference images" value={form.requirementsFromClient} onChange={(e) => set('requirementsFromClient', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-navy">Portfolio link (optional)</label>
          <input className="input-field mt-2" placeholder="https://..." value={form.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={saveDraft} disabled={saving} className="btn-secondary flex-1">Save Draft</button>
        <button onClick={publish} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Publish Gig'}</button>
      </div>
    </div>
  );
}
