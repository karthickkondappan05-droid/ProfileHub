import { Profile, PrivacyConfig } from "../types";

export const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  name: "PUBLIC",
  headline: "PUBLIC",
  bio: "PUBLIC",
  profession: "PUBLIC",
  industry: "PUBLIC",
  location: "PUBLIC",
  languages: "PUBLIC",
  education: "PUBLIC",
  experience: "PUBLIC",
  skills: "PUBLIC",
  projects: "PUBLIC",
  achievements: "PUBLIC",
  certifications: "PUBLIC",
  photos: "PUBLIC",
  socialLinks: "PUBLIC",
  ageDisplay: "HIDE",
  phone: "PRIVATE",
  email: "PRIVATE",
  address: "HIDDEN",
};

/**
 * Strips any private, hidden, or restricted fields from the profile object.
 * Returns a sanitized clone safe for unauthenticated visitors or public discovery.
 */
export function getPublicProfile(profile: Profile, isOwnerOrAdmin = false): Partial<Profile> | null {
  if (!profile) return null;

  // If viewing own profile or admin, all authored data is accessible
  if (isOwnerOrAdmin) {
    return { ...profile };
  }

  // Unpublished, draft, or suspended profiles are strictly not public
  if (profile.status !== "PUBLISHED") {
    return null;
  }

  const p = profile.privacy || DEFAULT_PRIVACY_CONFIG;

  const publicData: Partial<Profile> = {
    id: profile.id,
    username: profile.username,
    status: profile.status,
    verificationStatus: profile.verificationStatus,
    allowSearchIndexing: profile.allowSearchIndexing,
    avatarUrl: profile.avatarUrl,
    coverUrl: profile.coverUrl,
    viewsCount: profile.viewsCount || 0,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  // Name & Identity
  if (p.name === "PUBLIC") {
    publicData.fullName = profile.fullName;
    publicData.displayName = profile.displayName || profile.fullName;
  } else {
    publicData.displayName = profile.displayName || "ProfileHub Member";
  }

  // Headline
  if (p.headline === "PUBLIC") {
    publicData.headline = profile.headline;
  }

  // Biography
  if (p.bio === "PUBLIC") {
    publicData.bio = profile.bio;
  }

  // Profession & Industry
  if (p.profession === "PUBLIC") {
    publicData.profession = profile.profession;
  }
  if (p.industry === "PUBLIC") {
    publicData.industry = profile.industry;
  }

  // Location
  if (p.location === "PUBLIC") {
    publicData.location = profile.location;
    publicData.country = profile.country;
  }

  // Languages
  if (p.languages === "PUBLIC") {
    publicData.languages = profile.languages || [];
  }

  // Age / DOB display logic
  if (p.ageDisplay === "AGE_ONLY" && profile.age) {
    publicData.age = profile.age;
  } else if (p.ageDisplay === "BIRTH_YEAR_ONLY" && (profile.birthYear || profile.dateOfBirth)) {
    publicData.birthYear = profile.birthYear || (profile.dateOfBirth ? new Date(profile.dateOfBirth).getFullYear() : undefined);
  } else if (p.ageDisplay === "EXACT_DOB" && profile.dateOfBirth) {
    publicData.dateOfBirth = profile.dateOfBirth;
  }

  // Lists & Collections
  if (p.education === "PUBLIC") {
    publicData.education = profile.education || [];
  } else {
    publicData.education = [];
  }

  if (p.experience === "PUBLIC") {
    publicData.experience = profile.experience || [];
  } else {
    publicData.experience = [];
  }

  if (p.skills === "PUBLIC") {
    publicData.skills = profile.skills || [];
    publicData.skillDetails = profile.skillDetails || [];
  } else {
    publicData.skills = [];
  }

  if (p.projects === "PUBLIC") {
    publicData.projects = profile.projects || [];
  } else {
    publicData.projects = [];
  }

  if (p.achievements === "PUBLIC") {
    publicData.achievements = profile.achievements || [];
  } else {
    publicData.achievements = [];
  }

  if (p.certifications === "PUBLIC") {
    publicData.certifications = profile.certifications || [];
  } else {
    publicData.certifications = [];
  }

  // Photos & Gallery
  if ((!p.photos || p.photos === "PUBLIC") && profile.photos) {
    publicData.photos = profile.photos;
  } else {
    publicData.photos = [];
  }

  if (p.socialLinks === "PUBLIC") {
    publicData.socialLinks = profile.socialLinks || {};
  } else {
    publicData.socialLinks = {};
  }

  // Phone, email, address are NEVER included in public unless specifically set to PUBLIC
  if (p.phone === "PUBLIC" && profile.phone) {
    publicData.phone = profile.phone;
  }
  if (p.email === "PUBLIC" && profile.email) {
    publicData.email = profile.email;
  }
  if (p.address === "PUBLIC" && profile.address) {
    publicData.address = profile.address;
  }

  return publicData;
}
