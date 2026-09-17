export type UserRole = "USER" | "ADMIN";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type ProfileStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "SUSPENDED" | "DELETED";
export type VisibilitySetting = "PUBLIC" | "PRIVATE" | "HIDDEN";
export type VerificationStatus = "UNVERIFIED" | "EMAIL_VERIFIED" | "PROFESSIONALLY_VERIFIED" | "ADMIN_VERIFIED";

export interface UserAccount {
  id: string; // Firebase UID
  email: string;
  displayName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  profileId?: string;
  createdAt: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  location?: string;
}

export interface SkillCategory {
  category: "Languages" | "Frameworks" | "Tools & Cloud" | "Design & UX" | "Soft Skills" | "Other";
  name: string;
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  organization: string;
  date: string;
  description?: string;
  certificateUrl?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  threads?: string;
  website?: string;
  portfolio?: string;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  caption?: string;
  isPrimary?: boolean;
  uploadedAt?: string;
}

export interface PrivacyConfig {
  name: VisibilitySetting;
  headline: VisibilitySetting;
  bio: VisibilitySetting;
  profession: VisibilitySetting;
  industry: VisibilitySetting;
  location: VisibilitySetting;
  languages: VisibilitySetting;
  education: VisibilitySetting;
  experience: VisibilitySetting;
  skills: VisibilitySetting;
  projects: VisibilitySetting;
  achievements: VisibilitySetting;
  certifications: VisibilitySetting;
  photos?: VisibilitySetting;
  socialLinks: VisibilitySetting;
  ageDisplay: "HIDE" | "AGE_ONLY" | "BIRTH_YEAR_ONLY" | "EXACT_DOB";
  phone: VisibilitySetting;
  email: VisibilitySetting;
  address: VisibilitySetting;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  displayName: string;
  headline: string;
  bio: string;
  profession: string;
  industry: string;
  location: string;
  country: string;
  languages: string[];
  
  // Private / Optional fields
  phone?: string;
  email?: string;
  address?: string;
  age?: number;
  birthYear?: number;
  dateOfBirth?: string;

  // Media
  avatarUrl?: string;
  coverUrl?: string;
  photos?: ProfilePhoto[];

  // Collections
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  skillDetails?: SkillCategory[];
  projects: ProjectItem[];
  achievements: AchievementItem[];
  certifications: CertificationItem[];
  socialLinks: SocialLinks;

  // Settings & Status
  status: ProfileStatus;
  verificationStatus: VerificationStatus;
  allowSearchIndexing: boolean;
  privacy: PrivacyConfig;
  
  // Metadata & Analytics
  viewsCount: number;
  linkClicksCount: number;
  qrScansCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportItem {
  id: string;
  profileId: string;
  reportedUsername: string;
  reporterEmail?: string;
  category: "Fake identity" | "Impersonation" | "Spam" | "Harassment" | "Inappropriate content" | "Copyright issue" | "Privacy violation" | "Other";
  reason: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  adminNotes?: string;
}

export interface VerificationRequestItem {
  id: string;
  userId: string;
  profileId: string;
  username: string;
  fullName: string;
  requestedType: "PROFESSIONAL" | "PUBLIC_FIGURE" | "IDENTITY";
  proofLinks: string;
  notes: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string;
}

export interface SearchFilterState {
  query: string;
  profession: string;
  industry: string;
  location: string;
  skill: string;
  onlyVerified: boolean;
  sortBy: "relevance" | "recent" | "views";
}
