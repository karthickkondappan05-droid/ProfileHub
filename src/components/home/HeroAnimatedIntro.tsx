import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  User,
  PlusCircle,
  FileCheck,
  Globe,
  Search,
  Users,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const HeroAnimatedIntro: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  // Cycling sequence: 0 = Person, 1 = Create, 2 = Public Profile Card, 3 = Unique URL, 4 = Search, 5 = Discover / Live
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 6);
    }, 3800);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const flowSteps = [
    { label: "Person", icon: User },
    { label: "Create Profile", icon: PlusCircle },
    { label: "Public Profile", icon: FileCheck },
    { label: "Unique URL", icon: Globe },
    { label: "Search", icon: Search },
    { label: "Discover You", icon: Users },
  ];

  return (
    <div className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24">
      {/* Ambient background soft gold glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-amber-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Tag */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white/95 px-4 py-1.5 text-xs font-semibold text-amber-800 shadow-sm backdrop-blur dark:border-amber-500/30 dark:bg-zinc-900/90 dark:text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-zinc-800 dark:text-zinc-100">Privacy-First Digital Identity</span>
            <span className="text-amber-500">✦</span>
            <span className="text-amber-700 font-bold dark:text-amber-400">Voluntary &amp; Verified</span>
          </div>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="mx-auto mt-6 max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
            Your Identity. Your Profile.{" "}
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent underline decoration-amber-400/40 decoration-wavy decoration-1 underline-offset-8">
              Your Presence on the Web.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600 sm:text-xl dark:text-zinc-300">
            Create a professional public profile, share your story, and make your digital identity easier to discover — while maintaining total control over what is public and private.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/register"
              id="hero-create-btn"
              className="inline-flex items-center gap-2 rounded-xl gold-btn px-6 py-3.5 text-sm font-bold shadow-md shadow-amber-500/20 transition hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4 fill-white/20" />
              Create Your Profile
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/explore"
              id="hero-explore-btn"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300/90 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-xs transition hover:border-amber-500/60 hover:text-amber-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <Search className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Explore Profiles
            </Link>
          </div>
        </div>

        {/* Visual Workflow Tracker */}
        <div className="mt-12 mx-auto max-w-4xl">
          <div className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {flowSteps.map((s, idx) => {
                const Icon = s.icon;
                const isActive = step === idx;
                return (
                  <button
                    key={s.label}
                    onClick={() => setStep(idx)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-all text-xs font-semibold ${
                      isActive
                        ? "bg-amber-50 text-amber-800 shadow-xs ring-1 ring-amber-300 dark:bg-zinc-800 dark:text-amber-300 dark:ring-amber-500/40"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-xs font-bold"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Animated Interactive Stage */}
        <div className="mt-8 mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl backdrop-blur sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/90">
            {/* Header bar showing simulated flow */}
            <div className="mb-6 flex flex-wrap items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-red-400/80" />
                <span className="flex h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="flex h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 font-mono text-xs text-zinc-600 dark:text-amber-400/80">
                  profilehub.app/profile/john-doe
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <span>Verified White Premium Profile</span>
              </div>
            </div>

            {/* Animation Scenes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column: Simulated Profile Card */}
              <div className="md:col-span-7">
                <motion.div
                  key={`profile-card-${step}`}
                  initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-zinc-200/90 bg-slate-50/70 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                      alt="John Doe"
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-amber-400/70 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                          John Doe
                        </h3>
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200/90">
                        Senior Software Developer
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <MapPin className="h-3 w-3 text-amber-600" />
                        <span>Chennai, India</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills badges */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {["Java", "React", "AWS", "Spring Boot", "TypeScript"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social links row */}
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-amber-700 dark:text-amber-400">LinkedIn</span>
                      <span className="hover:text-zinc-800 dark:hover:text-zinc-200">GitHub</span>
                      <span className="hover:text-zinc-800 dark:hover:text-zinc-200">Website</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      ✓ Official Profile
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Search & Live URL Experience */}
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/90">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400/80">
                    Search Discovery
                  </p>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-800 dark:border-amber-500/30 dark:bg-zinc-900 dark:text-zinc-100">
                    <Search className="h-3.5 w-3.5 text-amber-600" />
                    <span>John Doe</span>
                  </div>

                  <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">John Doe</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Software Developer</p>
                      </div>
                      <Link
                        to="/profile/john-doe"
                        className="inline-flex items-center gap-1 font-semibold text-xs text-amber-700 hover:text-amber-800 hover:underline dark:text-amber-400"
                      >
                        View Profile
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    <span>Your profile is live on web.</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-amber-700 dark:text-amber-400/90">
                    profilehub.app/profile/john-doe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
