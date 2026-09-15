import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ShieldCheck, CheckCircle, ExternalLink, Sparkles, Filter } from "lucide-react";
import { Profile } from "../types";
import { profileService } from "../services/firebase/profileService";
import { updateSeoMeta } from "../utils/seo";

export const ExplorePage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Developer", "Designer", "Engineer", "Cloud", "Student", "Data"];

  useEffect(() => {
    updateSeoMeta({
      title: "Explore Public Profiles — ProfileHub Directory",
      description: "Discover verified developers, engineers, designers, and students on ProfileHub.",
      url: `${window.location.origin}/explore`,
    });
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const results = await profileService.searchProfiles({
          query: query.trim(),
          profession: activeCategory === "All" ? undefined : activeCategory,
        });
        setProfiles(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchProfiles, 300);
    return () => clearTimeout(debounce);
  }, [query, activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          Public Directory
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
          Explore Verified{" "}
          <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
            Member Profiles
          </span>
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Browse authentic personal profiles voluntarily shared by engineers, designers, and domain leaders.
        </p>
      </div>

      {/* Search Bar & Category Chips */}
      <div className="mt-8 space-y-4">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
          <input
            type="text"
            id="explore-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, skill (e.g. React, Java, AWS), role, or location..."
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 mr-1 flex items-center gap-1 dark:text-zinc-400">
            <Filter className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                activeCategory === cat
                  ? "gold-btn shadow-md shadow-amber-500/20"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-amber-500/40 hover:text-amber-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="mt-8 flex items-center justify-between border-b border-zinc-200/80 pb-3 dark:border-zinc-800/80">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Showing <strong className="text-amber-700 dark:text-amber-300">{profiles.length}</strong> public {profiles.length === 1 ? "profile" : "profiles"}
        </p>
      </div>

      {/* Profile Cards Grid */}
      {loading ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
            />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-zinc-300 p-12 text-center bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            No matching profiles found
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Try adjusting your search query or removing the category filter.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <Link
              key={p.id}
              to={`/profile/${p.username}`}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm transition-all hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/5 hover:-translate-y-0.5 dark:border-zinc-800/80 dark:bg-zinc-900/90"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={p.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={p.fullName}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-amber-400/60 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold text-zinc-900 group-hover:text-amber-800 transition-colors truncate dark:text-white dark:group-hover:text-amber-300">
                        {p.fullName}
                      </h2>
                      {p.verificationStatus === "ADMIN_VERIFIED" && (
                        <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                      {p.verificationStatus === "PROFESSIONALLY_VERIFIED" && (
                        <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-300 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200/80 truncate">
                      {p.headline || p.profession}
                    </p>
                    {p.location && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        <MapPin className="h-3 w-3 text-amber-600 dark:text-amber-400/70 shrink-0" />
                        {p.location}
                      </p>
                    )}
                  </div>
                </div>

                {p.bio && (
                  <p className="mt-4 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {p.bio}
                  </p>
                )}

                {p.skills && p.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {p.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300"
                      >
                        {s}
                      </span>
                    ))}
                    {p.skills.length > 4 && (
                      <span className="rounded-lg bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:border-transparent dark:text-zinc-400">
                        +{p.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs font-semibold text-zinc-900 dark:border-zinc-800/80 dark:text-white">
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  /profile/{p.username}
                </span>
                <span className="inline-flex items-center gap-1 text-amber-700 group-hover:text-amber-800 dark:text-amber-400 dark:group-hover:text-amber-300">
                  View Profile
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
