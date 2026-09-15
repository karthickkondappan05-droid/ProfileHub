import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Sparkles, ArrowLeft, AlertCircle, Edit3 } from "lucide-react";
import { Profile } from "../types";
import { profileService } from "../services/firebase/profileService";
import { getPublicProfile } from "../utils/privacy";
import { updateSeoMeta, injectJsonLd, generatePersonSchema, generateProfilePageSchema } from "../utils/seo";
import { useAuth } from "../context/AuthContext";
import { PublicProfileView } from "../components/profile/PublicProfileView";

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwner = Boolean(user && profile && user.id === profile.userId);

  useEffect(() => {
    if (!username) return;

    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const found = await profileService.getProfileByUsername(username);
        if (!mounted) return;
        if (found) {
          setProfile(found);

          // Setup SEO tags and Schema structured data
          const seoTitle = `${found.fullName || found.username} — ${found.headline || found.profession || "Profile"} | ProfileHub`;
          const seoDesc = found.bio || `${found.fullName}'s verified public profile on ProfileHub.`;
          const currentUrl = `${window.location.origin}/profile/${found.username}`;

          updateSeoMeta({
            title: seoTitle,
            description: seoDesc,
            image: found.avatarUrl,
            url: currentUrl,
            type: "profile",
          });

          // Inject structured data
          injectJsonLd([
            generatePersonSchema(found, currentUrl),
            generateProfilePageSchema(found, currentUrl),
          ]);

          // Increment view metric (non-blocking)
          profileService.incrementMetric(found.id, "viewsCount").catch(() => {});
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-100 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-amber-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">
          Profile Not Found
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          No active public profile is claimed under <strong className="text-amber-800 dark:text-amber-300">/profile/{username}</strong>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/explore"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white shadow-xs"
          >
            Explore Directory
          </Link>
          <Link
            to="/register"
            className="rounded-xl gold-btn px-4 py-2 text-xs font-bold"
          >
            Claim This Username
          </Link>
        </div>
      </div>
    );
  }

  // Sanitize data: if viewer is NOT the owner, strip private data
  const displayedProfile = getPublicProfile(profile, isOwner);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top back navigation & Owner edit button */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-amber-800 dark:text-zinc-400 dark:hover:text-amber-300 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Directory
        </Link>

        {isOwner && (
          <Link
            to="/dashboard/edit"
            className="inline-flex items-center gap-1.5 rounded-xl gold-btn px-3.5 py-1.5 text-xs font-bold shadow-md shadow-amber-500/20"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </Link>
        )}
      </div>

      <PublicProfileView profile={displayedProfile} isPreview={false} />
    </div>
  );
};
