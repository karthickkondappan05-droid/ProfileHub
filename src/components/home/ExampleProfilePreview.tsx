import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, MapPin, ExternalLink, Briefcase } from "lucide-react";
import { SAMPLE_PROFILES } from "../../data/sampleProfiles";

export const ExampleProfilePreview: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const profile = SAMPLE_PROFILES[selectedIdx] || SAMPLE_PROFILES[0];

  return (
    <section className="border-t border-zinc-200/80 bg-slate-50/50 py-16 sm:py-24 transition-colors dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Real Examples
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Explore Realistic Member{" "}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
              Profiles
            </span>
          </p>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            Click across roles to see how developers, designers, and engineers present their identity.
          </p>
        </div>

        {/* Tab selection */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {SAMPLE_PROFILES.slice(0, 4).map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedIdx(idx)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedIdx === idx
                  ? "gold-btn shadow-md shadow-amber-500/20"
                  : "bg-white text-zinc-700 border border-zinc-200 hover:border-amber-500/50 hover:text-amber-800 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
              }`}
            >
              {p.fullName} ({p.profession})
            </button>
          ))}
        </div>

        {/* Profile Card Preview */}
        <div className="mt-8 mx-auto max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-amber-500/25 dark:bg-zinc-900">
          {/* Cover banner */}
          <div className="relative h-36 sm:h-48 w-full bg-slate-100 dark:bg-zinc-950">
            {profile.coverUrl && (
              <img
                src={profile.coverUrl}
                alt="Cover"
                className="h-full w-full object-cover opacity-90"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-zinc-900" />
          </div>

          <div className="relative px-6 pb-6 pt-0 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 gap-4">
              <div className="flex items-end gap-4">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-4 border-white object-cover shadow-lg ring-2 ring-amber-400/80 dark:border-zinc-900"
                />
                <div className="mb-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {profile.fullName}
                    </h3>
                    <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200/90">
                    {profile.headline}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <MapPin className="h-3 w-3 text-amber-600 dark:text-amber-400/80" />
                    {profile.location}
                  </p>
                </div>
              </div>

              <Link
                to={`/profile/${profile.username}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl gold-btn px-4 py-2 text-xs font-bold shadow-sm transition hover:scale-105"
              >
                View Live Profile
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              "{profile.bio}"
            </p>

            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400/80">
                Skills &amp; Competencies
              </h4>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {profile.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {profile.experience && profile.experience.length > 0 && (
              <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400/80">
                  <Briefcase className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  Recent Role
                </div>
                <div className="mt-2">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {profile.experience[0].jobTitle} ·{" "}
                    <span className="font-normal text-amber-800 dark:text-amber-200/80">
                      {profile.experience[0].company}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {profile.experience[0].description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
