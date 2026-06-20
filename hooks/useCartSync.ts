"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCartItems, selectCartItems, setCartSettings } from "@/store/slices/cartSlice";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { CartItem } from "@/types";

export function useCartSync() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const { user, isAuthenticated, status } = useAuth();
  
  const isLoaded = useRef(false);
  const currentUid = useRef<string | null>(null);

  // Load site settings config from public API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const config = await res.json();
          dispatch(
            setCartSettings({
              freeShippingThreshold: config.freeShippingThreshold,
              shippingFee: config.shippingFee,
              codServiceFee: config.codServiceFee,
            })
          );
        }
      } catch (err) {
        console.error("Failed to load public settings in cart sync:", err);
      }
    };

    fetchSettings();
  }, [dispatch]);


  // Sync / Load on auth state transition
  useEffect(() => {
    if (status === "loading" || status === "idle") return;

    const initCart = async () => {
      if (isAuthenticated && user?.uid) {
        currentUid.current = user.uid;
        try {
          const docRef = doc(db, "users", user.uid, "cart", "items");
          const docSnap = await getDoc(docRef);
          
          let firestoreItems: CartItem[] = [];
          if (docSnap.exists()) {
            firestoreItems = docSnap.data().items || [];
          }

          // Merge guest cart with user cart if guest cart has items
          const localCartStr = localStorage.getItem("rd_cart");
          const localItems: CartItem[] = localCartStr ? JSON.parse(localCartStr) : [];

          if (localItems.length > 0) {
            const merged = [...firestoreItems];
            localItems.forEach((item) => {
              const idx = merged.findIndex(
                (i) => i.productId === item.productId && i.size === item.size
              );
              if (idx !== -1) {
                merged[idx].qty += item.qty;
              } else {
                merged.push(item);
              }
            });

            // Write merged cart back to Firestore
            await setDoc(docRef, { items: merged });
            // Clear local storage
            localStorage.removeItem("rd_cart");
            dispatch(setCartItems(merged));
          } else {
            dispatch(setCartItems(firestoreItems));
          }
        } catch (error) {
          console.error("Error loading cart from Firestore:", error);
        }
      } else {
        currentUid.current = null;
        // Guest user
        try {
          const localCartStr = localStorage.getItem("rd_cart");
          const localItems: CartItem[] = localCartStr ? JSON.parse(localCartStr) : [];
          dispatch(setCartItems(localItems));
        } catch (error) {
          console.error("Error loading cart from LocalStorage:", error);
        }
      }
      isLoaded.current = true;
    };

    isLoaded.current = false;
    initCart();
  }, [isAuthenticated, user?.uid, status, dispatch]);

  // Save changes to Firestore / LocalStorage
  useEffect(() => {
    if (!isLoaded.current) return;

    const saveCart = async () => {
      if (isAuthenticated && user?.uid && currentUid.current === user.uid) {
        try {
          const docRef = doc(db, "users", user.uid, "cart", "items");
          await setDoc(docRef, { items });
        } catch (error) {
          console.error("Error saving cart to Firestore:", error);
        }
      } else if (!isAuthenticated) {
        try {
          localStorage.setItem("rd_cart", JSON.stringify(items));
        } catch (error) {
          console.error("Error saving cart to LocalStorage:", error);
        }
      }
    };

    saveCart();
  }, [items, isAuthenticated, user?.uid]);
}
