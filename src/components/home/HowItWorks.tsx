import React from "react";
import { UserCheck, Sliders, Share2 } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      icon: UserCheck,
      title: "Step 1: Create your profile",
      description:
        "Claim your unique username (e.g. /profile/john-doe) and add your professional headline, education, career experience, skills, projects, and portfolio links.",
    },
    {
      num: "02",
      icon: Sliders,
      title: "Step 2: Choose what to share",
      description:
        "Select field-level visibility: PUBLIC, PRIVATE, or HIDDEN. Keep phone numbers and email confidential, or show only your age or birth year.",
    },
    {
      num: "03",
      icon: Share2,
      title: "Step 3: Publish and share",
      description:
        "Publish with one click. Share your unique link or downloadable QR code across social channels, resumes, emails, and professional networks.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Simple Workflow
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            How ProfileHub{" "}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
              Works
            </span>
          </p>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            From sign-up to a verified public URL in less than 3 minutes.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-white p-8 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-extrabold text-amber-600/30 dark:text-amber-500/40">
                      {step.num}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs dark:bg-zinc-800 dark:text-amber-400 dark:border-amber-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
