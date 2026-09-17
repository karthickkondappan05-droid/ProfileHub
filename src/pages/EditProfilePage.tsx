import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ProfileWizard } from "../components/wizard/ProfileWizard";

export const EditProfilePage: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-amber-300 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <span className="text-xs font-medium text-amber-400/80">
          Profile Builder &amp; Customizer
        </span>
      </div>

      <ProfileWizard initialProfile={profile} />
    </div>
  );
};
