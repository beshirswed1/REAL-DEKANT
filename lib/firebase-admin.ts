import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/* eslint-disable @typescript-eslint/no-explicit-any */
let adminAuth: any;
let adminDb: FirebaseFirestore.Firestore;

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
export const isMock = !raw;

if (isMock) {
  console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing. Using mock admin tools.");
  
  adminAuth = {
    verifyIdToken: async (token: string) => {
      if (token === "dev-admin-token") {
        return { admin: true, uid: "dev-admin-uid" };
      }
      throw new Error("Invalid mock token");
    },
    verifySessionCookie: async (cookie: string) => {
      if (cookie === "dev-admin-session") {
        return { admin: true, uid: "dev-admin-uid" };
      }
      throw new Error("Invalid mock session");
    },
    createSessionCookie: async () => "dev-admin-session",
    getUser: async (uid: string) => ({
      uid,
      email: "admin@realdekant.com",
      displayName: "Dev Admin",
    }),
  };
  
  // Stub Firestore that returns empty results — no mock/fake data
  const emptySnap = { docs: [], size: 0, empty: true, forEach: () => {} };
  const emptyQuery = {
    where: () => emptyQuery,
    orderBy: () => emptyQuery,
    limit: () => emptyQuery,
    get: async () => emptySnap,
  };
  adminDb = {
    collection: () => ({
      ...emptyQuery,
      doc: (id?: string) => ({
        get: async () => ({ exists: false, id: id || "stub", data: () => null }),
        set: async () => {},
        update: async () => {},
        delete: async () => {},
      }),
      add: async (data: any) => ({ id: `stub-${Date.now()}`, ...data }),
    }),
  } as any;
} else {
  // ─── Parse service account from env ─────────────────────────────────────────
  const getServiceAccount = (): ServiceAccount => {
    if (!raw) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is missing. " +
          "Add the JSON content of your service account key to .env.local"
      );
    }
    try {
      return JSON.parse(raw) as ServiceAccount;
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. " +
          "Make sure the entire JSON is on one line."
      );
    }
  };

  // ─── Singleton init ─────────────────────────────────────────────────────────
  const app =
    getApps().length === 0
      ? initializeApp({ credential: cert(getServiceAccount()) })
      : getApps()[0];

  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
}

export { adminAuth, adminDb };
