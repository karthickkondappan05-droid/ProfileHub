import React, { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  CheckCircle,
  MapPin,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  FileCheck,
  Share2,
  QrCode,
  Flag,
  Copy,
  Check,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Globe2,
  X,
  Eye,
  Lock,
  Download,
  Printer,
  FileText,
  UserCheck,
  Camera,
} from "lucide-react";
import { Profile, ReportItem } from "../../types";
import { profileService } from "../../services/firebase/profileService";
import { PhotoGallery } from "./PhotoGallery";

interface Props {
  profile: Partial<Profile>;
  isPreview?: boolean;
}

export const PublicProfileView: React.FC<Props> = ({ profile, isPreview = false }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Report form state
  const [reportCategory, setReportCategory] = useState<ReportItem["category"]>("Fake identity");
  const [reportReason, setReportReason] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const fullUrl = `${window.location.origin}/profile/${profile.username || ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.fullName || profile.username} | ProfileHub`,
          text: `Check out ${profile.fullName || "this profile"}'s verified presence on ProfileHub:`,
          url: fullUrl,
        });
        return;
      } catch (err) {
        // Fallback to modal if cancelled or unsupported
      }
    }
    setShareOpen(true);
  };

  const handleDownloadVCard = () => {
    const p = profile;
    const nameParts = (p.fullName || p.username || "Professional").split(" ");
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const firstName = nameParts[0] || "";

    let vcard = "BEGIN:VCARD\r\nVERSION:3.0\r\n";
    vcard += `N:${lastName};${firstName};;;\r\n`;
    vcard += `FN:${p.fullName || p.username || "Professional"}\r\n`;
    if (p.headline || p.profession) {
      vcard += `TITLE:${p.headline || p.profession}\r\n`;
    }
    if (p.bio) {
      vcard += `NOTE:${p.bio.replace(/\r?\n/g, " ")}\r\n`;
    }
    if (p.socialLinks?.website) {
      vcard += `URL:${p.socialLinks.website}\r\n`;
    } else if (p.username) {
      vcard += `URL:${window.location.origin}/profile/${p.username}\r\n`;
    }
    if (p.socialLinks?.linkedin) {
      vcard += `X-SOCIALPROFILE;type=linkedin:${p.socialLinks.linkedin}\r\n`;
    }
    if (p.socialLinks?.github) {
      vcard += `X-SOCIALPROFILE;type=github:${p.socialLinks.github}\r\n`;
    }
    if (p.location) {
      vcard += `ADR;TYPE=WORK:;;${p.location};;;;\r\n`;
    }
    vcard += "END:VCARD\r\n";

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${p.username || "contact"}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    const svgElement = document.getElementById("profile-qrcode-svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${profile.username}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !profile.id) return;
    setReportSubmitting(true);
    try {
      await profileService.submitReport({
        profileId: profile.id,
        reportedUsername: profile.username || "unknown",
        reporterEmail: reporterEmail.trim() || undefined,
        category: reportCategory,
        reason: reportReason.trim(),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportOpen(false);
        setReportSuccess(false);
        setReportReason("");
      }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setReportSubmitting(false);
    }
  };

  // Verification Badge Helper
  const renderVerificationBadge = () => {
    if (profile.verificationStatus === "ADMIN_VERIFIED") {
      return (
        <span
          title="Official Admin Verified Profile"
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950/80 dark:border-amber-500/40 dark:text-amber-300"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          Verified Official
        </span>
      );
    }
    if (profile.verificationStatus === "PROFESSIONALLY_VERIFIED") {
      return (
        <span
          title="Professionally Verified Identity"
          className="inline-flex items-center gap-1 rounded-full bg-amber-50/80 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-yellow-950/80 dark:border-yellow-500/40 dark:text-yellow-300"
        >
          <CheckCircle className="h-3.5 w-3.5 text-amber-600 dark:text-yellow-400" />
          Professionally Verified
        </span>
      );
    }
    if (profile.verificationStatus === "EMAIL_VERIFIED") {
      return (
        <span
          title="Email Confirmed"
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
        >
          <Check className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          Email Verified
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Preview Banner if in preview mode */}
      {isPreview && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-xs dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-2 font-medium">
            <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Public Preview Mode: This shows exactly what an unauthenticated visitor sees.</span>
          </div>
          <span className="font-semibold text-amber-800 dark:text-amber-300">
            Private Fields Stripped
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
        {/* Cover Photo */}
        <div className="relative h-44 sm:h-64 w-full bg-gradient-to-r from-stone-100 via-amber-50/60 to-stone-200 border-b border-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-amber-950/40 dark:border-zinc-800">
          {profile.coverUrl ? (
            <img
              src={profile.coverUrl}
              alt="Cover background"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
              <SparklesPattern />
            </div>
          )}

          {/* Quick share actions on banner top right */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              id="profile-share-btn"
              onClick={() => setShareOpen(true)}
              aria-label="Share Profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-amber-700 border border-zinc-200 shadow-md backdrop-blur transition hover:border-amber-400 hover:bg-white dark:bg-zinc-900/90 dark:text-amber-300 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              id="profile-qr-btn"
              onClick={() => setQrOpen(true)}
              aria-label="Show QR Code"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-amber-700 border border-zinc-200 shadow-md backdrop-blur transition hover:border-amber-400 hover:bg-white dark:bg-zinc-900/90 dark:text-amber-300 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <QrCode className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Profile Header Content */}
        <div className="relative px-6 pb-8 pt-0 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative h-28 w-28 sm:h-36 sm:w-36 shrink-0 rounded-3xl border-4 border-white bg-slate-100 shadow-xl overflow-hidden ring-2 ring-amber-400/40 dark:border-zinc-900 dark:bg-zinc-950 dark:ring-amber-500/30">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || profile.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-3xl text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-zinc-900">
                    {(profile.fullName?.[0] || profile.username?.[0] || "P").toUpperCase()}
                  </div>
                )}
                {profile.photos && profile.photos.length > 0 && (
                  <span
                    className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-xs ring-1 ring-white/20 shadow-md"
                    title={`${profile.photos.length} photos in gallery`}
                  >
                    <Camera className="h-3 w-3" />
                    {profile.photos.length}
                  </span>
                )}
              </div>

              <div className="mb-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                    {profile.fullName || profile.displayName || profile.username}
                  </h1>
                  {renderVerificationBadge()}
                </div>

                <p className="mt-1 text-base font-semibold text-amber-800 dark:text-amber-300">
                  {profile.headline || profile.profession}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {profile.location}
                      {profile.country && `, ${profile.country}`}
                    </span>
                  )}
                  {profile.age && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {profile.age} years old
                    </span>
                  )}
                  {profile.birthYear && !profile.age && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      Born {profile.birthYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div id="profile-actions-bar" className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadVCard}
                title="Download contact card as standard .vcf file"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-amber-400 hover:text-amber-800 shadow-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:text-amber-300"
              >
                <Download className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Save vCard
              </button>

              <button
                onClick={handlePrintPdf}
                title="Print or Save Resume as clean PDF document"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-amber-400 hover:text-amber-800 shadow-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:text-amber-300"
              >
                <Printer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Print / PDF
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-amber-400 hover:text-amber-800 shadow-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:text-amber-300"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> : <Copy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>

              <button
                onClick={() => setReportOpen(true)}
                title="Report profile for abuse or impersonation"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-2 text-xs text-zinc-500 hover:border-red-400 hover:text-red-600 transition shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-red-500/40 dark:hover:text-red-400"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Social Links Ribbon */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-b border-zinc-200/80 py-3 dark:border-zinc-800/80">
              {profile.socialLinks.linkedin && (
                <SocialPill href={profile.socialLinks.linkedin} icon={Linkedin} label="LinkedIn" />
              )}
              {profile.socialLinks.github && (
                <SocialPill href={profile.socialLinks.github} icon={Github} label="GitHub" />
              )}
              {profile.socialLinks.twitter && (
                <SocialPill href={profile.socialLinks.twitter} icon={Twitter} label="X / Twitter" />
              )}
              {profile.socialLinks.website && (
                <SocialPill href={profile.socialLinks.website} icon={Globe2} label="Website" />
              )}
              {profile.socialLinks.portfolio && (
                <SocialPill href={profile.socialLinks.portfolio} icon={ExternalLink} label="Portfolio" />
              )}
              {profile.socialLinks.instagram && (
                <SocialPill href={profile.socialLinks.instagram} icon={Instagram} label="Instagram" />
              )}
              {profile.socialLinks.youtube && (
                <SocialPill href={profile.socialLinks.youtube} icon={Youtube} label="YouTube" />
              )}
            </div>
          )}

          {/* Bio Section */}
          {profile.bio && (
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                About
              </h2>
              <p className="mt-2 text-base leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills Badges */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Skills &amp; Competencies
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl bg-slate-50 border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 hover:border-amber-400 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {profile.experience && profile.experience.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Experience
                </h2>
              </div>
              <div className="mt-4 space-y-6">
                {profile.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800 last:before:h-2"
                  >
                    <span className="absolute left-[-4px] top-2 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-zinc-900" />
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400/80">
                        {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      {exp.company} {exp.location && `· ${exp.location}`}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profile.education && profile.education.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Education
                </h2>
              </div>
              <div className="mt-4 space-y-6">
                {profile.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800 last:before:h-2"
                  >
                    <span className="absolute left-[-4px] top-2 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-zinc-900" />
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {edu.institution}
                      </h3>
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400/80">
                        {edu.startYear} — {edu.endYear}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Showcase */}
          {profile.projects && profile.projects.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Projects &amp; Portfolio
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {profile.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-slate-50/60 p-5 hover:border-amber-400/80 transition dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:hover:border-amber-500/40 shadow-xs"
                  >
                    <div>
                      {proj.imageUrl && (
                        <img
                          src={proj.imageUrl}
                          alt={proj.name}
                          className="mb-3.5 h-36 w-full rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                        />
                      )}
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {proj.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {proj.description}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {proj.technologies?.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-white border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-amber-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-semibold">
                        {proj.projectUrl && (
                          <a
                            href={proj.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                          >
                            Live Demo
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          >
                            <Github className="h-3.5 w-3.5" />
                            Source Code
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Achievements */}
          {(profile.certifications?.length || 0) > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Certifications
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {profile.certifications?.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-2xl border border-zinc-200/90 bg-slate-50/60 p-4 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/80"
                  >
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300/90">
                      {cert.issuingOrganization}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      Issued: {cert.issueDate} {cert.credentialId && `· ID: ${cert.credentialId}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery & Showcase */}
          {profile.photos && profile.photos.length > 0 && (
            <PhotoGallery photos={profile.photos} />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Share Profile
              </h3>
              <button
                onClick={() => setShareOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Share {profile.fullName || profile.username}&apos;s public verified presence.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <ShareOption
                label="WhatsApp"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out ${profile.fullName || "this profile"} on ProfileHub: ${fullUrl}`
                )}`}
                bg="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
              />
              <ShareOption
                label="LinkedIn"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`}
                bg="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 dark:bg-blue-950/60 dark:border-blue-500/30 dark:text-blue-300 dark:hover:bg-blue-900/60"
              />
              <ShareOption
                label="X (Twitter)"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(
                  `Connect with ${profile.fullName || "me"} on ProfileHub:`
                )}`}
                bg="bg-slate-100 border border-zinc-200 text-zinc-800 hover:bg-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700"
              />
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Direct Link
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullUrl}
                  className="w-full rounded-xl border border-zinc-200 bg-slate-50 px-3 py-2 text-xs text-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                />
                <button
                  onClick={handleCopyLink}
                  className="rounded-xl gold-btn px-4 py-2 text-xs font-bold whitespace-nowrap"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Profile QR Code
              </h3>
              <button
                onClick={() => setQrOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex justify-center p-4 bg-white rounded-2xl border-4 border-amber-300 shadow-inner dark:border-amber-500/30">
              <QRCodeSVG
                id="profile-qrcode-svg"
                value={fullUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="mt-3 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Scan to open <span className="font-mono text-amber-800 dark:text-amber-300">{profile.username}</span>
            </p>

            <button
              onClick={handleDownloadQr}
              className="mt-5 w-full rounded-xl gold-btn py-2.5 text-xs font-bold"
            >
              Download PNG Image
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Report Profile
                </h3>
              </div>
              <button
                onClick={() => setReportOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-center text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/30 dark:text-amber-300">
                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-amber-600 dark:text-amber-400" />
                Thank you. Your report has been submitted to the moderation team for review.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Reason Category
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-slate-50 p-2.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="Fake identity">Fake identity</option>
                    <option value="Impersonation">Impersonation / Public Figure</option>
                    <option value="Spam">Spam or Misleading Information</option>
                    <option value="Harassment">Harassment or Hate Speech</option>
                    <option value="Inappropriate content">Inappropriate Content</option>
                    <option value="Privacy violation">Privacy Violation</option>
                    <option value="Copyright issue">Copyright Infringement</option>
                    <option value="Other">Other Violation</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Explanation details (Required)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe why this profile violates ProfileHub guidelines..."
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-slate-50 p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Your Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-slate-50 p-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
                  />
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting || !reportReason.trim()}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SocialPill: React.FC<{ href: string; icon: React.FC<{ className?: string }>; label: string }> = ({
  href,
  icon: Icon,
  label,
}) => (
  <a
    href={href.startsWith("http") ? href : `https://${href}`}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-amber-400 hover:text-amber-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-amber-300"
  >
    <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
    <span>{label}</span>
    <ExternalLink className="h-2.5 w-2.5 text-zinc-400 opacity-70" />
  </a>
);

const ShareOption: React.FC<{ label: string; href: string; bg: string }> = ({ label, href, bg }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={`rounded-xl py-2.5 text-center text-xs font-semibold transition ${bg}`}
  >
    {label}
  </a>
);

const SparklesPattern = () => (
  <div className="flex items-center gap-1 text-amber-700/60 dark:text-amber-400/40">
    <SparklesIcon className="h-6 w-6" />
    <span className="font-mono text-xs text-amber-800/70 dark:text-amber-400/60">ProfileHub Official Verified Identity</span>
  </div>
);

function SparklesIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
