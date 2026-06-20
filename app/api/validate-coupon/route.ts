import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { CartItem } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { code, cartItems, locale } = await req.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: getErrorMessage("invalid_code", locale) },
        { status: 400 }
      );
    }

    // Read coupon from Firestore /coupons/{code}
    const docRef = adminDb.collection("coupons").doc(code.trim().toUpperCase());
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({
        valid: false,
        message: getErrorMessage("not_found", locale),
      });
    }

    const data = docSnap.data()!;

    // 1. Validate isActive
    if (data.isActive === false) {
      return NextResponse.json({
        valid: false,
        message: getErrorMessage("inactive", locale),
      });
    }

    // 2. Validate expiration (expiresAt > now)
    if (data.expiresAt) {
      const expiresAtDate = typeof data.expiresAt.toDate === "function"
        ? data.expiresAt.toDate()
        : new Date(data.expiresAt);
      if (expiresAtDate.getTime() < Date.now()) {
        return NextResponse.json({
          valid: false,
          message: getErrorMessage("expired", locale),
        });
      }
    }

    // 3. Validate usageCount < maxUsage (0 = unlimited)
    const currentUsage = data.usageCount !== undefined ? data.usageCount : data.usedCount || 0;
    const limitUsage = data.maxUsage !== undefined ? data.maxUsage : data.maxUses || 0;
    if (limitUsage > 0 && currentUsage >= limitUsage) {
      return NextResponse.json({
        valid: false,
        message: getErrorMessage("max_usage", locale),
      });
    }

    // 4. Validate matching productIds if present
    const productIds: string[] | undefined = data.productIds;
    let eligibleItems = cartItems || [];
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      eligibleItems = (cartItems || []).filter((item: CartItem) =>
        productIds.includes(item.productId)
      );

      if (eligibleItems.length === 0) {
        return NextResponse.json({
          valid: false,
          message: getErrorMessage("no_matching_products", locale),
        });
      }
    }

    // 5. Calculate discount amount
    const couponType = data.type || data.discountType;
    const couponValue = data.value !== undefined ? data.value : data.discountValue || 0;

    let discountAmount = 0;

    if (couponType === "percentage") {
      const eligibleSubtotal = eligibleItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.qty,
        0
      );
      discountAmount = eligibleSubtotal * (couponValue / 100);
    } else if (couponType === "fixed") {
      const eligibleSubtotal = eligibleItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.qty,
        0
      );
      discountAmount = Math.min(couponValue, eligibleSubtotal);
    } else if (couponType === "free_shipping") {
      discountAmount = 0; // Handled by client setting shipping to 0
    }

    return NextResponse.json({
      valid: true,
      discountAmount,
      type: couponType,
      value: couponValue,
      productIds: productIds || null,
      message: getErrorMessage("success", locale),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Coupon validation error:", err);
    // Return a generic professional error instead of exposing raw permissions errors
    return NextResponse.json(
      { valid: false, message: getErrorMessage("server_error", "tr") },
      { status: 500 }
    );
  }
}

function getErrorMessage(key: string, locale?: string): string {
  const isAr = locale === "ar";
  const isEn = locale === "en";

  const messages: Record<string, { tr: string; en: string; ar: string }> = {
    invalid_code: {
      tr: "Geçersiz kupon kodu.",
      en: "Invalid coupon code.",
      ar: "رمز القسيمة غير صالح.",
    },
    not_found: {
      tr: "Kupon bulunamadı.",
      en: "Coupon not found.",
      ar: "القسيمة غير موجودة.",
    },
    inactive: {
      tr: "Bu kupon artık aktif değil.",
      en: "This coupon is no longer active.",
      ar: "هذه القسيمة لم تعد نشطة.",
    },
    expired: {
      tr: "Kuponun süresi dolmuş.",
      en: "This coupon has expired.",
      ar: "انتهت صلاحية هذه القسيمة.",
    },
    max_usage: {
      tr: "Kupon kullanım limiti dolmuş.",
      en: "This coupon has reached its usage limit.",
      ar: "تجاوزت هذه القسيمة الحد الأقصى للاستخدام.",
    },
    no_matching_products: {
      tr: "Bu kupon sepetteki ürünler için geçerli değil.",
      en: "This coupon is not applicable to the items in your cart.",
      ar: "هذه القسيمة لا تنطبق على المنتجات الموجودة في سلتك.",
    },
    success: {
      tr: "Kupon başarıyla uygulandı!",
      en: "Coupon applied successfully!",
      ar: "تم تطبيق القسيمة بنجاح!",
    },
    server_error: {
      tr: "Geçici bir sorun oluştu, lütfen daha sonra tekrar deneyin.",
      en: "A temporary issue occurred, please try again later.",
      ar: "حدثت مشكلة مؤقتة، يرجى المحاولة مرة أخرى لاحقًا.",
    },
  };

  const msgSet = messages[key];
  if (!msgSet) return "Validation failed";

  if (isAr) return msgSet.ar;
  if (isEn) return msgSet.en;
  return msgSet.tr;
}
