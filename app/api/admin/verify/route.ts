import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_DURATION = 60 * 60 * 24 * 7 * 1000; // 7 days in ms

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Check if service account exists
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      return NextResponse.json(
        { error: "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing. Cannot verify admin credentials." },
        { status: 500 }
      );
    }

    // Verify the ID token first to check admin claim
    const decoded = await adminAuth.verifyIdToken(idToken);
    const { admin } = decoded;

    if (!admin) {
      return NextResponse.json(
        { error: "Bu hesap yönetici değil." },
        { status: 403 }
      );
    }

    // Create a session cookie (lasts 7 days, unlike ID tokens which expire in 1 hour)
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    // Get user details
    const user = await adminAuth.getUser(decoded.uid);

    const response = NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "Admin",
      },
    });

    // Set HttpOnly cookie with the session cookie (not the raw ID token)
    response.cookies.set("rd_admin", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Admin verify error:", error);
    const message =
      error instanceof Error ? error.message : "Doğrulama hatası";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
