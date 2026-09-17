import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Profile, ProfileStatus, ReportItem, VerificationRequestItem } from "../types";
import { profileService } from "../services/firebase/profileService";

export const AdminPortalPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"profiles" | "reports" | "verifications">("profiles");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allProfiles, allReports, allVerifications] = await Promise.all([
        profileService.searchProfiles({ query: searchQuery }),
        profileService.getPendingReports(),
        profileService.getPendingVerificationRequests(),
      ]);
      setProfiles(allProfiles);
      setReports(allReports);
      setVerifications(allVerifications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, searchQuery]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
          Admin Access Restricted
        </h2>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          This portal is restricted to authorized platform administrators (configured for <code className="text-amber-800 font-mono dark:text-amber-300">karthickkondappan05@gmail.com</code>).
        </p>
        <Link
          to="/"
          className="mt-6 inline-block gold-btn"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const handleUpdateVerification = async (profileId: string, status: Profile["verificationStatus"]) => {
    try {
      await profileService.updateProfileStatus(profileId, { verificationStatus: status });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (profileId: string, status: ProfileStatus) => {
    try {
      await profileService.updateProfileStatus(profileId, { status });
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveReport = async (reportId: string, actionTaken: string) => {
    try {
      await profileService.resolveReport(reportId, actionTaken);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewVerification = async (
    requestId: string,
    status: "APPROVED" | "REJECTED",
    profileId: string,
    tier?: Profile["verificationStatus"]
  ) => {
    try {
      await profileService.reviewVerificationRequest(requestId, status, user?.id || "admin");
      if (status === "APPROVED" && tier) {
        await profileService.updateProfileStatus(profileId, { verificationStatus: tier });
      }
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const verifiedCount = profiles.filter((p) => p.verificationStatus !== "UNVERIFIED").length;
  const publishedCount = profiles.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            Super Admin Portal
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Trust, Safety &amp; Moderation
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Logged in as <strong className="font-mono text-amber-800 dark:text-amber-300">{user?.email}</strong>
          </p>
        </div>

        <button
          onClick={fetchData}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-amber-500/50 hover:text-amber-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:text-amber-300 shadow-xs"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Total Profiles</p>
          <p className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
            {profiles.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Live Published</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-700 dark:text-amber-300">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Verified Badges</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-yellow-400">
            {verifiedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">Pending Flags</p>
          <p className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400">
            {reports.length}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-zinc-200/80 pb-3 dark:border-zinc-800/80">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "profiles"
              ? "gold-btn shadow-md shadow-amber-500/20"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          All Profiles ({profiles.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "reports"
              ? "gold-btn shadow-md shadow-amber-500/20"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Reported Items ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("verifications")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "verifications"
              ? "gold-btn shadow-md shadow-amber-500/20"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Verification Requests ({verifications.length})
        </button>
      </div>

      {/* Profiles Tab */}
      {activeTab === "profiles" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name or username..."
              className="max-w-xs rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-xs dark:divide-zinc-800">
              <thead className="bg-slate-50 font-semibold text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Badge Tier</th>
                  <th className="px-4 py-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                          alt={p.fullName}
                          className="h-8 w-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                        />
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{p.fullName}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{p.profession}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-600 dark:text-zinc-400">
                      <Link
                        to={`/profile/${p.username}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-amber-700 hover:underline dark:text-amber-300"
                      >
                        /{p.username}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          p.status === "PUBLISHED"
                            ? "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/30"
                            : p.status === "SUSPENDED"
                            ? "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-500/30"
                            : "bg-slate-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={p.verificationStatus}
                        onChange={(e) =>
                          handleUpdateVerification(p.id, e.target.value as any)
                        }
                        className="rounded-lg border border-zinc-200 bg-slate-50 p-1 text-[11px] font-medium text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                      >
                        <option value="UNVERIFIED">UNVERIFIED</option>
                        <option value="EMAIL_VERIFIED">EMAIL VERIFIED</option>
                        <option value="PROFESSIONALLY_VERIFIED">PROFESSIONALLY VERIFIED</option>
                        <option value="ADMIN_VERIFIED">ADMIN VERIFIED (Official)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {p.status !== "SUSPENDED" ? (
                        <button
                          onClick={() => handleUpdateStatus(p.id, "SUSPENDED")}
                          className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-900/50"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(p.id, "PUBLISHED")}
                          className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                        >
                          Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="mt-6 space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-xs text-zinc-400 dark:border-zinc-800">
              No pending reports. All flags resolved!
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50/60 p-5 dark:border-red-500/30 dark:bg-red-950/20"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-900/60 dark:border-red-500/40 dark:text-red-200">
                        {report.category}
                      </span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Reported profile: <strong className="font-mono text-amber-800 dark:text-amber-300">/{report.reportedUsername}</strong>
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-800 dark:text-zinc-300">
                      &ldquo;{report.reason}&rdquo;
                    </p>
                    {report.reporterEmail && (
                      <p className="mt-1 text-[11px] text-zinc-500">
                        Reporter: {report.reporterEmail}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/profile/${report.reportedUsername}`}
                      target="_blank"
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Inspect Profile
                    </Link>
                    <button
                      onClick={() => handleResolveReport(report.id, "DISMISSED")}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(report.profileId, "SUSPENDED");
                        handleResolveReport(report.id, "PROFILE_SUSPENDED");
                      }}
                      className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Take Down Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verifications Tab */}
      {activeTab === "verifications" && (
        <div className="mt-6 space-y-4">
          {verifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-xs text-zinc-400 dark:border-zinc-800">
              No pending verification requests.
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/90"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {req.fullName}
                      </span>
                      <span className="font-mono text-xs text-amber-700 dark:text-amber-400">/{req.username}</span>
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300">
                        {req.requestedType}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Notes: {req.notes}
                    </p>
                    {req.proofLinks && (
                      <a
                        href={req.proofLinks}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline dark:text-amber-300"
                      >
                        Proof Document / Link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        handleReviewVerification(req.id, "REJECTED", req.profileId)
                      }
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() =>
                        handleReviewVerification(
                          req.id,
                          "APPROVED",
                          req.profileId,
                          req.requestedType === "IDENTITY"
                            ? "EMAIL_VERIFIED"
                            : "PROFESSIONALLY_VERIFIED"
                        )
                      }
                      className="rounded-xl gold-btn px-3 py-1.5 text-xs font-bold shadow-xs"
                    >
                      Approve &amp; Grant Badge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
