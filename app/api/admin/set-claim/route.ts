import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/admin/set-claim
 * Body: { uid: string, secret: string }
 *
 * One-time setup to grant admin role.
 * Set ADMIN_SETUP_SECRET in .env.local for protection.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid, secret } = await req.json();

    const expectedSecret = process.env.ADMIN_SETUP_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required" },
        { status: 400 }
      );
    }

    await adminAuth.setCustomUserClaims(uid, { admin: true });

    return NextResponse.json({
      success: true,
      message: `Admin claim set for user ${uid}`,
    });
  } catch (error: unknown) {
    console.error("Set claim error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to set claim";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
