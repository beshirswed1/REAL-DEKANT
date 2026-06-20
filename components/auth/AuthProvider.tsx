"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { useAppDispatch } from "@/store";
import type { AppDispatch } from "@/store";
import {
  setUser,
  clearUser,
  setAuthLoading,
  setAuthError,
  type AuthUser,
} from "@/store/slices/authSlice";
import { syncWishlist } from "@/store/slices/wishlistSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAuthLoading());

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          let role = "user";
          let displayName = firebaseUser.displayName;

          if (!userSnap.exists()) {
            // First time login
            await setDoc(userRef, {
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email,
              role: "user",
              savedAddresses: [],
              defaultAddressIndex: -1,
              createdAt: serverTimestamp(),
            });
            displayName = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
          } else {
            const data = userSnap.data();
            role = data.role || "user";
            displayName = data.displayName || firebaseUser.displayName;
          }

          // Set cookie for middleware
          document.cookie = `rd_auth=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName,
            photoURL: firebaseUser.photoURL,
            role: role as AuthUser["role"],
          };

          dispatch(setUser(authUser));
          
          // Sync wishlist
          (dispatch as AppDispatch)(syncWishlist(firebaseUser.uid));
        } catch (error: unknown) {
          console.error("Auth sync error:", error);
          dispatch(setAuthError(error instanceof Error ? error.message : "Auth error"));
        }
      } else {
        // Clear cookie
        document.cookie = "rd_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
