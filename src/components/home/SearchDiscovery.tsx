import React from "react";
import { Globe2, CheckCircle2, ShieldAlert } from "lucide-react";

export const SearchDiscovery: React.FC = () => {
  return (
    <section id="search-discovery" className="py-16 sm:py-24 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-8 shadow-xl sm:p-12 lg:p-16 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300">
                <Globe2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Technical SEO &amp; Crawlability
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
                Built for Search Engine{" "}
                <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Understanding
                </span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                Every public profile is accompanied by technical standards designed to help search engines accurately index your professional identity.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-600 shrink-0 dark:text-amber-400" />
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                      JSON-LD Structured Data Schema
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Standard Schema.org <code className="font-mono text-amber-800 dark:text-amber-300">Person</code> &amp; <code className="font-mono text-amber-800 dark:text-amber-300">ProfilePage</code> entities mapping your verified public credentials.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-600 shrink-0 dark:text-amber-400" />
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                      Dynamic XML Sitemap &amp; Robots.txt
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Instantly feeds published profiles to crawlers, with an opt-out toggle that injects <code className="font-mono text-amber-800 dark:text-amber-300">noindex</code> directives when disabled.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-600 shrink-0 dark:text-amber-400" />
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                      OpenGraph &amp; Twitter Meta Cards
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Generates rich link previews when shared on LinkedIn, WhatsApp, X, and messaging platforms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Honest disclaimer notice */}
              <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-zinc-200 bg-slate-50 p-3.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-400">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5 dark:text-amber-400" />
                <p>
                  <strong className="text-zinc-900 dark:text-zinc-200">Transparency Notice:</strong> ProfileHub provides the cleanest technical crawlability and metadata for search engines. We do not make false guarantees regarding specific Google ranking positions or Knowledge Panels.
                </p>
              </div>
            </div>

            {/* Code / Structure preview mock */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-slate-900 p-4 font-mono text-xs text-zinc-100 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[11px] text-zinc-400">
                  <span className="text-amber-400 font-bold">Structured Data Preview</span>
                  <span className="text-amber-300/80">application/ld+json</span>
                </div>
                <pre className="mt-3 overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
{`{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": "John Doe",
    "jobTitle": "Software Developer",
    "knowsAbout": ["Java", "React", "AWS"],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Chennai",
      "addressCountry": "India"
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
