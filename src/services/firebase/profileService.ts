import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, isFirebaseConfigured, auth } from "./config";
import { handleFirestoreError, OperationType } from "./error";
import {
  Profile,
  ProfileStatus,
  ReportItem,
  VerificationRequestItem,
  SearchFilterState,
} from "../../types";
import { SAMPLE_PROFILES } from "../../data/sampleProfiles";
import { getPublicProfile } from "../../utils/privacy";

const LOCAL_STORAGE_PROFILES_KEY = "profilehub_profiles_data";
const LOCAL_STORAGE_REPORTS_KEY = "profilehub_reports_data";
const LOCAL_STORAGE_VERIF_KEY = "profilehub_verifications_data";

function getLocalProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(SAMPLE_PROFILES));
      return SAMPLE_PROFILES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_PROFILES;
  } catch {
    return SAMPLE_PROFILES;
  }
}

function saveLocalProfiles(profiles: Profile[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error("Local storage quota error:", e);
  }
}

function getLocalReports(): ReportItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: ReportItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

function getLocalVerifications(): VerificationRequestItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VERIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalVerifications(verifs: VerificationRequestItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_VERIF_KEY, JSON.stringify(verifs));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

export const profileService = {
  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const normalized = username.toLowerCase().trim();
    const reserved = ["admin", "root", "api", "dashboard", "explore", "profile", "settings", "login", "register", "auth", "sitemap", "robots"];
    if (reserved.includes(normalized)) return false;

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "profiles"), where("username", "==", normalized));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data() as Profile;
          if (excludeUserId && docData.userId === excludeUserId) {
            return true;
          }
          return false;
        }
        return true;
      } catch (err) {
        console.warn("Firestore check failed, falling back to local:", err);
      }
    }

    const profiles = getLocalProfiles();
    const existing = profiles.find((p) => p.username === normalized);
    if (existing && (!excludeUserId || existing.userId !== excludeUserId)) {
      return false;
    }
    return true;
  },

  /**
   * Fetch profile by public username slug
   */
  async getProfileByUsername(username: string): Promise<Profile | null> {
    const normalized = username.toLowerCase().trim();

    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, "profiles"),
          where("username", "==", normalized),
          where("status", "==", "PUBLISHED")
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as Profile;
        }
      } catch (error) {
        console.warn("Firestore fetch error for username:", error);
      }
    }

    const profiles = getLocalProfiles();
    const found = profiles.find((p) => p.username === normalized);
    return found || null;
  },

  /**
   * Fetch profile by authenticated user's ID
   */
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "profiles"), where("userId", "==", userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as Profile;
        }
      } catch (error) {
        console.warn("Firestore fetch error for userId:", error);
      }
    }
    const profiles = getLocalProfiles();
    return profiles.find((p) => p.userId === userId) || null;
  },

  /**
   * Save or Update a Profile
   */
  async saveProfile(profile: Profile): Promise<Profile> {
    const now = new Date().toISOString();
    const updatedProfile: Profile = {
      ...profile,
      username: profile.username.toLowerCase().trim(),
      updatedAt: now,
      createdAt: profile.createdAt || now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "profiles", updatedProfile.id), updatedProfile);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `profiles/${updatedProfile.id}`, auth?.currentUser);
      }
    }

    // Update local storage cache
    const profiles = getLocalProfiles();
    const index = profiles.findIndex((p) => p.id === updatedProfile.id || p.userId === updatedProfile.userId);
    if (index >= 0) {
      profiles[index] = updatedProfile;
    } else {
      profiles.unshift(updatedProfile);
    }
    saveLocalProfiles(profiles);

    return updatedProfile;
  },

  /**
   * Delete profile
   */
  async deleteProfile(profileId: string, userId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "profiles", profileId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `profiles/${profileId}`, auth?.currentUser);
      }
    }
    const profiles = getLocalProfiles();
    const filtered = profiles.filter((p) => p.id !== profileId && p.userId !== userId);
    saveLocalProfiles(filtered);
  },

  /**
   * Search published profiles with filters
   */
  async searchProfiles(filters: Partial<SearchFilterState> = {}): Promise<Profile[]> {
    let all: Profile[] = [];

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "profiles"), limit(50));
        const snap = await getDocs(q);
        if (!snap.empty) {
          all = snap.docs.map((d) => d.data() as Profile);
        }
      } catch (e) {
        console.warn("Firestore search query fallback:", e);
      }
    }

    if (all.length === 0) {
      all = getLocalProfiles();
    }

    // Filter by query and category
    return all.filter((p) => {
      if (filters.query && filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matchesName = p.fullName?.toLowerCase().includes(q);
        const matchesUsername = p.username?.toLowerCase().includes(q);
        const matchesHeadline = p.headline?.toLowerCase().includes(q);
        const matchesProfession = p.profession?.toLowerCase().includes(q);
        const matchesBio = p.bio?.toLowerCase().includes(q);
        const matchesLocation = p.location?.toLowerCase().includes(q);
        const matchesSkills = p.skills?.some((s) => s.toLowerCase().includes(q));

        if (!matchesName && !matchesUsername && !matchesHeadline && !matchesProfession && !matchesBio && !matchesLocation && !matchesSkills) {
          return false;
        }
      }

      if (filters.profession && filters.profession !== "All") {
        const q = filters.profession.toLowerCase();
        const match =
          p.profession?.toLowerCase().includes(q) ||
          p.headline?.toLowerCase().includes(q) ||
          p.skills?.some((s) => s.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (filters.onlyVerified && p.verificationStatus === "UNVERIFIED") {
        return false;
      }

      return true;
    });
  },

  /**
   * Track profile view, click, or scan metrics
   */
  async incrementMetric(
    profileId: string,
    metric: "viewsCount" | "linkClicksCount" | "qrScansCount"
  ): Promise<void> {
    const profiles = getLocalProfiles();
    const index = profiles.findIndex((p) => p.id === profileId);
    if (index >= 0) {
      profiles[index][metric] = (profiles[index][metric] || 0) + 1;
      saveLocalProfiles(profiles);
    }
  },

  /**
   * Submit profile abuse report
   */
  async submitReport(report: Omit<ReportItem, "id" | "createdAt" | "status">): Promise<ReportItem> {
    const newReport: ReportItem = {
      ...report,
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "reports", newReport.id), newReport);
      } catch (e) {
        console.warn("Report save error:", e);
      }
    }

    const reports = getLocalReports();
    reports.unshift(newReport);
    saveLocalReports(reports);

    return newReport;
  },

  /**
   * Get all pending abuse reports (Admin)
   */
  async getPendingReports(): Promise<ReportItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "reports"), where("status", "==", "PENDING"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as ReportItem);
        }
      } catch (e) {
        console.warn("Reports fetch fallback:", e);
      }
    }
    return getLocalReports().filter((r) => r.status === "PENDING");
  },

  /**
   * Resolve an abuse report
   */
  async resolveReport(reportId: string, actionTaken: string): Promise<void> {
    const reports = getLocalReports();
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx >= 0) {
      reports[idx].status = "RESOLVED";
      reports[idx].adminNotes = actionTaken;
      saveLocalReports(reports);
    }
  },

  /**
   * Submit verification request
   */
  async submitVerificationRequest(request: {
    profileId: string;
    userId: string;
    username: string;
    fullName: string;
    requestType: "PROFESSIONALLY_VERIFIED" | "EMAIL_VERIFIED" | "ADMIN_VERIFIED";
    documentUrl?: string;
    notes: string;
  }): Promise<VerificationRequestItem> {
    const newReq: VerificationRequestItem = {
      id: `req_${Date.now()}`,
      userId: request.userId,
      profileId: request.profileId,
      username: request.username,
      fullName: request.fullName,
      requestedType: request.requestType === "EMAIL_VERIFIED" ? "IDENTITY" : "PROFESSIONAL",
      proofLinks: request.documentUrl || "",
      notes: request.notes,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "verification_requests", newReq.id), newReq);
      } catch (e) {
        console.warn("Verification request error:", e);
      }
    }

    const list = getLocalVerifications();
    list.unshift(newReq);
    saveLocalVerifications(list);

    return newReq;
  },

  /**
   * Get pending verification requests (Admin)
   */
  async getPendingVerificationRequests(): Promise<VerificationRequestItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "verification_requests"), where("status", "==", "PENDING"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as VerificationRequestItem);
        }
      } catch (e) {
        console.warn("Verification fetch fallback:", e);
      }
    }
    return getLocalVerifications().filter((v) => v.status === "PENDING");
  },

  /**
   * Review verification request
   */
  async reviewVerificationRequest(
    requestId: string,
    status: "APPROVED" | "REJECTED",
    reviewerId: string
  ): Promise<void> {
    const list = getLocalVerifications();
    const idx = list.findIndex((r) => r.id === requestId);
    if (idx >= 0) {
      list[idx].status = status;
      list[idx].reviewedAt = new Date().toISOString();
      saveLocalVerifications(list);
    }
  },

  /**
   * Update profile status or verification tier
   */
  async updateProfileStatus(profileId: string, updates: Partial<Profile>): Promise<void> {
    const profiles = getLocalProfiles();
    const idx = profiles.findIndex((p) => p.id === profileId);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...updates, updatedAt: new Date().toISOString() };
      saveLocalProfiles(profiles);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "profiles", profileId), updates);
      } catch (e) {
        console.warn("Firestore update profile status error:", e);
      }
    }
  },

  /**
   * Admin suspend/unpublish profile
   */
  async updateProfileStatusAdmin(profileId: string, status: ProfileStatus): Promise<void> {
    await this.updateProfileStatus(profileId, { status });
  },

  /**
   * Image upload helper (validates mime type, size, and uploads or converts to safe URI)
   */
  async uploadImage(file: File, folder: "avatars" | "covers" | "projects"): Promise<string> {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file format. Only JPEG, PNG, WEBP, and GIF are supported.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be under 5MB.");
    }

    if (isFirebaseConfigured && storage && auth?.currentUser) {
      try {
        const fileExt = file.name.split(".").pop() || "jpg";
        const storageRef = ref(storage, `${folder}/${auth.currentUser.uid}_${Date.now()}.${fileExt}`);
        const snapshot = await uploadBytesResumable(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.warn("Storage upload failed, fallback to compressed Data URL:", err);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = folder === "covers" ? 1400 : 600;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.85);
            resolve(compressed);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error("Failed to process image file."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });
  },
};
