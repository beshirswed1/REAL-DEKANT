/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get("rd_admin")?.value;
  if (!token) return false;
  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    return !!decoded.admin;
  } catch {
    return false;
  }
}

// ─── POST: Bulk action (publish / unpublish / delete) ─────────────────────────
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { action, ids } = await req.json();

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Geçersiz istek" },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();

    if (action === "publish") {
      for (const id of ids) {
        const ref = adminDb.collection("products").doc(id);
        batch.update(ref, {
          isPublished: true,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else if (action === "unpublish") {
      for (const id of ids) {
        const ref = adminDb.collection("products").doc(id);
        batch.update(ref, {
          isPublished: false,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else if (action === "delete") {
      // First, collect all Cloudinary public IDs to delete
      const cloudinaryDeletes: string[] = [];

      for (const id of ids) {
        const docSnap = await adminDb.collection("products").doc(id).get();
        if (docSnap.exists) {
          const data = docSnap.data();
          const images = data?.images || [];
          for (const img of images) {
            if (img?.publicId) {
              cloudinaryDeletes.push(img.publicId);
            }
          }
        }
        batch.delete(adminDb.collection("products").doc(id));
      }

      // Delete Cloudinary images (fire and forget)
      for (const publicId of cloudinaryDeletes) {
        try {
          await deleteCloudinaryImage(publicId);
        } catch (err) {
          console.error(`Failed to delete Cloudinary image ${publicId}:`, err);
        }
      }
    } else {
      return NextResponse.json(
        { error: "Geçersiz aksiyon" },
        { status: 400 }
      );
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      affected: ids.length,
    });
  } catch (error: any) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { error: "Toplu işlem başarısız" },
      { status: 500 }
    );
  }
}

// ─── Cloudinary server-side delete ────────────────────────────────────────────
async function deleteCloudinaryImage(publicId: string): Promise<void> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const crypto = await import("crypto");
  const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  const formData = new URLSearchParams();
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp);
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body: formData }
  );
}
