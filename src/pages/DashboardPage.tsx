import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  MousePointerClick,
  QrCode,
  Edit3,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ProfileCompletionBar } from "../components/profile/ProfileCompletionBar";
import { profileService } from "../services/firebase/profileService";

export const DashboardPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  // Verification request form state
  const [requestType, setRequestType] = useState<"PROFESSIONALLY_VERIFIED" | "EMAIL_VERIFIED" | "ADMIN_VERIFIED">("PROFESSIONALLY_VERIFIED");
  const [documentUrl, setDocumentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Sign In Required
        </h2>
        <p className="mt-2 text-xs text-zinc-500">
          Please sign in to access your profile dashboard.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block rounded-xl gold-btn px-5 py-2.5 text-xs font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const liveUrl = profile?.username
    ? `${window.location.origin}/profile/${profile.username}`
    : "";

  const handleCopy = () => {
    if (!liveUrl) return;
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = async () => {
    if (!profile) return;
    setUpdating(true);
    try {
      const nextStatus = profile.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      await profileService.saveProfile({
        ...profile,
        status: nextStatus,
      });
      await refreshProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleIndexing = async () => {
    if (!profile) return;
    setUpdating(true);
    try {
      await profileService.saveProfile({
        ...profile,
        allowSearchIndexing: !profile.allowSearchIndexing,
      });
      await refreshProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setRequestSubmitting(true);
    try {
      await profileService.submitVerificationRequest({
        profileId: profile.id,
        userId: user.id,
        username: profile.username,
        fullName: profile.fullName,
        requestType,
        documentUrl: documentUrl.trim() || undefined,
        notes: notes.trim(),
      });
      setRequestSuccess(true);
      setTimeout(() => {
        setVerifyModalOpen(false);
        setRequestSuccess(false);
        setNotes("");
        setDocumentUrl("");
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Profile{" "}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Manage your personal profile, visibility settings, and reach analytics.
          </p>
        </div>

        {profile && (
          <div className="flex items-center gap-2.5">
            <Link
              to="/dashboard/edit"
              id="dashboard-edit-profile-btn"
              className="inline-flex items-center gap-1.5 rounded-xl gold-btn px-4 py-2 text-xs font-bold shadow-md shadow-amber-500/20"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Link>

            <Link
              to={`/profile/${profile.username}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-xs hover:border-amber-500/40 hover:text-amber-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:text-amber-300"
            >
              <ExternalLink className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              View Live
            </Link>
          </div>
        )}
      </div>

      {!profile ? (
        <div className="mt-12 rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-md sm:p-12 dark:border-amber-500/30 dark:bg-zinc-900/90">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-500/30 dark:text-amber-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            You haven&apos;t set up your public profile yet
          </h2>
          <p className="mt-2 text-xs text-zinc-600 max-w-sm mx-auto dark:text-zinc-400">
            Build your verified web identity in under 3 minutes using our multi-step wizard.
          </p>
          <Link
            to="/dashboard/edit"
            className="mt-6 inline-flex items-center gap-2 rounded-xl gold-btn px-6 py-2.5 text-xs font-bold shadow-md shadow-amber-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Launch Profile Setup
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Completion Bar */}
          <ProfileCompletionBar
            profile={profile}
            onNavigateToStep={() => navigate("/dashboard/edit")}
          />

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Profile Views</span>
                <Eye className="h-4 w-4" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
                {profile.viewsCount || 0}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Total organic impressions</p>
            </div>

            <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Link Clicks</span>
                <MousePointerClick className="h-4 w-4" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
                {profile.linkClicksCount || 0}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Interactions on portfolio / socials</p>
            </div>

            <div className="rounded-3xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">QR Code Scans</span>
                <QrCode className="h-4 w-4" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-zinc-900 dark:text-white">
                {profile.qrScansCount || 0}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">Offline &amp; business card scans</p>
            </div>
          </div>

          {/* Profile Controls & Toggles */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Col: URL and Status */}
            <div className="space-y-6 lg:col-span-7">
              {/* Profile Link Card */}
              <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Your Public URL
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Share this verified link on your resume, LinkedIn bio, and email signature.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={liveUrl}
                    className="w-full rounded-xl border border-zinc-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-amber-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-amber-300"
                  />
                  <button
                    onClick={handleCopy}
                    className="rounded-xl gold-btn px-4 py-2.5 text-xs font-bold shadow-sm hover:scale-105"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Status & Indexing Toggles */}
              <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800 dark:border-zinc-800/80 dark:bg-zinc-900/90">
                {/* Publish Toggle */}
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                      Profile Publication Status
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {profile.status === "PUBLISHED"
                        ? "Currently live and accessible to the web"
                        : "Draft mode (only visible to you)"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleStatus}
                    disabled={updating}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      profile.status === "PUBLISHED"
                        ? "border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300"
                        : "border border-zinc-200 bg-slate-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {profile.status}
                  </button>
                </div>

                {/* Indexing Toggle */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                      Search Engine Indexing
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Allows Google, Bing &amp; crawlers to index this profile via sitemap.xml.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleIndexing}
                    disabled={updating}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      profile.allowSearchIndexing
                        ? "border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300"
                        : "border border-zinc-200 bg-slate-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {profile.allowSearchIndexing ? "INDEXING ENABLED" : "NOINDEX (HIDDEN)"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: Verification & Trust */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Verification Status
                  </h3>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400/80">
                    Current Level
                  </span>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {profile.verificationStatus.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Verified profiles receive higher credibility and distinct badges.
                  </p>
                </div>

                {profile.verificationStatus === "UNVERIFIED" && (
                  <button
                    onClick={() => setVerifyModalOpen(true)}
                    className="mt-4 w-full rounded-xl gold-btn py-2.5 text-xs font-bold shadow-md shadow-amber-500/20"
                  >
                    Request Verified Badge
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Request Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Request Profile Verification
              </h3>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-amber-600 dark:text-amber-400" />
                Your verification request has been submitted to the admin team for review.
              </div>
            ) : (
              <form onSubmit={handleVerificationSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 dark:text-amber-300">
                    Requested Tier
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-slate-50 p-2.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="PROFESSIONALLY_VERIFIED">Professionally Verified (Work / Project Proof)</option>
                    <option value="EMAIL_VERIFIED">Email Verified</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 dark:text-amber-300">
                    Portfolio / Verification Link (GitHub, LinkedIn, Official Page)
                  </label>
                  <input
                    type="url"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-slate-50 p-2.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 dark:text-amber-300">
                    Note for Reviewers (Required)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly state your current professional role or credential..."
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-slate-50 p-2.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVerifyModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestSubmitting || !notes.trim()}
                    className="rounded-xl gold-btn px-4 py-2 text-xs font-bold shadow-sm disabled:opacity-50"
                  >
                    {requestSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
