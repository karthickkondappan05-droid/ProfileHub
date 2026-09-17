import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Shield, Lock, Search, QrCode } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200/80 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30">
                <Sparkles className="h-4 w-4 fill-white/20" />
              </div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-amber-800 bg-clip-text text-transparent dark:from-zinc-100 dark:to-amber-300">
                ProfileHub
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              A privacy-first platform where students, developers, creators, and professionals voluntarily build, customize, and share their official digital identity on the web.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                <Shield className="h-3.5 w-3.5 text-amber-600" />
                Zero Web Scraping
              </span>
              <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                Data-Level Privacy
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-amber-300">
              Platform
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link to="/explore" className="hover:text-amber-700 dark:hover:text-amber-300 transition">
                  Explore Directory
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-700 dark:hover:text-amber-300 transition">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link to="/profile/john-doe" className="hover:text-amber-700 dark:hover:text-amber-300 transition">
                  Example Profile
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-700 dark:hover:text-amber-300 transition"
                >
                  XML Sitemap
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-700 dark:hover:text-amber-300 transition"
                >
                  Robots.txt
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-amber-300">
              Trust & Transparency
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link to="/#privacy" className="hover:text-amber-700 dark:hover:text-amber-300 transition">
                  Privacy Architecture
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="hover:text-amber-700 dark:hover:text-amber-300 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/#search-discovery" className="hover:text-amber-700 dark:hover:text-amber-300 transition">
                  Search Engine Indexing
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-700 font-semibold transition dark:text-amber-400">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} ProfileHub. All rights reserved. Voluntary user identity platform.
          </p>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <span>Powered by React &amp; Firebase</span>
            <span className="font-semibold text-amber-700 dark:text-amber-400">White Premium Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

