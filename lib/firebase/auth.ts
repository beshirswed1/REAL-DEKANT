import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
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
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// ─── Sign out ────────────────────────────────────────────────────────────────
export const signOut = () => firebaseSignOut(auth);

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
