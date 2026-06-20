import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, PriceSize } from "@/types";
import type { RootState } from "../index";

// ─── State ────────────────────────────────────────────────────────────────────

export interface CouponState {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number; // e.g. 15 for 15%, 50 for 50₺
  productIds?: string[] | null;
}

interface CartState {
  items: CartItem[];
  coupon: CouponState | null;
  shippingFee: number;
  freeShippingThreshold: number;
  codServiceFee: number;
}

const initialState: CartState = {
  items: [],
  coupon: null,
  shippingFee: 50, // Default shipping fee of 50₺
  freeShippingThreshold: 750, // Default free shipping threshold
  codServiceFee: 40, // Default COD fee
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const item = action.payload;
      const existing = state.items.find(
        (i) => i.productId === item.productId && i.size === item.size
      );
      if (existing) {
        existing.qty += item.qty;
      } else {
        state.items.push({
          ...item,
          id: item.id || `${item.productId}_${item.size}`,
        });
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    updateQty(
      state,
      action: PayloadAction<{ id: string; qty: number }>
    ) {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        if (qty <= 0) {
          state.items = state.items.filter((i) => i.id !== id);
        } else {
          item.qty = qty;
        }
      }
    },

    clearCart(state) {
      state.items = [];
      state.coupon = null;
    },

    applyCoupon(state, action: PayloadAction<CouponState>) {
      state.coupon = action.payload;
    },

    removeCoupon(state) {
      state.coupon = null;
    },

    setShippingFee(state, action: PayloadAction<number>) {
      state.shippingFee = action.payload;
    },

    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },

    setCartSettings(
      state,
      action: PayloadAction<{
        freeShippingThreshold: number;
        shippingFee: number;
        codServiceFee: number;
      }>
    ) {
      state.freeShippingThreshold = action.payload.freeShippingThreshold;
      state.shippingFee = action.payload.shippingFee;
      state.codServiceFee = action.payload.codServiceFee;
    },
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const {
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
  applyCoupon,
  removeCoupon,
  setShippingFee,
  setCartItems,
  setCartSettings,
} = cartSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((acc, item) => acc + item.qty, 0);

export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce((acc, item) => acc + item.price * item.qty, 0);

export const selectCartDiscount = (state: RootState) => {
  const { items, coupon } = state.cart;
  if (!coupon) return 0;

  if (coupon.type === "percentage") {
    if (coupon.productIds && coupon.productIds.length > 0) {
      const eligibleSubtotal = items
        .filter((item) => coupon.productIds?.includes(item.productId))
        .reduce((sum, item) => sum + item.price * item.qty, 0);
      return eligibleSubtotal * (coupon.value / 100);
    } else {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      return subtotal * (coupon.value / 100);
    }
  }

  if (coupon.type === "fixed") {
    if (coupon.productIds && coupon.productIds.length > 0) {
      const eligibleSubtotal = items
        .filter((item) => coupon.productIds?.includes(item.productId))
        .reduce((sum, item) => sum + item.price * item.qty, 0);
      return Math.min(coupon.value, eligibleSubtotal);
    } else {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      return Math.min(coupon.value, subtotal);
    }
  }

  return 0; // free_shipping is handled by setting shipping fee to 0
};

export const selectShippingFee = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  if (subtotal === 0) return 0;
  if (state.cart.coupon?.type === "free_shipping") return 0;
  const threshold = state.cart.freeShippingThreshold ?? 750;
  if (subtotal >= threshold) return 0;
  return state.cart.shippingFee;
};

export const selectCartTotal = (state: RootState) => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectCartDiscount(state);
  const shippingFee = selectShippingFee(state);
  return Math.max(0, subtotal - discount + shippingFee);
};

export const selectCoupon = (state: RootState) => state.cart.coupon;

export const selectFreeShippingThreshold = (state: RootState) => state.cart.freeShippingThreshold ?? 750;
export const selectCodServiceFee = (state: RootState) => state.cart.codServiceFee ?? 40;

export default cartSlice.reducer;

