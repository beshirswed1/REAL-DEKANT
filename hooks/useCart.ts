"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import {
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
  applyCoupon,
  removeCoupon,
  setShippingFee,
  selectCartItems,
  selectCartItemCount,
  selectCartSubtotal,
  selectCartTotal,
  selectCoupon,
  selectShippingFee,
  selectFreeShippingThreshold,
  selectCodServiceFee,
} from "@/store/slices/cartSlice";
import { openCart, closeCart, toggleCart } from "@/store/slices/uiSlice";
import type { CartItem, PriceSize } from "@/types";
import type { CouponState } from "@/store/slices/cartSlice";

export function useCart() {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const total = useAppSelector(selectCartTotal);
  const coupon = useAppSelector(selectCoupon);
  const shippingFee = useAppSelector(selectShippingFee);
  const freeShippingThreshold = useAppSelector(selectFreeShippingThreshold);
  const codServiceFee = useAppSelector(selectCodServiceFee);

  return {
    // State
    items,
    itemCount,
    subtotal,
    total,
    coupon,
    shippingFee,
    freeShippingThreshold,
    codServiceFee,

    // Actions
    addItem: (item: CartItem, openDrawer = true) => {
      dispatch(addToCart(item));
      if (openDrawer) dispatch(openCart());
    },
    removeItem: (id: string) => dispatch(removeFromCart(id)),
    updateItemQty: (id: string, qty: number) => dispatch(updateQty({ id, qty })),
    clear: () => dispatch(clearCart()),
    applyCoupon: (couponData: CouponState) => dispatch(applyCoupon(couponData)),
    removeCoupon: () => dispatch(removeCoupon()),
    setShipping: (fee: number) => dispatch(setShippingFee(fee)),
    openCart: () => dispatch(openCart()),
    closeCart: () => dispatch(closeCart()),
    toggleCart: () => dispatch(toggleCart()),
  };
}

