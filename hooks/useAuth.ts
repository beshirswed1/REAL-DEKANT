"use client";

import { useEffect } from "react";
import { onAuthChange } from "@/lib/firebase/auth";
import { getDocument, setDocument, COLLECTIONS } from "@/lib/firebase/firestore";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAppDispatch, useAppSelector } from "@/store";
import { syncWishlist } from "@/store/slices/wishlistSlice";
import {
  setUser,
  clearUser,
  setAuthLoading,
  selectAuthUser,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsAdmin,
  type AuthUser,
} from "@/store/slices/authSlice";
import type { AppUser } from "@/types";

/**
 * Initialises Firebase Auth listener and syncs with Redux.
 * Call this ONCE in the root layout or a top-level provider component.
 */
export function useAuthInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAuthLoading());

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        document.cookie = "rd_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        dispatch(clearUser());
        return;
      }
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        let role = "customer";
        let displayName = firebaseUser.displayName;

        if (!userSnap.exists()) {
          // Create document
          await setDoc(userRef, {
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email,
            role: "customer",
            savedAddresses: [],
            defaultAddressIndex: -1,
            createdAt: serverTimestamp(),
          });
          displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
        } else {
          const data = userSnap.data();
          role = data.role || "customer";
          displayName = data.displayName || firebaseUser.displayName;
        }

        // Set auth cookie
        document.cookie = `rd_auth=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName,
          photoURL: firebaseUser.photoURL,
          role: role as any,
        };

        dispatch(setUser(authUser));
        // Sync wishlist
        dispatch(syncWishlist(firebaseUser.uid) as any);
      } catch (error) {
        console.error("Auth init error:", error);
        // Fallback
        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: "customer",
          })
        );
      }
    });

    return () => unsubscribe();
  }, [dispatch]);
}

/**
 * Read-only hook for consuming auth state anywhere in the app.
 */
export function useAuth() {
  const user = useAppSelector(selectAuthUser);
  const status = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  return { user, status, isAuthenticated, isAdmin };
}
