import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface UiState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isPageLoading: boolean;
  isLoginModalOpen: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isPageLoading: false,
  isLoginModalOpen: false,
  toasts: [],
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCart(state) {
      state.isCartOpen = true;
    },
    closeCart(state) {
      state.isCartOpen = false;
    },
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },

    openMobileMenu(state) {
      state.isMobileMenuOpen = true;
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false;
    },

    openSearch(state) {
      state.isSearchOpen = true;
    },
    closeSearch(state) {
      state.isSearchOpen = false;
    },

    setPageLoading(state, action: PayloadAction<boolean>) {
      state.isPageLoading = action.payload;
    },

    openLoginModal(state) {
      state.isLoginModalOpen = true;
    },
    closeLoginModal(state) {
      state.isLoginModalOpen = false;
    },

    addToast(
      state,
      action: PayloadAction<{ message: string; variant: ToastVariant }>
    ) {
      const id = Date.now().toString();
      state.toasts.push({ id, ...action.payload });
    },

    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },

    clearToasts(state) {
      state.toasts = [];
    },
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const {
  openCart,
  closeCart,
  toggleCart,
  openMobileMenu,
  closeMobileMenu,
  openSearch,
  closeSearch,
  setPageLoading,
  openLoginModal,
  closeLoginModal,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectIsCartOpen = (state: RootState) => state.ui.isCartOpen;
export const selectIsMobileMenuOpen = (state: RootState) =>
  state.ui.isMobileMenuOpen;
export const selectIsSearchOpen = (state: RootState) => state.ui.isSearchOpen;
export const selectIsPageLoading = (state: RootState) =>
  state.ui.isPageLoading;
export const selectIsLoginModalOpen = (state: RootState) =>
  state.ui.isLoginModalOpen;
export const selectToasts = (state: RootState) => state.ui.toasts;

export default uiSlice.reducer;
