import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { categoriesApi, tasksApi } from '../../api/tasks.js';
import { nairaToKobo } from '../../utils/money.js';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';

// <input type="datetime-local"> wants local time without a timezone suffix.
const toLocalInput = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const EDITABLE_STATUSES = ['DRAFT', 'PAUSED', 'PUBLISHED', 'APPLICATIONS_OPEN'];

export default function PostTaskPage() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);
  const [searchParams] = useSearchParams();
  const [loadingTask, setLoadingTask] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [taskStatus, setTaskStatus] = useState('DRAFT');
  const [priceLocked, setPriceLocked] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', category: searchParams.get('category') || '', description: '', budgetType: 'FIXED', budget: '', location: '',
    isRemote: true, deadline: '', additionalInstructions: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { categoriesApi.list().then((res) => setCategories(res.data.categories)); }, []);

  // Edit mode: load the existing task into the form.
  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    tasksApi.get(editId)
      .then((res) => {
        if (cancelled) return;
        const t = res.data.task;
        if (!EDITABLE_STATUSES.includes(t.status)) {
          setLoadError('This task can no longer be edited because a worker has already been selected.');
          return;
        }
        setTaskStatus(t.status);
        setPriceLocked((t.applicationCount || 0) > 0);
        setForm({
          title: t.title || '',
          category: t.category?._id || t.category || '',
          description: t.description || '',
          budgetType: t.budgetType || 'FIXED',
          budget: t.budgetKobo ? t.budgetKobo / 100 : '',
          location: t.location || '',
          isRemote: t.isRemote !== false,
          deadline: toLocalInput(t.deadline),
          additionalInstructions: t.additionalInstructions || '',
        });
      })
      .catch((err) => !cancelled && setLoadError(err.message))
      .finally(() => !cancelled && setLoadingTask(false));
    return () => { cancelled = true; };
  }, [editId, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (publish) => {
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        const payload = {
          title: form.title,
          category: form.category,
          description: form.description,
          isRemote: form.isRemote,
          location: form.isRemote ? undefined : form.location,
          deadline: new Date(form.deadline).toISOString(),
          additionalInstructions: form.additionalInstructions || '',
        };
        // The budget is locked once workers have applied.
        if (!priceLocked) {
          payload.budgetType = form.budgetType;
          payload.budgetKobo = nairaToKobo(form.budget || 0);
        }
        await tasksApi.update(editId, payload);
        if (publish && ['DRAFT', 'PAUSED'].includes(taskStatus)) await tasksApi.publish(editId);
        navigate(`/tasks/${editId}`);
        return;
      }

      const { data } = await tasksApi.create({
        title: form.title,
        category: form.category,
        description: form.description,
        budgetType: form.budgetType,
        budgetKobo: nairaToKobo(form.budget || 0),
        location: form.location,
        isRemote: form.isRemote,
        deadline: new Date(form.deadline).toISOString(),
        additionalInstructions: form.additionalInstructions || undefined,
      });
      if (publish) await tasksApi.publish(data.task._id);
      navigate(`/tasks/${data.task._id}`);
    } catch (err) {
      setError(err.errors?.[0]?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingTask) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;
  if (loadError) return <ErrorState message={loadError} />;

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">{isEdit ? 'Edit Task' : 'Post a Task'}</h1>
      <p className="text-sm text-gray-400">
        {isEdit
          ? 'Update the details of your task. Changes show to workers straight away.'
          : 'Tell us what you need done. The right people around you will see it and apply.'}
      </p>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      <div className="card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-brand-navy">Select Category</label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {categories.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => set('category', c._id)}
                className={`text-xs rounded-xl py-3 px-1 border ${form.category === c._id ? 'border-brand-navy bg-brand-bg font-semibold text-brand-navy' : 'border-gray-200 text-gray-500'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-brand-navy">Task Details</label>
          <input className="input-field mt-2" placeholder="What do you need done?" value={form.title} onChange={(e) => set('title', e.target.value)} />
          <textarea className="input-field mt-2 min-h-[100px]" placeholder="Be specific (e.g. design a flyer, type 10 pages, etc.)" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-brand-navy">Budget (₦)</label>
            <input className="input-field mt-2 disabled:opacity-60" type="number" placeholder="0" value={form.budget} disabled={priceLocked} onChange={(e) => set('budget', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-brand-navy">Deadline</label>
            <input className="input-field mt-2" type="datetime-local" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-brand-navy">Budget type</label>
          <div className="flex gap-2 mt-2">
            {['FIXED', 'NEGOTIABLE'].map((t) => (
              <button key={t} type="button" disabled={priceLocked} onClick={() => set('budgetType', t)} className={`chip ${form.budgetType === t ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>
                {t === 'FIXED' ? 'Fixed price' : 'Negotiable'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-brand-navy">Location</label>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => set('isRemote', true)} className={`chip ${form.isRemote ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>Remote / Online</button>
            <button type="button" onClick={() => set('isRemote', false)} className={`chip ${!form.isRemote ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'}`}>On-site</button>
          </div>
          {!form.isRemote && (
            <input className="input-field mt-2" placeholder="Enter location" value={form.location} onChange={(e) => set('location', e.target.value)} />
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-brand-navy">Additional Details (Optional)</label>
          <textarea className="input-field mt-2" maxLength={500} placeholder="Add more details (requirements, file type, preferences, etc.)" value={form.additionalInstructions} onChange={(e) => set('additionalInstructions', e.target.value)} />
        </div>
      </div>

      {priceLocked && <p className="text-xs text-orange-600">The budget can't be changed because workers have already applied.</p>}

      <div className="flex gap-3">
        {!isEdit || ['DRAFT', 'PAUSED'].includes(taskStatus) ? (
          <>
            <button onClick={() => submit(false)} disabled={loading} className="btn-secondary flex-1">{isEdit ? 'Save Changes' : 'Save Draft'}</button>
            <button onClick={() => submit(true)} disabled={loading} className="btn-primary flex-1">{isEdit ? 'Save & Publish' : 'Publish Task'}</button>
          </>
        ) : (
          <button onClick={() => submit(false)} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Changes'}</button>
        )}
      </div>
    </div>
  );
}
