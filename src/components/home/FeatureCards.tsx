import React from "react";
import {
  Globe,
  Search,
  Lock,
  Share2,
  FileCode2,
  QrCode,
} from "lucide-react";

export const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: Globe,
      title: "Public Profile",
      description:
        "Your dedicated web identity at profilehub.app/profile/your-name showcasing your professional narrative, verified credentials, and portfolio.",
    },
    {
      icon: Search,
      title: "Searchable Identity",
      description:
        "Make your expertise discoverable across recruiters, peers, and collaborators with structured skills, roles, and location indexing.",
    },
    {
      icon: Lock,
      title: "Privacy Controls",
      description:
        "Granular field-level visibility controls. Keep your personal contact info, phone, and home address strictly private or hidden.",
    },
    {
      icon: Share2,
      title: "Social Links",
      description:
        "Unify all your professional accounts — GitHub, LinkedIn, Twitter, Behance, and custom portfolios in one authentic verified hub.",
    },
    {
      icon: FileCode2,
      title: "SEO & Schema Optimized",
      description:
        "Automatically generates canonical URLs, OpenGraph social previews, and schema.org Person & ProfilePage JSON-LD structured data.",
    },
    {
      icon: QrCode,
      title: "Instant QR Sharing",
      description:
        "Generate and download crisp high-resolution QR codes to embed on resumes, business cards, conference badges, and presentation slides.",
    },
  ];

  return (
    <section className="border-t border-zinc-200/80 bg-slate-50/50 py-16 sm:py-24 transition-colors dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Platform Capabilities
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            Everything you need for your{" "}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
              web presence
            </span>
          </p>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            Built for modern professionals who want an authentic, clean, and voluntary digital footprint.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-3xl border border-zinc-200/90 bg-white p-7 shadow-sm transition-all hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/5 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 transition-all group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-amber-700 group-hover:text-white group-hover:shadow-md group-hover:shadow-amber-500/20 dark:bg-zinc-800 dark:text-amber-400 dark:border-amber-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-zinc-900 group-hover:text-amber-800 transition-colors dark:text-white dark:group-hover:text-amber-300">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
