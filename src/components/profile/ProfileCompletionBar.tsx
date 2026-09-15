import React from "react";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Profile } from "../../types";

interface Props {
  profile: Profile | null;
  onNavigateToStep?: (step: number) => void;
}

export const ProfileCompletionBar: React.FC<Props> = ({ profile, onNavigateToStep }) => {
  if (!profile) return null;

  const items = [
    { label: "Profile photo", completed: Boolean(profile.avatarUrl), step: 0 },
    { label: "Headline & Bio", completed: Boolean(profile.headline && profile.bio), step: 0 },
    { label: "Profession & Location", completed: Boolean(profile.profession && profile.location), step: 1 },
    { label: "Education history", completed: Boolean(profile.education && profile.education.length > 0), step: 2 },
    { label: "Work experience", completed: Boolean(profile.experience && profile.experience.length > 0), step: 3 },
    { label: "Key skills", completed: Boolean(profile.skills && profile.skills.length >= 3), step: 4 },
    { label: "Portfolio project", completed: Boolean(profile.projects && profile.projects.length > 0), step: 5 },
    { label: "Social links", completed: Boolean(profile.socialLinks && Object.values(profile.socialLinks).some(Boolean)), step: 8 },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  const missingItems = items.filter((i) => !i.completed);

  return (
    <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/90">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Profile Strength
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Comprehensive profiles receive 4x more visibility and discoverability.
          </p>
        </div>
        <span className="font-mono text-lg font-extrabold text-amber-700 dark:text-amber-300">
          {percentage}%
        </span>
      </div>

      {/* Progress track */}
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <div
          className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 shadow-sm shadow-amber-500/30"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition ${
              item.completed
                ? "text-amber-800 border border-amber-200 bg-amber-50 font-medium dark:text-amber-300 dark:border-amber-500/30 dark:bg-amber-950/30"
                : "text-zinc-500 bg-slate-50 border border-zinc-200/80 dark:text-zinc-500 dark:bg-zinc-950/60 dark:border-zinc-800/50"
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600 shrink-0" />
            )}
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {missingItems.length > 0 && onNavigateToStep && (
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800/80">
          <span className="text-zinc-600 dark:text-zinc-400">
            Suggested next: <strong className="text-amber-800 dark:text-amber-300">{missingItems[0].label}</strong>
          </span>
          <button
            onClick={() => onNavigateToStep(missingItems[0].step)}
            className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
          >
            Complete Now
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};
