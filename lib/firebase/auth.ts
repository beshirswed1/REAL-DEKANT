import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  type User,
  type NextOrObserver,
} from "firebase/auth";
import { auth } from "./config";

// ─── Register with email/password ───────────────────────────────────────────
export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

// ─── Sign in with email/password ─────────────────────────────────────────────
export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    // Try popup first (better UX — stays on same page)
    return await signInWithPopup(auth, googleProvider);
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    // If popup was blocked or closed, fall back to redirect
    if (
      firebaseError.code === "auth/popup-blocked" ||
      firebaseError.code === "auth/popup-closed-by-user" ||
      firebaseError.code === "auth/cancelled-popup-request"
    ) {
      // signInWithRedirect navigates the current tab — no popup needed
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};

// ─── Handle redirect result (call on app init) ──────────────────────────────
export const handleGoogleRedirectResult = () => getRedirectResult(auth);

// ─── Sign out ────────────────────────────────────────────────────────────────
export const signOut = () => {
  if (typeof window !== "undefined") {
    document.cookie = "rd_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  return firebaseSignOut(auth);
};

// ─── Update display name / photo ─────────────────────────────────────────────
export const updateUserProfile = (
  user: User,
  data: { displayName?: string; photoURL?: string }
) => updateProfile(user, data);

// ─── Password reset ──────────────────────────────────────────────────────────
export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

// ─── Auth state listener ─────────────────────────────────────────────────────
export const onAuthChange = (callback: NextOrObserver<User>) =>
  onAuthStateChanged(auth, callback);
