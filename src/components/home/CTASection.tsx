import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield } from "lucide-react";

export const CTASection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-amber-200/90 bg-gradient-to-b from-white via-amber-50/40 to-white px-6 py-16 text-center shadow-xl sm:px-12 sm:py-20 overflow-hidden dark:border-amber-500/30 dark:bg-gradient-to-b dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
          {/* Ambient background soft glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-amber-500/10 blur-[80px]" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
              Ready to create your identity on the{" "}
              <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
                web?
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              Join thousands of students, developers, and professionals building their verified, searchable, and privacy-protected profile on ProfileHub today.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                id="cta-create-profile-btn"
                className="inline-flex items-center gap-2 rounded-xl gold-btn px-8 py-3.5 text-sm font-bold shadow-md shadow-amber-500/20 transition hover:scale-105"
              >
                <Sparkles className="h-4 w-4 fill-white/20" />
                Create Your Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-600 font-medium dark:text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                No credit card required
              </span>
              <span className="text-amber-500/60">•</span>
              <span>100% Free &amp; Voluntary</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
