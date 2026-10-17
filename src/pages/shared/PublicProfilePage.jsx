
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  BadgeCheck,
  Briefcase,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

import { workersApi } from '../../api/users.js';
import { gigsApi } from '../../api/gigs.js';
import { useAuth } from '../../context/AuthContext.jsx';

import Spinner from '../../components/ui/Spinner.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import GigCard from '../../components/gig/GigCard.jsx';
import HireWorkerModal from '../../components/gig/HireWorkerModal.jsx';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [gigs, setGigs] = useState([]);

  const [saved, setSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [hireOpen, setHireOpen] = useState(false);

  // Fetch the public profile by ID or username.
  useEffect(() => {
    let cancelled = false;

    setData(null);
    setError('');
    setGigs([]);
    setSaved(false);
    setSaveError('');
    setHireOpen(false);

    workersApi
      .get(id)
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Unable to load this profile.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const profileUser = data?.user;
  const workerProfile = data?.workerProfile;

  // Fetch published gigs belonging to this profile.
  useEffect(() => {
    let cancelled = false;

    if (!profileUser?._id) {
      setGigs([]);
      return;
    }

    gigsApi
      .search({
        worker: profileUser._id,
        limit: 12,
      })
      .then((res) => {
        if (!cancelled) {
          setGigs(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGigs([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profileUser?._id]);

  // Pre-fill the Save button so it reflects whether this worker is already saved.
  useEffect(() => {
    let cancelled = false;
    const viewerId = currentUser?._id;

    if (!profileUser?._id || !viewerId || String(profileUser._id) === String(viewerId)) {
      return undefined;
    }

    workersApi
      .saved({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setSaved(list.some((entry) => String(entry.worker?._id) === String(profileUser._id)));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [profileUser?._id, currentUser?._id]);

  // Loading and error states.
  if (error) {
    return <ErrorState message={error} />;
  }

  if (!data || !profileUser) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  // Compare the profile being viewed with the logged-in account.
  const isOwnProfile =
    currentUser?._id != null &&
    String(profileUser._id) === String(currentUser._id);

  // Only show worker actions when viewing another worker's profile.
  const canHire =
    !isOwnProfile &&
    Boolean(workerProfile) &&
    Boolean(currentUser);

  const toggleSave = async () => {
    if (!canHire || savingState) return;

    setSavingState(true);
    setSaveError('');

    try {
      if (saved) {
        await workersApi.unsave(profileUser._id);
        setSaved(false);
      } else {
        await workersApi.save(profileUser._id);
        setSaved(true);
      }
    } catch (err) {
      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to update your saved workers. Please try again.'
      );
    } finally {
      setSavingState(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Shown only to the owner: this page is exactly what clients see. */}
      {isOwnProfile && (
        <div className="card p-4 bg-blue-50 border-blue-100 flex items-center justify-between gap-3">
          <p className="text-sm text-blue-700">This is how clients see your public profile.</p>
          <Link to="/settings/worker-profile" className="text-sm font-semibold text-brand-blue whitespace-nowrap">
            Edit profile
          </Link>
        </div>
      )}

      {/* Profile overview */}
      <div className="card p-6 text-center">
        {profileUser.profileImage?.url ? (
          <img
            src={profileUser.profileImage.url}
            className="w-24 h-24 rounded-full object-cover mx-auto"
            alt={`${profileUser.fullName || 'User'}'s profile`}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold mx-auto">
            {profileUser.fullName?.[0] || '?'}
          </div>
        )}

        <h1 className="font-bold text-lg text-brand-navy mt-3 flex items-center justify-center gap-1.5">
          {profileUser.fullName}

          {profileUser.identityVerified && (
            <BadgeCheck
              size={18}
              className="text-brand-blue"
              aria-label="Identity verified"
            />
          )}
        </h1>

        {profileUser.username && (
          <p className="text-sm text-gray-400">
            @{profileUser.username}
          </p>
        )}

        {profileUser.location && (
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
            <MapPin size={12} />
            {profileUser.location}
          </p>
        )}

        {workerProfile?.headline && (
          <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto">
            {workerProfile.headline}
          </p>
        )}

        {profileUser.bio && (
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            {profileUser.bio}
          </p>
        )}

        {/* Ratings and activity */}
        <div className="flex justify-center gap-6 mt-5">
          <div>
            <p className="font-bold text-brand-navy flex items-center gap-1 justify-center">
              <Star size={14} className="text-yellow-500" />
              {profileUser.rating?.toFixed?.(1) || '—'}
            </p>
            <p className="text-xs text-gray-400">
              {profileUser.reviewCount || 0} reviews
            </p>
          </div>

          <div>
            <p className="font-bold text-brand-navy">
              {profileUser.completedTasksAsWorker || 0}
            </p>
            <p className="text-xs text-gray-400">Jobs done</p>
          </div>

          <div>
            <p className="font-bold text-brand-navy">
              {profileUser.completedTasksAsClient || 0}
            </p>
            <p className="text-xs text-gray-400">Tasks posted</p>
          </div>

          {workerProfile && (
            <div>
              <p className="font-bold text-brand-navy">
                {gigs.length}
              </p>
              <p className="text-xs text-gray-400">Active gigs</p>
            </div>
          )}
        </div>

        <Link
          to={`/reviews/${profileUser._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue mt-5"
        >
          <MessageCircle size={15} />
          View all reviews
        </Link>

        {/* Save and hire actions for other workers */}
        {canHire && (
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            <button
              type="button"
              onClick={toggleSave}
              disabled={savingState}
              className="btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {saved ? (
                <BookmarkCheck size={15} />
              ) : (
                <Bookmark size={15} />
              )}

              {savingState
                ? 'Saving...'
                : saved
                  ? 'Saved'
                  : 'Save'}
            </button>

            <button
              type="button"
              onClick={() => setHireOpen(true)}
              className="btn-primary text-sm"
            >
              Hire This Worker
            </button>
          </div>
        )}

        {saveError && (
          <p role="alert" className="text-sm text-red-500 mt-3">
            {saveError}
          </p>
        )}
      </div>

      {/* Skills */}
      {workerProfile?.skills?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-brand-navy mb-3 flex items-center gap-2">
            <Briefcase size={16} />
            Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {workerProfile.skills.map((skill) => (
              <span
                key={skill}
                className="chip bg-brand-bg text-brand-navy"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Published gigs */}
      {workerProfile && (
        <div>
          <h3 className="font-semibold text-brand-navy mb-3">
            Gigs by {profileUser.fullName?.split(' ')[0] || 'this worker'}
          </h3>

          {gigs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gigs.map((gig) => (
                <GigCard
                  key={gig._id}
                  gig={{ ...gig, worker: profileUser }}
                />
              ))}
            </div>
          ) : (
            <div className="card p-5 text-sm text-gray-500">
              This worker has no published gigs yet.
            </div>
          )}
        </div>
      )}

      {/* Portfolio */}
      {workerProfile?.portfolio?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-brand-navy mb-3">
            Portfolio
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {workerProfile.portfolio.map((item) => (
              <div
                key={item._id}
                className="rounded-xl overflow-hidden border border-gray-100"
              >
                {item.image?.url && (
                  <img
                    src={item.image.url}
                    alt={item.title || 'Portfolio project'}
                    loading="lazy"
                    className="w-full h-24 object-cover"
                  />
                )}

                <div className="p-2">
                  <p className="text-xs font-medium text-brand-navy truncate">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hiring modal */}
      {hireOpen && canHire && (
        <HireWorkerModal
          worker={profileUser}
          onClose={() => setHireOpen(false)}
        />
      )}
    </div>
  );
}
