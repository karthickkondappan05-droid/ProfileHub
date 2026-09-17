import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Search,
  Sun,
  Moon,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  Globe,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const { isDark, setTheme, theme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme(isDark ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md transition-colors dark:border-zinc-800 dark:bg-zinc-950/90 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            id="nav-brand-logo"
            className="flex items-center gap-2.5 transition-all hover:opacity-95 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-amber-800 bg-clip-text text-transparent dark:from-zinc-100 dark:to-amber-300">
                ProfileHub
              </span>
            </div>
          </Link>

          {/* Search bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:block">
            <div className="relative w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="nav-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people, skills, roles..."
                className="w-full rounded-full border border-zinc-200 bg-zinc-50/80 py-1.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition shadow-xs"
              />
            </div>
          </form>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/explore"
            id="nav-explore-link"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Globe className="h-4 w-4 text-amber-600" />
            Explore
          </Link>

          {/* Theme Toggle */}
          <button
            id="nav-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-zinc-600" />}
          </button>

          {user ? (
            <div className="relative">
              <button
                id="nav-user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1 pl-2.5 text-sm font-medium text-zinc-800 transition hover:border-amber-500/50 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 shadow-xs"
              >
                <span className="max-w-[120px] truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {user.displayName || user.email.split("@")[0]}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-xs font-bold text-white shadow-xs">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={user.displayName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    (user.displayName?.[0] || user.email[0]).toUpperCase()
                  )}
                </div>
              </button>

              {userMenuOpen && (
                <div
                  id="nav-user-dropdown"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="border-b border-zinc-100 px-3 py-2 text-xs dark:border-zinc-800">
                    <p className="font-semibold text-zinc-900 truncate dark:text-zinc-100">
                      {user.displayName}
                    </p>
                    <p className="text-zinc-500 truncate dark:text-zinc-400">{user.email}</p>
                    {isAdmin && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/30">
                        <ShieldCheck className="h-3 w-3 text-amber-600" /> Admin
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-amber-600" />
                      Dashboard
                    </Link>

                    {profile?.username && (
                      <Link
                        to={`/profile/${profile.username}`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 transition"
                      >
                        <ExternalLink className="h-4 w-4 text-amber-600" />
                        My Public Profile
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 transition"
                    >
                      <Settings className="h-4 w-4 text-zinc-400" />
                      Account & Privacy
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 transition"
                      >
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        Admin Portal
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-zinc-100 pt-1 dark:border-zinc-800">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                id="nav-login-btn"
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-create-profile-btn"
                className="rounded-xl gold-btn px-4 py-2 text-sm font-semibold shadow-sm transition hover:scale-[1.02]"
              >
                Create Your Profile
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-zinc-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-800 dark:text-zinc-200"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white px-4 pb-6 pt-2 shadow-xl md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </form>

          <div className="flex flex-col gap-2">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200"
            >
              Explore Profiles
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200"
                >
                  Dashboard
                </Link>
                {profile?.username && (
                  <Link
                    to={`/profile/${profile.username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200"
                  >
                    My Public Profile
                  </Link>
                )}
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200"
                >
                  Settings & Privacy
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-2 text-left text-sm font-medium text-red-600 px-3 py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-zinc-200 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl gold-btn py-2.5 text-center text-sm font-bold shadow-md"
                >
                  Create Your Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
