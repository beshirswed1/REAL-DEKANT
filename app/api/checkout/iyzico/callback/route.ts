// app/api/checkout/iyzico/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import iyzico from "@/lib/iyzico";
import * as admin from "firebase-admin";

interface IyzicoRetrieveResponse {
  status: string;
  paymentStatus?: string;
  paymentId?: string;
  basketId: string;
  errorMessage?: string;
  price?: string;
  paidPrice?: string;
  buyer?: {
    name?: string;
    surname?: string;
    email?: string;
    gsmNumber?: string;
    city?: string;
    registrationAddress?: string;
  };
}

interface CustomerEmailData {
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address: string;
}

interface ItemEmailData {
  brand: string;
  perfumeName: string;
  size: string;
  quantity?: number;
  qty?: number;
  unitPrice?: number;
  price?: number;
}

export async function POST(req: NextRequest) {
  let orderId = "";
  try {
    // 1. Retrieve the token from URL-encoded form data (iyzico sends callback as form POST)
    const formData = await req.formData();
    const token = formData.get("token") as string;

    if (!token) {
      console.error("iyzico callback error: No token received in body.");
      return redirectWithStatus(req, "fail", "Ödeme jetonu (token) alınamadı.");
    }

    // 2. Call iyzico API to retrieve the payment status
    const iyzicoResult = await new Promise<IyzicoRetrieveResponse>((resolve, reject) => {
      iyzico.checkoutForm.retrieve({ locale: "tr", token }, (err: Error | null, result: IyzicoRetrieveResponse) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!iyzicoResult || iyzicoResult.status !== "success") {
      console.error("iyzico payment verification failed:", iyzicoResult);
      return redirectWithStatus(
        req,
        "fail",
        iyzicoResult?.errorMessage || "Ödeme iyzico tarafından doğrulanamadı."
      );
    }

    // 3. Check if payment was successful
    orderId = iyzicoResult.basketId;
    const paymentStatus = iyzicoResult.paymentStatus; // SUCCESS or FAILURE

    if (paymentStatus !== "SUCCESS") {
      console.error(`iyzico payment failed for order ${orderId}. Status: ${paymentStatus}`);
      return redirectWithStatus(
        req,
        "fail",
        iyzicoResult?.errorMessage || "Ödeme işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin."
      );
    }

    const paymentId = iyzicoResult.paymentId;

    // 4. Update the order in Firestore using Firebase Admin SDK
    if (adminDb) {
      const orderRef = adminDb.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();

      if (orderSnap.exists) {
        // Update payment status to paid
        await orderRef.update({
          paymentStatus: "paid",
          paymentId: paymentId || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const orderData = orderSnap.data();

        // 5. Send order confirmation email by writing to the /mail collection
        if (orderData) {
          const mailRef = adminDb.collection("mail").doc(orderId);
          const emailHtml = generateEmailHtml(
            orderId,
            orderData.customer,
            orderData.items,
            orderData.subtotal,
            orderData.discount,
            orderData.shippingFee,
            orderData.total
          );

          await mailRef.set({
            to: orderData.customer.email,
            message: {
              subject: `Siparişiniz Alındı - ${orderId}`,
              html: emailHtml,
            },
          });
        }
      } else {
        console.warn(`Order ${orderId} does not exist in database, creating a recovery order.`);
        // Reconstruct order from iyzico response if needed
        await orderRef.set({
          orderId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          customer: {
            name: iyzicoResult.buyer?.name + " " + iyzicoResult.buyer?.surname,
            email: iyzicoResult.buyer?.email,
            phone: iyzicoResult.buyer?.gsmNumber || "",
            city: iyzicoResult.buyer?.city || "",
            district: "",
            address: iyzicoResult.buyer?.registrationAddress || "",
          },
          items: [], // Re-creating exact items can be done by parsing basket items
          subtotal: parseFloat(iyzicoResult.price || "0"),
          shippingFee: 0,
          discount: 0,
          total: parseFloat(iyzicoResult.paidPrice || "0"),
          paymentMethod: "credit_card",
          paymentStatus: "paid",
          paymentId,
          orderStatus: "pending",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } else {
      console.warn("Firebase Admin SDK is not initialized. Order was not updated to 'paid' in DB, but payment succeeded.");
    }

    // 6. Redirect to checkout page with success parameters
    return redirectWithStatus(req, "success", "", orderId);

  } catch (error: unknown) {
    const err = error as Error;
    console.error("iyzico callback handler error:", err);
    return redirectWithStatus(
      req,
      "fail",
      err?.message || "Ödeme işlemi tamamlanırken beklenmedik bir hata oluştu."
    );
  }
}

// Helper function to build a browser redirect response in Next.js App API Routes
function redirectWithStatus(req: NextRequest, status: "success" | "fail", errorMsg = "", orderId = "") {
  const origin = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const redirectUrl = new URL(`${origin}/checkout`, origin);
  redirectUrl.searchParams.set("status", status);
  if (orderId) {
    redirectUrl.searchParams.set("orderId", orderId);
  }
  if (errorMsg) {
    redirectUrl.searchParams.set("error", errorMsg);
  }

  // Generate a clean redirect response using NextResponse.redirect
  return NextResponse.redirect(redirectUrl.toString(), 303);
}

// Generate luxury invoice HTML email
function generateEmailHtml(
  orderId: string,
  customer: CustomerEmailData,
  items: ItemEmailData[],
  subtotal: number,
  discount: number,
  shippingFee: number,
  total: number
): string {
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
        ${item.quantity || item.qty || 0}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EDE5D0; font-family: sans-serif; font-size: 14px; color: #1A1A1A; text-align: right;">
        ₺${item.unitPrice || item.price || 0}
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
            Siparişiniz başarıyla alınmıştır. Ödemeniz iyzico ile güvenli bir şekilde doğrulanmıştır. En kısa sürede kargoya verilecektir.
          </p>

          <!-- Order Summary Badge -->
          <div style="background-color: #FAF7F0; border: 1px solid #EDE5D0; padding: 15px 20px; border-radius: 2px; margin-bottom: 25px;">
            <p style="margin: 0; font-size: 13px; color: #1A1A1A;">
              Sipariş Numarası: <strong style="color: #8B6914;">${orderId}</strong>
            </p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #1A1A1A;">
              Ödeme Yöntemi: <strong>Kredi Kartı (iyzico)</strong>
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
