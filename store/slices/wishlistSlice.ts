import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// ─── State ────────────────────────────────────────────────────────────────────

interface WishlistItem {
  productId: string;
  perfumeName: string;
  brand: string;
  image: string;
  price: number; // lowest available price for display
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const syncWishlist = createAsyncThunk(
  "wishlist/sync",
  async (uid: string, { getState }) => {
    const state = getState() as RootState;
    const localItems = state.wishlist.items;

    const wishlistRef = collection(db, `users/${uid}/wishlist`);
    const snapshot = await getDocs(wishlistRef);
    
    const firestoreItems: WishlistItem[] = [];
    snapshot.forEach((docSnap) => {
      firestoreItems.push(docSnap.data() as WishlistItem);
    });

    // Merge local and firestore, using productId as key
    const mergedMap = new Map<string, WishlistItem>();
    firestoreItems.forEach(item => mergedMap.set(item.productId, item));
    localItems.forEach(item => mergedMap.set(item.productId, item));

    const mergedItems = Array.from(mergedMap.values());

    // Update firestore with any items that were only local
    const promises = mergedItems.map(item => 
      setDoc(doc(db, `users/${uid}/wishlist`, item.productId), item, { merge: true })
    );
    await Promise.all(promises);

    return mergedItems;
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.some(
        (i) => i.productId === action.payload.productId
      );
      if (!exists) {
        state.items.push(action.payload);
      }
    },

    removeFromWishlist(state, action: PayloadAction<string>) {
      // payload = productId
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },

    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const idx = state.items.findIndex(
        (i) => i.productId === action.payload.productId
      );
      if (idx !== -1) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(action.payload);
      }
    },

    clearWishlist(state) {
      state.items = [];
    },
    setWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(syncWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────
export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  setWishlist,
} = wishlistSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectWishlistItems = (state: RootState) => state.wishlist.items;

export const selectWishlistCount = (state: RootState) =>
  state.wishlist.items.length;

export const selectIsWishlisted = (productId: string) => (state: RootState) =>
  state.wishlist.items.some((i) => i.productId === productId);

export default wishlistSlice.reducer;
