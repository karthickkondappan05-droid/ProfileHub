import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  Globe,
  Save,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/firebase/profileService";
import { PrivacyConfig } from "../types";

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [allowSearchIndexing, setAllowSearchIndexing] = useState(
    profile?.allowSearchIndexing ?? true
  );
  const [privacy, setPrivacy] = useState<PrivacyConfig>(
    profile?.privacy ?? {
      name: "PUBLIC",
      headline: "PUBLIC",
      bio: "PUBLIC",
      profession: "PUBLIC",
      industry: "PUBLIC",
      location: "PUBLIC",
      languages: "PUBLIC",
      education: "PUBLIC",
      experience: "PUBLIC",
      skills: "PUBLIC",
      projects: "PUBLIC",
      achievements: "PUBLIC",
      certifications: "PUBLIC",
      socialLinks: "PUBLIC",
      ageDisplay: "HIDE",
      phone: "PRIVATE",
      email: "PRIVATE",
      address: "HIDDEN",
    }
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const handleSavePrivacy = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      await profileService.saveProfile({
        ...profile,
        allowSearchIndexing,
        privacy,
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    if (!profile) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${profile.username || "profile"}_data_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeleteProfile = async () => {
    if (deleteInput !== profile?.username) return;
    if (!profile?.id || !user?.id) return;
    try {
      await profileService.deleteProfile(profile.id, user.id);
      await refreshProfile();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <Shield className="h-12 w-12 text-amber-600 dark:text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Sign In Required</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Please sign in to manage your account and privacy settings.</p>
        <Link to="/login" className="mt-4 rounded-xl gold-btn px-6 py-2 text-sm font-bold">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:border-amber-500/50 hover:text-amber-800 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-amber-300 shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white sm:text-3xl">
                Account &amp;{" "}
                <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Privacy Settings
                </span>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                Control your public visibility, search engine indexing, and data security.
              </p>
            </div>
          </div>

          <button
            onClick={handleSavePrivacy}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl gold-btn px-5 py-2.5 text-xs font-bold shadow-md shadow-amber-500/20 transition hover:scale-105 disabled:opacity-50"
          >
            {savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : savedSuccess ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Section 1: Search Engine Discovery */}
        <div className="mt-8 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-amber-500/20 dark:bg-zinc-900/80">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30">
                <Globe className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Search Indexing
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Public Search Engine Indexing</h2>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-sm">
                When enabled, your profile will be included in the dynamic XML sitemap and allow crawlers like Google and Bing to discover and index your public identity.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={allowSearchIndexing}
                onChange={(e) => setAllowSearchIndexing(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-600 peer-checked:after:translate-x-full peer-checked:after:bg-white peer-focus:outline-none dark:bg-zinc-800 dark:peer-checked:bg-amber-500 dark:after:bg-zinc-400 dark:peer-checked:after:bg-zinc-950" />
            </label>
          </div>
        </div>

        {/* Section 2: Field-Level Privacy Matrix */}
        <div className="mt-8 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Field-Level Visibility Matrix</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose who can view each section of your identity.</p>
            </div>
          </div>

          <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {/* Age display */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Age &amp; Birth Year</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose whether visitors see your exact age, birth year, or keep it hidden.</p>
              </div>
              <select
                value={privacy.ageDisplay}
                onChange={(e) =>
                  setPrivacy({
                    ...privacy,
                    ageDisplay: e.target.value as "EXACT" | "AGE_ONLY" | "YEAR_ONLY" | "HIDE",
                  })
                }
                className="rounded-xl border border-zinc-200 bg-slate-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              >
                <option value="HIDE">Hide completely</option>
                <option value="AGE_ONLY">Show age only (e.g. 25 years)</option>
                <option value="YEAR_ONLY">Show birth year only (e.g. Born 2000)</option>
                <option value="EXACT">Show both exact</option>
              </select>
            </div>

            {/* Phone Privacy */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Phone Number</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Prevent unsolicited phone scraping.</p>
              </div>
              <select
                value={privacy.phone}
                onChange={(e) =>
                  setPrivacy({
                    ...privacy,
                    phone: e.target.value as "PUBLIC" | "PRIVATE" | "HIDDEN",
                  })
                }
                className="rounded-xl border border-zinc-200 bg-slate-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              >
                <option value="PRIVATE">Private (Zero Public Exposure)</option>
                <option value="PUBLIC">Public (Visible to all)</option>
                <option value="HIDDEN">Hidden</option>
              </select>
            </div>

            {/* Email Privacy */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Direct Email</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Control if your raw email address is shown or kept private.</p>
              </div>
              <select
                value={privacy.email}
                onChange={(e) =>
                  setPrivacy({
                    ...privacy,
                    email: e.target.value as "PUBLIC" | "PRIVATE" | "HIDDEN",
                  })
                }
                className="rounded-xl border border-zinc-200 bg-slate-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              >
                <option value="PRIVATE">Private (Protected)</option>
                <option value="PUBLIC">Public</option>
                <option value="HIDDEN">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Data Export & Portability */}
        <div className="mt-8 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Data Portability &amp; Backup</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                Download a complete, machine-readable JSON archive of your entire profile, credentials, and verification records.
              </p>
            </div>
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:border-amber-500/60 hover:text-amber-800 transition dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:text-amber-300 shadow-xs"
            >
              <Download className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Download JSON Archive
            </button>
          </div>
        </div>

        {/* Section 4: Danger Zone */}
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-xs sm:p-8 dark:border-red-500/20 dark:bg-red-950/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-red-900 dark:text-red-300">Danger Zone</h2>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Permanently delete your ProfileHub presence. This will unpublish your public URL and remove your verification status.
              </p>

              {deleteConfirmOpen ? (
                <div className="mt-4 space-y-3 rounded-2xl border border-red-200 bg-white p-4 dark:border-red-500/30 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    To confirm deletion, please type your username <strong className="text-amber-700 font-mono dark:text-amber-400">{profile?.username}</strong> below:
                  </p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder={profile?.username}
                    className="w-full rounded-xl border border-zinc-200 bg-slate-50 px-3 py-2 text-xs text-zinc-900 focus:border-red-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDeleteProfile}
                      disabled={deleteInput !== profile?.username}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
                    >
                      Permanently Delete My Profile
                    </button>
                    <button
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="rounded-xl border border-zinc-200 px-4 py-2 text-xs text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-100/60 px-4 py-2 text-xs font-bold text-red-800 hover:bg-red-200 transition dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/40"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
