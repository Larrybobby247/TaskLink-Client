import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Pencil, Trash2 } from 'lucide-react';
import { tasksApi, applicationsApi } from '../../api/tasks.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import { formatNaira } from '../../utils/money.js';
import { timeUntil } from '../../utils/time.js';

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    tasksApi.get(id)
      .then(async (res) => {
        if (!mounted) return;

        const loadedTask = res.data.task;
        setTask(loadedTask);

        // Some API responses already include the current user's application.
        const embeddedApplication =
          loadedTask.hasApplied ||
          loadedTask.appliedByCurrentUser ||
          loadedTask.userApplication ||
          loadedTask.myApplication;

        if (embeddedApplication) {
          const status = typeof embeddedApplication === 'object'
            ? embeddedApplication.status
            : undefined;
          if (!status || !['WITHDRAWN', 'REJECTED'].includes(status)) {
            setHasApplied(true);
            setApplySuccess(true);
            return;
          }
        }

        // Also check the worker's applications so the button remains disabled
        // after navigating away and coming back or refreshing the page.
        try {
          const applicationsResponse = await applicationsApi.mine({ task: id });
          const applications = applicationsResponse.data || [];
          const application = applications.find((item) => {
            const taskId = item.task?._id || item.task;
            return String(taskId) === String(id);
          });

          if (mounted && application && !['WITHDRAWN', 'REJECTED'].includes(application.status)) {
            setHasApplied(true);
            setApplySuccess(true);
          }
        } catch {
          // The task can still be viewed if checking application history fails.
        }
      })
      .catch((err) => mounted && setError(err.message));

    return () => { mounted = false; };
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!task) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  const isOwner = user && String(task.client._id || task.client) === String(user._id);
  // Gig orders / direct hires are managed from their order, not edited here.
  const isTaskPost = !task.source || task.source === 'TASK_POST';
  const canEdit = isOwner && isTaskPost && ['DRAFT', 'PAUSED', 'PUBLISHED', 'APPLICATIONS_OPEN'].includes(task.status);
  const canDelete = isOwner && isTaskPost && ['DRAFT', 'PAUSED', 'PUBLISHED', 'APPLICATIONS_OPEN', 'EXPIRED', 'CANCELLED'].includes(task.status);

  const submitApplication = async (e) => {
    e.preventDefault();
    if (hasApplied || applying) return;

    setApplying(true);
    setApplyError('');
    try {
      await tasksApi.apply(task._id, {
        message,
        proposedAmountKobo: task.budgetType === 'NEGOTIABLE' && proposedAmount ? Math.round(Number(proposedAmount) * 100) : undefined,
      });
      // Update immediately so a worker cannot submit the same application twice.
      setHasApplied(true);
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-brand-navy">{task.title}</h1>
            <span className="chip bg-brand-bg text-brand-navy mt-2">{task.category?.name}</span>
          </div>
          <StatusBadge status={task.status} />
        </div>

        <p className="text-2xl font-bold text-green-600 mt-4">{formatNaira(task.budgetKobo)}</p>
        <p className="text-xs text-gray-400">{task.budgetType === 'NEGOTIABLE' ? 'Negotiable' : 'Fixed price'}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
          <span className="flex items-center gap-1"><MapPin size={14} /> {task.isRemote ? 'Online' : task.location}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> Due in {timeUntil(task.deadline)}</span>
          <span className="flex items-center gap-1"><Users size={14} /> {task.applicationCount || 0} applications</span>
        </div>

        <h3 className="font-semibold text-brand-navy mt-5 mb-1">Description</h3>
        <p className="text-sm text-gray-600 whitespace-pre-line">{task.description}</p>

        {task.skillsRequired?.length > 0 && (
          <>
            <h3 className="font-semibold text-brand-navy mt-4 mb-2">Skills required</h3>
            <div className="flex flex-wrap gap-2">
              {task.skillsRequired.map((s) => <span key={s} className="chip bg-gray-100 text-gray-600">{s}</span>)}
            </div>
          </>
        )}

        <h3 className="font-semibold text-brand-navy mt-5 mb-2">Posted by</h3>
        <div className="flex items-center gap-3">
          {task.client?.profileImage?.url ? (
            <img src={task.client.profileImage.url} className="w-10 h-10 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold">{task.client?.fullName?.[0]}</div>
          )}
          <div>
            <p className="font-medium text-sm">{task.client?.fullName}</p>
            <p className="text-xs text-gray-400">⭐ {task.client?.rating?.toFixed?.(1) || '—'} · {task.client?.reviewCount || 0} reviews</p>
          </div>
        </div>
      </div>

      {isOwner ? (
        <div className="space-y-3">
          <button onClick={() => navigate(`/client/tasks/${task._id}/applications`)} className="btn-primary w-full">
            Manage Task ({task.applicationCount || 0} applications)
          </button>
          {(canEdit || canDelete) && (
            <div className="flex gap-3">
              {canEdit && (
                <button onClick={() => navigate(`/tasks/${task._id}/edit`)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
                  <Pencil size={15} /> Edit task
                </button>
              )}
              {canDelete && (
                <button onClick={() => setDeleteOpen(true)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 text-red-500 font-semibold py-3 hover:bg-red-50">
                  <Trash2 size={15} /> Delete
                </button>
              )}
            </div>
          )}
          {!canEdit && isTaskPost && ['WORKER_SELECTED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED'].includes(task.status) && (
            <p className="text-xs text-gray-400 text-center">A worker has been selected, so this task can no longer be edited.</p>
          )}
        </div>
      ) : hasApplied || applySuccess ? (
        <div className="card p-5 text-center bg-green-50 border-green-100">
          <p className="font-semibold text-green-700">Application sent!</p>
          <p className="text-sm text-green-600 mt-1">You'll be notified if the client selects you.</p>
        </div>
      ) : (
        <form onSubmit={submitApplication} className="card p-5 space-y-3">
          <h3 className="font-semibold text-brand-navy">Apply for this task</h3>
          {applyError && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{applyError}</div>}
          <textarea
            className="input-field min-h-[100px]"
            placeholder="Tell the client why you're a good fit..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
          />
          {task.budgetType === 'NEGOTIABLE' && (
            <input
              className="input-field"
              type="number"
              placeholder="Your proposed price (₦)"
              value={proposedAmount}
              onChange={(e) => setProposedAmount(e.target.value)}
            />
          )}
          <button className="btn-primary w-full" disabled={applying || hasApplied}>
            {applying ? 'Applying...' : 'Apply for Task'}
          </button>
        </form>
      )}

      {deleteOpen && (
        <ConfirmModal
          title="Delete this task?"
          description={(task.applicationCount || 0) > 0
            ? `${task.applicationCount} worker${task.applicationCount === 1 ? ' has' : 's have'} applied. The task will be closed and they will be notified. This can't be undone.`
            : "This will permanently remove the task. This can't be undone."}
          confirmLabel="Delete task"
          danger
          onConfirm={async () => {
            await tasksApi.remove(task._id);
            navigate('/client/tasks');
          }}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}
