import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const RegisterPage: React.FC = () => {
  const { signUpWithEmail, signInWithGoogle, signInAsGuest } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim());
      navigate("/dashboard/edit");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/dashboard/edit");
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign-in was canceled or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl sm:p-10 dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-500/20">
            <Sparkles className="h-6 w-6 fill-white/20" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 bg-clip-text text-transparent">
            Create Your Profile
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Claim your custom URL and launch your privacy-controlled digital identity.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-800 dark:text-amber-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-slate-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 dark:text-amber-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-slate-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 dark:text-amber-300">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-slate-50/50 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gold-btn py-3 text-sm font-bold shadow-md shadow-amber-500/20 hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Start Building Profile →"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400/80">
            Or
          </span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs font-semibold text-zinc-700 hover:border-amber-500/50 hover:text-amber-800 shadow-xs transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => {
              signInAsGuest("karthickkondappan05@gmail.com", "Karthick Kondappan");
              navigate("/dashboard");
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100/80 transition dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300"
          >
            <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            1-Click Admin Access (Karthick Kondappan)
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600 dark:text-zinc-400">
          Already have a profile?{" "}
          <Link to="/login" className="font-bold text-amber-700 hover:text-amber-800 hover:underline dark:text-amber-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
