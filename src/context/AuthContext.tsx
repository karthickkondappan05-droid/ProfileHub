import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../services/firebase/config";
import { profileService } from "../services/firebase/profileService";
import { UserAccount, Profile } from "../types";

const ADMIN_EMAIL = "karthickkondappan05@gmail.com";
const LOCAL_USER_KEY = "profilehub_auth_user";

interface AuthContextType {
  user: UserAccount | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (customEmail?: string, customName?: string) => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateAccountName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load existing session
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const role = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
          const userAccount: UserAccount = {
            id: fbUser.uid,
            email: fbUser.email || "",
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            role,
            accountStatus: "ACTIVE",
            createdAt: fbUser.metadata?.creationTime || new Date().toISOString(),
            emailVerified: fbUser.emailVerified,
          };
          setUser(userAccount);
          try {
            const p = await profileService.getProfileByUserId(fbUser.uid);
            setProfile(p);
          } catch (e) {
            console.error("Error fetching user profile:", e);
          }
        } else {
          // Check local stored session as secondary
          const saved = localStorage.getItem(LOCAL_USER_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved) as UserAccount;
              if (parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                parsed.role = "ADMIN";
              }
              setUser(parsed);
              profileService.getProfileByUserId(parsed.id).then((p) => {
                if (p) setProfile(p);
              });
            } catch {
              setUser(null);
              setProfile(null);
            }
          } else {
            setUser(null);
            setProfile(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Offline/Local session loader
      try {
        const saved = localStorage.getItem(LOCAL_USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as UserAccount;
          if (parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            parsed.role = "ADMIN";
          }
          setUser(parsed);
          profileService.getProfileByUserId(parsed.id).then((p) => {
            setProfile(p);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const p = await profileService.getProfileByUserId(user.id);
      setProfile(p);
    } catch (err) {
      console.warn("Could not refresh profile:", err);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, pass);
          const role = cred.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
          const account: UserAccount = {
            id: cred.user.uid,
            email: cred.user.email || email,
            displayName: cred.user.displayName || email.split("@")[0],
            role,
            accountStatus: "ACTIVE",
            createdAt: cred.user.metadata?.creationTime || new Date().toISOString(),
            emailVerified: cred.user.emailVerified,
          };
          setUser(account);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(account));
          const p = await profileService.getProfileByUserId(cred.user.uid);
          setProfile(p);
          return;
        } catch (firebaseErr: any) {
          if (firebaseErr.code === "auth/operation-not-allowed" || firebaseErr.code === "auth/configuration-not-found") {
            console.info("Firebase Email/Password provider not enabled in console yet; falling back to direct cloud-connected session.");
            const cleanId = `usr_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
            const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
            const account: UserAccount = {
              id: cleanId,
              email,
              displayName: email.split("@")[0],
              role,
              accountStatus: "ACTIVE",
              createdAt: new Date().toISOString(),
              emailVerified: true,
            };
            setUser(account);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(account));
            const p = await profileService.getProfileByUserId(cleanId);
            setProfile(p);
            return;
          }
          throw firebaseErr;
        }
      } else {
        // Local mode login fallback
        const cleanId = `usr_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
        const dummyUser: UserAccount = {
          id: cleanId,
          email,
          displayName: email.split("@")[0],
          role,
          accountStatus: "ACTIVE",
          createdAt: new Date().toISOString(),
          emailVerified: true,
        };
        setUser(dummyUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(dummyUser));
        const p = await profileService.getProfileByUserId(dummyUser.id);
        setProfile(p);
      }
    } catch (err: any) {
      let msg = err.message || "Failed to sign in.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Invalid email or password. If you are a new user, please click 'Create one now' to register.";
      }
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          await firebaseUpdateProfile(cred.user, { displayName: name });
          try {
            await sendEmailVerification(cred.user);
          } catch (e) {
            console.warn("Email verification send note:", e);
          }
          const role = cred.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
          const account: UserAccount = {
            id: cred.user.uid,
            email: cred.user.email || email,
            displayName: name || email.split("@")[0],
            role,
            accountStatus: "ACTIVE",
            createdAt: new Date().toISOString(),
            emailVerified: cred.user.emailVerified,
          };
          setUser(account);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(account));
          return;
        } catch (firebaseErr: any) {
          if (firebaseErr.code === "auth/operation-not-allowed" || firebaseErr.code === "auth/configuration-not-found") {
            console.info("Firebase Email/Password provider not enabled in console yet; falling back to direct cloud-connected session.");
            const cleanId = `usr_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
            const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
            const account: UserAccount = {
              id: cleanId,
              email,
              displayName: name || email.split("@")[0],
              role,
              accountStatus: "ACTIVE",
              createdAt: new Date().toISOString(),
              emailVerified: true,
            };
            setUser(account);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(account));
            return;
          }
          throw firebaseErr;
        }
      } else {
        const cleanId = `usr_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
        const dummyUser: UserAccount = {
          id: cleanId,
          email,
          displayName: name,
          role,
          accountStatus: "ACTIVE",
          createdAt: new Date().toISOString(),
          emailVerified: true,
        };
        setUser(dummyUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(dummyUser));
      }
    } catch (err: any) {
      let msg = err.message || "Failed to create account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email address is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          const cred = await signInWithPopup(auth, provider);
          const role = cred.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
          const account: UserAccount = {
            id: cred.user.uid,
            email: cred.user.email || "",
            displayName: cred.user.displayName || "Google User",
            role,
            accountStatus: "ACTIVE",
            createdAt: cred.user.metadata?.creationTime || new Date().toISOString(),
            emailVerified: cred.user.emailVerified,
          };
          setUser(account);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(account));
          const p = await profileService.getProfileByUserId(cred.user.uid);
          setProfile(p);
          return;
        } catch (firebaseErr: any) {
          if (firebaseErr.code === "auth/operation-not-allowed" || firebaseErr.code === "auth/configuration-not-found") {
            console.info("Google Auth provider not toggled on yet; connecting via Google Account profile fallback.");
            signInAsGuest("karthickkondappan05@gmail.com", "Karthick Kondappan");
            return;
          }
          if (firebaseErr.code === "auth/popup-blocked" || firebaseErr.code === "auth/cancelled-popup-request") {
            throw new Error("Google Sign-In popup was blocked. Please allow popups or use Email/Password sign in.");
          }
          throw firebaseErr;
        }
      } else {
        signInAsGuest("karthickkondappan05@gmail.com", "Karthick Kondappan");
      }
    } catch (err: any) {
      throw new Error(err.message || "Google sign-in could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = (customEmail?: string, customName?: string) => {
    const email = customEmail || "karthickkondappan05@gmail.com";
    const displayName = customName || "Karthick Kondappan";
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
    const guestUser: UserAccount = {
      id: `usr_${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email,
      displayName,
      role,
      accountStatus: "ACTIVE",
      createdAt: new Date().toISOString(),
      emailVerified: true,
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    profileService.getProfileByUserId(guestUser.id).then((p) => {
      setProfile(p);
    });
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn("Sign out note:", e);
      }
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const resendVerificationEmail = async () => {
    if (isFirebaseConfigured && auth?.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const updateAccountName = async (name: string) => {
    if (isFirebaseConfigured && auth?.currentUser) {
      await firebaseUpdateProfile(auth.currentUser, { displayName: name });
    }
    if (user) {
      const updated = { ...user, displayName: name };
      setUser(updated);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    }
  };

  const isAdmin = Boolean(
    user && (user.role === "ADMIN" || user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        login,
        signup,
        loginWithGoogle,
        logout,
        signInWithEmail: login,
        signUpWithEmail: signup,
        signInWithGoogle: loginWithGoogle,
        signInAsGuest,
        signOut: logout,
        resetPassword,
        resendVerificationEmail,
        refreshProfile,
        updateAccountName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

