import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { UserRole } from "@/types";

// ─── Serialisable user snapshot ───────────────────────────────────────────────
// Firebase User objects are not JSON-serialisable, so we store only the fields
// we need from the Firestore /users document.
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

// ─── State ────────────────────────────────────────────────────────────────────

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = "authenticated";
      state.error = null;
    },

    clearUser(state) {
      state.user = null;
      state.status = "unauthenticated";
      state.error = null;
    },

    setAuthLoading(state) {
      state.status = "loading";
    },

    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = "unauthenticated";
    },
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const { setUser, clearUser, setAuthLoading, setAuthError } =
  authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === "authenticated";
export const selectIsAdmin = (state: RootState) =>
  state.auth.user?.role === "admin";
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
