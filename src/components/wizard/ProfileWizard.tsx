import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Info,
  GraduationCap,
  Briefcase,
  Wrench,
  Award,
  FileCheck,
  Share2,
  Lock,
  Eye,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Save,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Profile,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  AchievementItem,
  CertificationItem,
  PrivacyConfig,
} from "../../types";
import { profileService } from "../../services/firebase/profileService";
import { useAuth } from "../../context/AuthContext";
import { DEFAULT_PRIVACY_CONFIG, getPublicProfile } from "../../utils/privacy";
import { usernameSchema } from "../../utils/validation";
import { PublicProfileView } from "../profile/PublicProfileView";

interface Props {
  initialProfile?: Profile | null;
  onSaved?: (p: Profile) => void;
}

const WIZARD_STEPS = [
  { id: 0, title: "Basic Info", icon: User },
  { id: 1, title: "About", icon: Info },
  { id: 2, title: "Education", icon: GraduationCap },
  { id: 3, title: "Experience", icon: Briefcase },
  { id: 4, title: "Skills", icon: Wrench },
  { id: 5, title: "Projects", icon: Award },
  { id: 6, title: "Achievements", icon: Award },
  { id: 7, title: "Certifications", icon: FileCheck },
  { id: 8, title: "Social Links", icon: Share2 },
  { id: 9, title: "Privacy", icon: Lock },
  { id: 10, title: "Preview", icon: Eye },
  { id: 11, title: "Publish", icon: CheckCircle2 },
];

export const ProfileWizard: React.FC<Props> = ({ initialProfile, onSaved }) => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // AI Assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<Profile>(() => {
    if (initialProfile) return initialProfile;
    const now = new Date().toISOString();
    return {
      id: `prof_${user?.id || Date.now()}`,
      userId: user?.id || `user_${Date.now()}`,
      username: (user?.displayName || user?.email?.split("@")[0] || "user")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 20),
      fullName: user?.displayName || "",
      displayName: user?.displayName || "",
      headline: "Software Professional",
      bio: "Passionate about creating modern digital applications and scalable solutions.",
      profession: "Software Developer",
      industry: "Technology",
      location: "Chennai",
      country: "India",
      languages: ["English"],
      education: [],
      experience: [],
      skills: ["React", "TypeScript", "JavaScript"],
      projects: [],
      achievements: [],
      certifications: [],
      socialLinks: {},
      status: "DRAFT",
      verificationStatus: "UNVERIFIED",
      allowSearchIndexing: true,
      privacy: { ...DEFAULT_PRIVACY_CONFIG },
      viewsCount: 0,
      linkClicksCount: 0,
      qrScansCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  });

  // Username validation state
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (!formData.username) return;
    const check = async () => {
      const validation = usernameSchema.safeParse(formData.username);
      if (!validation.success) {
        setUsernameAvailable(false);
        return;
      }
      setCheckingUsername(true);
      const isFree = await profileService.isUsernameAvailable(formData.username, formData.userId);
      setUsernameAvailable(isFree);
      setCheckingUsername(false);
    };
    const t = setTimeout(check, 400);
    return () => clearTimeout(t);
  }, [formData.username, formData.userId]);

  // Handle Save
  const handleSave = async (newStatus?: Profile["status"]) => {
    setErrorMsg("");
    setSaving(true);
    try {
      const val = usernameSchema.safeParse(formData.username);
      if (!val.success) {
        throw new Error(val.error.issues[0]?.message || "Invalid username format.");
      }
      if (usernameAvailable === false) {
        throw new Error("This username is already taken or reserved.");
      }

      const toSave: Profile = {
        ...formData,
        status: newStatus || formData.status,
      };

      const saved = await profileService.saveProfile(toSave);
      setFormData(saved);
      await refreshProfile();
      if (onSaved) onSaved(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // AI Assistant trigger
  const requestAiSuggestion = async (type: "headline" | "bio" | "skills" | "project") => {
    setAiLoading(true);
    setAiSuggestions(null);
    try {
      const promptContext = `${formData.profession || ""} ${formData.skills?.join(", ") || ""} ${formData.headline || ""}`;
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          prompt: promptContext || "Software Developer interested in modern web systems",
          existingData: formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiSuggestions({ type, data: data.result });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Image Upload handler
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>, target: "avatarUrl" | "coverUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await profileService.uploadImage(file, target === "avatarUrl" ? "avatars" : "covers");
      setFormData((prev) => ({ ...prev, [target]: url }));
    } catch (err: any) {
      setErrorMsg(err.message || "Image upload failed.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top Wizard Steps Bar */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center min-w-max gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          {WIZARD_STEPS.map((step) => {
            const Icon = step.icon;
            const isCurrent = activeStep === step.id;
            const isPassed = activeStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isCurrent
                    ? "gold-gradient-bg text-black font-bold shadow-md shadow-amber-500/20"
                    : isPassed
                    ? "bg-slate-100 border border-zinc-200 text-amber-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-amber-300/80"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{step.id + 1}. {step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:border-red-500/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-300 p-3.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/30 dark:text-amber-300">
          <Check className="h-4 w-4 shrink-0" />
          <span>Changes saved successfully!</span>
        </div>
      )}

      {/* Step Content Card */}
      <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90 sm:p-10">
        {/* Step 0: Basic Info */}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                1. Basic Information
              </h2>
              <p className="text-xs text-zinc-400">
                Define your core identity, handle, and display photos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Full Name (Required)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value, displayName: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Username / URL Slug
                </label>
                <div className="mt-1.5 flex items-center rounded-xl border border-zinc-800 bg-zinc-950 focus-within:border-amber-500/50">
                  <span className="pl-3 text-xs font-mono text-zinc-500">/profile/</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                    className="w-full bg-transparent p-3 text-sm font-mono text-white focus:outline-none"
                    placeholder="john-doe"
                  />
                  <div className="pr-3">
                    {checkingUsername ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                    ) : usernameAvailable ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Media Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Profile Photo (Avatar)
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                        No image
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-500/40 hover:text-amber-300">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFile(e, "avatarUrl")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Cover Photo Banner
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-16 w-32 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                    {formData.coverUrl ? (
                      <img src={formData.coverUrl} alt="Cover" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                        Default
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-amber-500/40 hover:text-amber-300">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Cover
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFile(e, "coverUrl")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Professional Headline
                </label>
                <button
                  type="button"
                  onClick={() => requestAiSuggestion("headline")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  Suggest with AI
                </button>
              </div>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                placeholder="e.g. Software Developer & Cloud Enthusiast"
              />
            </div>

            {/* Biography */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">
                  Short Biography
                </label>
                <button
                  type="button"
                  onClick={() => requestAiSuggestion("bio")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  Polish with AI
                </button>
              </div>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                placeholder="Tell your professional story..."
              />
            </div>

            {/* AI Suggestions Dropdown if loaded */}
            {aiSuggestions && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs">
                <p className="font-semibold text-amber-300">
                  AI Recommendation:
                </p>
                {aiSuggestions.type === "headline" && Array.isArray(aiSuggestions.data) && (
                  <div className="mt-2 space-y-2">
                    {aiSuggestions.data.map((h: string) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, headline: h });
                          setAiSuggestions(null);
                        }}
                        className="block w-full text-left rounded-xl bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 hover:border-amber-500/50"
                      >
                        ✓ {h}
                      </button>
                    ))}
                  </div>
                )}
                {aiSuggestions.type === "bio" && aiSuggestions.data?.bio && (
                  <div className="mt-2">
                    <p className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-zinc-200">
                      {aiSuggestions.data.bio}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, bio: aiSuggestions.data.bio });
                        setAiSuggestions(null);
                      }}
                      className="mt-2 rounded-xl gold-btn px-3.5 py-1.5 text-xs font-bold"
                    >
                      Apply Bio
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 1: About */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                2. About &amp; Background
              </h2>
              <p className="text-xs text-zinc-400">
                Profession, industry, general location, and languages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Profession / Role
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="e.g. UI/UX Designer, MCA Student, Software Developer"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Industry / Sector
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Information Technology, FinTech"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  City / Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Chennai, Tamil Nadu"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. India"
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Languages Spoken (comma separated)
              </label>
              <input
                type="text"
                value={formData.languages?.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    languages: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g. English, Tamil, Hindi"
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Education */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  3. Education History
                </h2>
                <p className="text-xs text-zinc-400">
                  Degrees, institutions, diplomas, and certifications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: EducationItem = {
                    id: `edu_${Date.now()}`,
                    institution: "",
                    degree: "",
                    fieldOfStudy: "",
                    startYear: "2020",
                    endYear: "2024",
                  };
                  setFormData({ ...formData, education: [...(formData.education || []), newItem] });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl gold-btn px-3.5 py-2 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Education
              </button>
            </div>

            {formData.education?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
                No education history added yet. Click &ldquo;Add Education&rdquo; above.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.education?.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-amber-400">
                        Record #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.education.filter((_, i) => i !== idx);
                          setFormData({ ...formData, education: updated });
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-zinc-400">
                          Institution
                        </label>
                        <input
                          type="text"
                          value={item.institution}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].institution = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          placeholder="e.g. Anna University"
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">
                          Degree / Course
                        </label>
                        <input
                          type="text"
                          value={item.degree}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].degree = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          placeholder="e.g. Master of Computer Applications (MCA)"
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">
                          Field of Study
                        </label>
                        <input
                          type="text"
                          value={item.fieldOfStudy}
                          onChange={(e) => {
                            const updated = [...formData.education];
                            updated[idx].fieldOfStudy = e.target.value;
                            setFormData({ ...formData, education: updated });
                          }}
                          placeholder="e.g. Computer Science"
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-zinc-400">
                            Start Year
                          </label>
                          <input
                            type="text"
                            value={item.startYear}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].startYear = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-zinc-400">
                            End Year
                          </label>
                          <input
                            type="text"
                            value={item.endYear}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].endYear = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Experience */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  4. Professional Experience
                </h2>
                <p className="text-xs text-zinc-400">
                  Career history, internships, and key impact accomplishments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: ExperienceItem = {
                    id: `exp_${Date.now()}`,
                    company: "",
                    jobTitle: "",
                    startDate: "2024-01",
                    isCurrent: true,
                  };
                  setFormData({ ...formData, experience: [...(formData.experience || []), newItem] });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl gold-btn px-3.5 py-2 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Experience
              </button>
            </div>

            {formData.experience?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
                No work experience added yet. Click &ldquo;Add Experience&rdquo; above.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.experience?.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-amber-400">
                        Position #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.experience.filter((_, i) => i !== idx);
                          setFormData({ ...formData, experience: updated });
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-zinc-400">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => {
                            const updated = [...formData.experience];
                            updated[idx].company = e.target.value;
                            setFormData({ ...formData, experience: updated });
                          }}
                          placeholder="e.g. NextGen Software Systems"
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={item.jobTitle}
                          onChange={(e) => {
                            const updated = [...formData.experience];
                            updated[idx].jobTitle = e.target.value;
                            setFormData({ ...formData, experience: updated });
                          }}
                          placeholder="e.g. Senior Software Engineer"
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-medium text-zinc-400">
                        Responsibilities &amp; Impact
                      </label>
                      <textarea
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) => {
                          const updated = [...formData.experience];
                          updated[idx].description = e.target.value;
                          setFormData({ ...formData, experience: updated });
                        }}
                        placeholder="Key responsibilities and achievements..."
                        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Skills */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  5. Skills &amp; Competencies
                </h2>
                <p className="text-xs text-zinc-400">
                  Programming languages, frameworks, cloud tools, and domain abilities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => requestAiSuggestion("skills")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/40 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/40"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                AI Skill Suggestions
              </button>
            </div>

            {/* Tag adder */}
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Add Skill (Press Enter or Comma)
              </label>
              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const val = (e.currentTarget.value || "").trim().replace(/^,|,$/g, "");
                    if (val && !formData.skills?.includes(val)) {
                      setFormData({ ...formData, skills: [...(formData.skills || []), val] });
                      e.currentTarget.value = "";
                    }
                  }
                }}
                placeholder="Type skill name and press Enter..."
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            {/* Active Skills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills?.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        skills: formData.skills.filter((s) => s !== skill),
                      })
                    }
                    className="hover:text-red-400 text-zinc-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* AI Skill suggestions */}
            {aiSuggestions && aiSuggestions.type === "skills" && Array.isArray(aiSuggestions.data?.skills) && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs">
                <p className="font-semibold text-amber-300 mb-2">
                  Suggested Skills (Click to add):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {aiSuggestions.data.skills.map((s: string) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (!formData.skills?.includes(s)) {
                          setFormData({ ...formData, skills: [...(formData.skills || []), s] });
                        }
                      }}
                      className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-zinc-200 hover:border-amber-500/50 hover:text-amber-300"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Projects */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  6. Projects &amp; Portfolio
                </h2>
                <p className="text-xs text-zinc-400">
                  Featured software applications, case studies, or design artifacts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: ProjectItem = {
                    id: `proj_${Date.now()}`,
                    name: "",
                    description: "",
                    technologies: ["React", "TypeScript"],
                  };
                  setFormData({ ...formData, projects: [...(formData.projects || []), newItem] });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl gold-btn px-3.5 py-2 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Project
              </button>
            </div>

            {formData.projects?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
                No portfolio projects added yet. Click &ldquo;Add Project&rdquo; above.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.projects?.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-amber-400">
                        Project #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.projects.filter((_, i) => i !== idx);
                          setFormData({ ...formData, projects: updated });
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-zinc-400">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[idx].name = e.target.value;
                            setFormData({ ...formData, projects: updated });
                          }}
                          placeholder="e.g. Telemetry Analytics Engine"
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">
                          Live Demo URL
                        </label>
                        <input
                          type="url"
                          value={item.projectUrl || ""}
                          onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[idx].projectUrl = e.target.value;
                            setFormData({ ...formData, projects: updated });
                          }}
                          placeholder="https://..."
                          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-medium text-zinc-400">
                        Project Description
                      </label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[idx].description = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        placeholder="What problem does it solve and what tech was used?"
                        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 6: Achievements */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  7. Honors &amp; Achievements
                </h2>
                <p className="text-xs text-zinc-400">
                  Awards, hackathon wins, research publications, and key honors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: AchievementItem = {
                    id: `ach_${Date.now()}`,
                    title: "",
                    organization: "",
                    date: "2024",
                  };
                  setFormData({ ...formData, achievements: [...(formData.achievements || []), newItem] });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl gold-btn px-3.5 py-2 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Achievement
              </button>
            </div>

            {formData.achievements?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
                No achievements recorded. Click &ldquo;Add Achievement&rdquo; above.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.achievements?.map((item, idx) => (
                  <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-amber-400">Achievement #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.achievements.filter((_, i) => i !== idx);
                          setFormData({ ...formData, achievements: updated });
                        }}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...formData.achievements];
                          updated[idx].title = e.target.value;
                          setFormData({ ...formData, achievements: updated });
                        }}
                        placeholder="Title (e.g. 1st Place National Hackathon)"
                        className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={item.organization}
                        onChange={(e) => {
                          const updated = [...formData.achievements];
                          updated[idx].organization = e.target.value;
                          setFormData({ ...formData, achievements: updated });
                        }}
                        placeholder="Organization / Entity"
                        className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 7: Certifications */}
        {activeStep === 7 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  8. Certifications &amp; Licenses
                </h2>
                <p className="text-xs text-zinc-400">
                  AWS, Oracle, Google Cloud, Cisco, or industry badges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: CertificationItem = {
                    id: `cert_${Date.now()}`,
                    name: "",
                    issuingOrganization: "",
                    issueDate: "2024-01",
                  };
                  setFormData({ ...formData, certifications: [...(formData.certifications || []), newItem] });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl gold-btn px-3.5 py-2 text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Certification
              </button>
            </div>

            {formData.certifications?.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
                No certifications added yet. Click &ldquo;Add Certification&rdquo; above.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.certifications?.map((item, idx) => (
                  <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-amber-400">Certification #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.certifications.filter((_, i) => i !== idx);
                          setFormData({ ...formData, certifications: updated });
                        }}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].name = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        placeholder="Certificate Name (e.g. AWS Certified Solutions Architect)"
                        className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={item.issuingOrganization}
                        onChange={(e) => {
                          const updated = [...formData.certifications];
                          updated[idx].issuingOrganization = e.target.value;
                          setFormData({ ...formData, certifications: updated });
                        }}
                        placeholder="Issuer (e.g. Amazon Web Services)"
                        className="rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 8: Social Links */}
        {activeStep === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                9. Social &amp; Portfolio Links
              </h2>
              <p className="text-xs text-zinc-400">
                Only links you add here will be publicly displayed on your profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.socialLinks?.linkedin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.socialLinks?.github || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  X / Twitter
                </label>
                <input
                  type="url"
                  value={formData.socialLinks?.twitter || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">
                  Personal Website / Portfolio
                </label>
                <input
                  type="url"
                  value={formData.socialLinks?.website || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, website: e.target.value },
                    })
                  }
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 9: Privacy Controls */}
        {activeStep === 9 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                10. Privacy &amp; Visibility Controls
              </h2>
              <p className="text-xs text-zinc-400">
                You have 100% granular control. Any section marked PRIVATE will never be returned to visitors.
              </p>
            </div>

            <div className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-950/60">
              <PrivacyRow
                title="Full Name"
                value={formData.privacy?.name || "PUBLIC"}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, name: val },
                  })
                }
              />
              <PrivacyRow
                title="Professional Headline & Bio"
                value={formData.privacy?.headline || "PUBLIC"}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, headline: val, bio: val },
                  })
                }
              />
              <PrivacyRow
                title="Education History"
                value={formData.privacy?.education || "PUBLIC"}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, education: val },
                  })
                }
              />
              <PrivacyRow
                title="Work Experience"
                value={formData.privacy?.experience || "PUBLIC"}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, experience: val },
                  })
                }
              />
              <PrivacyRow
                title="Skills & Badges"
                value={formData.privacy?.skills || "PUBLIC"}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, skills: val },
                  })
                }
              />
              <PrivacyRow
                title="Projects"
                value={formData.privacy?.projects || "PUBLIC"}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, projects: val },
                  })
                }
              />
            </div>

            {/* Age display setting */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
              <label className="text-xs font-bold text-white">
                Age / Birth Year Visibility
              </label>
              <select
                value={formData.privacy?.ageDisplay || "HIDE"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    privacy: { ...formData.privacy, ageDisplay: e.target.value as any },
                  })
                }
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none"
              >
                <option value="HIDE">Do not display age or birth date (Default / Recommended)</option>
                <option value="AGE_ONLY">Display age only (e.g. &ldquo;25 years old&rdquo;)</option>
                <option value="BIRTH_YEAR_ONLY">Display birth year only (e.g. &ldquo;Born in 2001&rdquo;)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 10: Preview as Public */}
        {activeStep === 10 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                11. Preview as Public Visitor
              </h2>
              <p className="text-xs text-zinc-400">
                This preview renders with private fields stripped out, exactly as unauthenticated web visitors will see.
              </p>
            </div>

            <div className="mt-4">
              <PublicProfileView profile={getPublicProfile(formData, false) || {}} isPreview={true} />
            </div>
          </div>
        )}

        {/* Step 11: Publish */}
        {activeStep === 11 && (
          <div className="space-y-6 text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-xl">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Ready to Publish Your Profile?
              </h2>
              <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
                Your profile will be live at: <br />
                <strong className="font-mono text-amber-300">
                  /profile/{formData.username}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-xs font-semibold text-zinc-700 hover:border-amber-400 hover:text-amber-800 shadow-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleSave("PUBLISHED");
                  navigate(`/profile/${formData.username}`);
                }}
                className="rounded-xl gold-btn px-7 py-3 text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Publish Live Profile →
              </button>
            </div>
          </div>
        )}

        {/* Wizard Footer Nav Buttons */}
        <div className="mt-10 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <button
            type="button"
            disabled={activeStep === 0}
            onClick={() => setActiveStep((p) => Math.max(0, p - 1))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-300 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-amber-400 hover:text-amber-800 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-amber-300"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save Progress"}
            </button>

            {activeStep < 11 && (
              <button
                type="button"
                onClick={() => setActiveStep((p) => Math.min(11, p + 1))}
                className="inline-flex items-center gap-1.5 rounded-xl gold-btn px-5 py-2 text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacyRow: React.FC<{
  title: string;
  value: "PUBLIC" | "PRIVATE" | "HIDDEN";
  onChange: (val: "PUBLIC" | "PRIVATE" | "HIDDEN") => void;
}> = ({ title, value, onChange }) => (
  <div className="flex items-center justify-between p-4 text-xs">
    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{title}</span>
    <div className="flex items-center gap-1.5">
      {(["PUBLIC", "PRIVATE"] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
            value === opt
              ? opt === "PUBLIC"
                ? "bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40"
                : "bg-slate-100 text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);
