import React from "react";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";

export const PrivacyShowcase: React.FC = () => {
  const privacyFields = [
    { field: "Full Name & Headline", status: "PUBLIC", desc: "Visible to public visitors & discoverable in search", safe: true },
    { field: "Skills & Badges", status: "PUBLIC", desc: "Showcases technical proficiencies and competencies", safe: true },
    { field: "Profession & Industry", status: "PUBLIC", desc: "Allows recruiters and peers to find your domain expertise", safe: true },
    { field: "Phone Number", status: "PRIVATE", desc: "Restricted strictly to you. Never returned to unauthenticated visitors", safe: false },
    { field: "Personal Email Address", status: "PRIVATE", desc: "Hidden by default to prevent spam scrapers", safe: false },
    { field: "Exact Home Address", status: "HIDDEN", desc: "Never stored as public coordinates; only general city/state shown", safe: false },
  ];

  return (
    <section id="privacy" className="border-t border-zinc-200/80 bg-slate-50/50 py-16 sm:py-24 transition-colors dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            Zero-Trust Privacy System
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Privacy Built at the{" "}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
              Data Layer
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Private fields are stripped server-side before reaching public visitors. If a field is set to private, the client browser never receives it.
          </p>
        </div>

        <div className="mt-12 mx-auto max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {privacyFields.map((item) => (
              <div
                key={item.field}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 text-sm sm:text-base dark:text-white">
                      {item.field}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.status === "PUBLIC"
                          ? "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                          : item.status === "PRIVATE"
                          ? "bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400"
                      }`}
                    >
                      {item.status === "PUBLIC" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      item.safe ? "text-amber-700 dark:text-amber-400" : "text-zinc-600 dark:text-amber-300/80"
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    {item.safe ? "Publicly Shared" : "Zero Visitor Exposure"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
