import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

const hasAdminCreds = !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

// Initialize Firebase Admin only if credentials are provided in the environment
if (hasAdminCreds && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "realdekant",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const db = hasAdminCreds ? admin.firestore() : null;

// Helper to generate readable Order ID
function generateOrderId(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `RD-${datePart}-${randPart}`;
}

interface CheckoutCustomer {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
}

interface CheckoutItem {
  productId: string;
  perfumeName: string;
  brand: string;
  image: string;
  size: "3ml" | "5ml" | "10ml";
  qty?: number;
  quantity?: number;
  price?: number;
  unitPrice?: number;
}

export async function POST(req: NextRequest) {
  if (!hasAdminCreds || !db) {
    return NextResponse.json({
      success: false,
      fallbackToClient: true,
      message: "Firebase Admin credentials missing. Falling back to client-side write."
    });
  }

  try {
    const body = await req.json();
    const {
      customer,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod,
      couponCode,
      userId,
      locale = "tr",
    } = body;

    // 1. Basic validation
    if (!customer || !customer.name || !customer.phone || !customer.email || !customer.city || !customer.district || !customer.address) {
      return NextResponse.json({ success: false, message: "Eksik teslimat bilgileri." }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Sepetiniz boş." }, { status: 400 });
    }

    if (typeof subtotal !== "number" || typeof shippingFee !== "number" || typeof discount !== "number" || typeof total !== "number") {
      return NextResponse.json({ success: false, message: "Geçersiz tutar hesaplaması." }, { status: 400 });
    }

    if (!["credit_card", "bank_transfer", "cod", "whatsapp"].includes(paymentMethod)) {
      return NextResponse.json({ success: false, message: "Geçersiz ödeme yöntemi." }, { status: 400 });
    }

    const orderId = generateOrderId();
    const orderRef = db.collection("orders").doc(orderId);
    const mailRef = db.collection("mail").doc(orderId);

    // 2. Transaction to handle coupon usage count increment atomically and create order
    await db.runTransaction(async (transaction) => {
      if (couponCode) {
        const couponRef = db.collection("coupons").doc(couponCode.trim().toUpperCase());
        const couponSnap = await transaction.get(couponRef);

        if (!couponSnap.exists) {
          throw new Error("Kupon bulunamadı veya geçersiz.");
        }

        const couponData = couponSnap.data()!;

        if (couponData.isActive === false) {
          throw new Error("Bu kupon kodu artık aktif değil.");
        }

        if (couponData.expiresAt) {
          const expiresAtDate = typeof couponData.expiresAt.toDate === "function"
            ? couponData.expiresAt.toDate()
            : new Date(couponData.expiresAt);
          if (expiresAtDate.getTime() < Date.now()) {
            throw new Error("Kupon kodunun süresi dolmuş.");
          }
        }

        const currentUsage = couponData.usageCount !== undefined ? couponData.usageCount : couponData.usedCount || 0;
        const limitUsage = couponData.maxUsage !== undefined ? couponData.maxUsage : couponData.maxUses || 0;

        if (limitUsage > 0 && currentUsage >= limitUsage) {
          throw new Error("Kupon kullanım limiti dolmuş.");
        }

        // Atomically increment the coupon usage count
        transaction.update(couponRef, {
          usageCount: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 3. Write Order document
      transaction.set(orderRef, {
        orderId,
        userId: userId || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          city: customer.city,
          district: customer.district,
          address: customer.address,
        },
        items: items.map((item: CheckoutItem) => ({
          productId: item.productId,
          perfumeName: item.perfumeName,
          brand: item.brand,
          image: item.image,
          size: item.size,
          quantity: item.qty || item.quantity || 0,
          unitPrice: item.price || item.unitPrice || 0,
        })),
        subtotal,
        shippingFee,
        discount,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === "credit_card" ? "paid" : "pending",
        orderStatus: "pending",
        appliedCoupon: couponCode || null,
        trackingNumber: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 4. Write Confirmation Email document for Firebase Trigger Email Extension
      const emailHtml = generateEmailHtml(orderId, customer, items, subtotal, discount, shippingFee, total, paymentMethod);
      transaction.set(mailRef, {
        to: customer.email,
        message: {
          subject: `Siparişiniz Alındı - ${orderId}`,
          html: emailHtml,
        },
      });
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: locale === "ar" ? "تم تسجيل طلبك بنجاح" : locale === "en" ? "Your order has been created successfully." : "Siparişiniz başarıyla oluşturuldu.",
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Order creation error:", err);
    return NextResponse.json({
      success: false,
      message: err.message || "Sipariş oluşturulurken bir hata oluştu.",
    }, { status: 500 });
  }
}

// Generate luxury invoice HTML email
function generateEmailHtml(
  orderId: string,
  customer: CheckoutCustomer,
  items: CheckoutItem[],
  subtotal: number,
  discount: number,
  shippingFee: number,
  total: number,
  paymentMethod: string
): string {
  const methodNames: Record<string, string> = {
    credit_card: "Kredi Kartı (iyzico)",
    bank_transfer: "Banka Havalesi / EFT",
    cod: "Kapıda Ödeme",
    whatsapp: "WhatsApp ile Sipariş",
  };

  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #EDE5D0; font-family: sans-serif; font-size: 14px; color: #1A1A1A;">
        <strong>${item.brand}</strong> - ${item.perfumeName}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EDE5D0; font-family: sans-serif; font-size: 14px; color: #1A1A1A; text-align: center;">
        ${item.size}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EDE5D0; font-family: sans-serif; font-size: 14px; color: #1A1A1A; text-align: center;">
        ${item.qty || item.quantity || 0}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EDE5D0; font-family: sans-serif; font-size: 14px; color: #1A1A1A; text-align: right;">
        ₺${item.price || item.unitPrice || 0}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="background-color: #FAF7F0; padding: 40px 20px; font-family: 'Montserrat', sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EDE5D0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border-radius: 4px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #0D0D0D; padding: 30px; text-align: center;">
          <h1 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 24px; letter-spacing: 0.15em; margin: 0; text-transform: uppercase;">
            Real Dekant
          </h1>
          <p style="color: #FAF7F0; font-size: 11px; tracking-wider: 0.2em; text-transform: uppercase; margin: 5px 0 0 0; font-family: sans-serif; opacity: 0.8;">
            LÜKS DEKANT PARFÜM KOLEKSİYONU
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <h2 style="font-family: 'Playfair Display', serif; color: #0D0D0D; font-size: 18px; border-bottom: 1px solid #EDE5D0; padding-bottom: 15px; margin-top: 0;">
            Sipariş Onayı
          </h2>
          <p style="font-size: 14px; color: #2A2A2A; line-height: 1.6; margin-bottom: 25px;">
            Sayın <strong>${customer.name}</strong>,<br/>
            Siparişiniz başarıyla alınmıştır. Siparişiniz hazırlanıp en kısa sürede kargoya teslim edilecektir.
          </p>

          <!-- Order Summary Badge -->
          <div style="background-color: #FAF7F0; border: 1px border-style: solid; border-color: #EDE5D0; padding: 15px 20px; border-radius: 2px; margin-bottom: 25px;">
            <p style="margin: 0; font-size: 13px; color: #1A1A1A;">
              Sipariş Numarası: <strong style="color: #8B6914;">${orderId}</strong>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #1A1A1A;">
              Ödeme Yöntemi: <strong>${methodNames[paymentMethod] || paymentMethod}</strong>
            </p>
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #EDE5D0;">
                <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #0D0D0D; text-align: left; text-transform: uppercase; letter-spacing: 0.05em;">Ürün</th>
                <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #0D0D0D; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">Boyut</th>
                <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #0D0D0D; text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">Adet</th>
                <th style="padding: 10px; font-family: sans-serif; font-size: 12px; color: #0D0D0D; text-align: right; text-transform: uppercase; letter-spacing: 0.05em;">Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <!-- Totals Panel -->
          <div style="width: 250px; margin-left: auto; margin-right: 0; font-family: sans-serif; font-size: 14px; color: #2A2A2A; line-height: 1.8; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Ara Toplam:</span>
              <span>₺${subtotal}</span>
            </div>
            ${
              discount > 0
                ? `<div style="display: flex; justify-content: space-between; color: #15803d; font-weight: 500;">
                    <span>İndirim:</span>
                    <span>-₺${discount}</span>
                  </div>`
                : ""
            }
            <div style="display: flex; justify-content: space-between;">
              <span>Kargo Ücreti:</span>
              <span>${shippingFee === 0 ? "Ücretsiz" : `₺${shippingFee}`}</span>
            </div>
            ${
              (total - (subtotal - discount + shippingFee)) > 0
                ? `<div style="display: flex; justify-content: space-between; color: #b91c1c; font-weight: 500;">
                    <span>Kapıda Ödeme Bedeli:</span>
                    <span>+₺${total - (subtotal - discount + shippingFee)}</span>
                  </div>`
                : ""
            }
            <div style="border-top: 1px solid #EDE5D0; margin: 10px 0; padding-top: 10px; display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; color: #0D0D0D;">
              <span>Toplam:</span>
              <span style="color: #8B6914;">₺${total}</span>
            </div>
          </div>

          <!-- Address Recap -->
          <div style="border-top: 1px solid #EDE5D0; padding-top: 20px;">
            <h3 style="font-family: 'Playfair Display', serif; color: #0D0D0D; font-size: 14px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;">
              Teslimat ve Fatura Adresi
            </h3>
            <p style="font-size: 13px; color: #2A2A2A; line-height: 1.5; margin: 0;">
              ${customer.name}<br/>
              ${customer.address}<br/>
              ${customer.district} / ${customer.city}<br/>
              Telefon: ${customer.phone}
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #FAF7F0; padding: 20px; text-align: center; border-top: 1px solid #EDE5D0;">
          <p style="font-size: 11px; color: #666666; margin: 0;">
            Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
          <p style="font-size: 11px; color: #D4AF37; margin: 5px 0 0 0; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">
            Real Dekant — Görünmez Ama Unutulmaz
          </p>
        </div>

      </div>
    </div>
  `;
}
