// lib/firebase/admin.ts
import * as admin from "firebase-admin";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "realdekant";

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // 1. Check for FIREBASE_SERVICE_ACCOUNT_KEY JSON string
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const credential = JSON.parse(serviceAccountKey);
      return admin.initializeApp({
        credential: admin.credential.cert(credential),
      });
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY environment variable:", error);
    }
  }

  // 2. Check for individual variables (Firebase Client Email & Private Key)
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    try {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    } catch (error) {
      console.error("Failed to initialize Firebase Admin with individual credentials:", error);
    }
  }

  // 3. Fallback: Default Application Credentials (for local emulation / default environments)
  try {
    return admin.initializeApp();
  } catch (error) {
    console.warn("Firebase Admin SDK could not be initialized. Server-side writes will require admin credentials.", error);
  }
}

initializeAdmin();

export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export default admin;
