import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";

// ─── Collection names ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  USERS: "users",
  COUPONS: "coupons",
} as const;

// ─── Generic helpers ──────────────────────────────────────────────────────────

/** Get a single document by id */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const ref = doc(db, collectionName, docId);
  const snap: DocumentSnapshot = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

/** Get all documents matching optional constraints */
export async function getDocuments<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const ref = collection(db, collectionName);
  const q = constraints.length ? query(ref, ...constraints) : query(ref);
  const snap = await getDocs(q);
  return snap.docs.map(
    (d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }) as T
  );
}

/** Add a new document (auto-generated id) */
export async function addDocument(
  collectionName: string,
  data: DocumentData
) {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Set a document with a specific id (create or overwrite) */
export async function setDocument(
  collectionName: string,
  docId: string,
  data: DocumentData
) {
  return setDoc(doc(db, collectionName, docId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Update an existing document (partial update) */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
) {
  return updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a document */
export async function deleteDocument(collectionName: string, docId: string) {
  return deleteDoc(doc(db, collectionName, docId));
}

// ─── Re-export useful query builders so callers don't import from firebase ────
export { where, orderBy, limit, startAfter, serverTimestamp };
