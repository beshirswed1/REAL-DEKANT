// app/api/checkout/iyzico/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import iyzico from "@/lib/iyzico";

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
  qty: number;
  price: number;
}

interface BasketItem {
  id: string;
  name: string;
  category1: string;
  itemType: string;
  price: string;
}

interface IyzicoInitializeResponse {
  status: string;
  token?: string;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  errorMessage?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      couponCode,
      userId,
    } = body as {
      customer: CheckoutCustomer;
      items: CheckoutItem[];
      subtotal: number;
      shippingFee: number;
      discount: number;
      total: number;
      couponCode: string | null;
      userId: string | null;
    };

    // 1. Basic validation
    if (!customer || !customer.name || !customer.phone || !customer.email || !customer.city || !customer.district || !customer.address) {
      return NextResponse.json({ success: false, message: "Eksik teslimat bilgileri." }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Sepetiniz boş." }, { status: 400 });
    }

    // 2. Generate a unique Order ID
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randPart = Math.random().toString(36).toUpperCase().slice(2, 6);
    const orderId = `RD-${datePart}-${randPart}`;

    // 3. Save pending order in Firestore (server-side, bypass rules if adminDb is available)
    if (adminDb) {
      const orderRef = adminDb.collection("orders").doc(orderId);
      await orderRef.set({
        orderId,
        userId: userId || null,
        createdAt: new Date(),
        customer,
        items: items.map((item) => ({
          productId: item.productId,
          perfumeName: item.perfumeName,
          brand: item.brand,
          image: item.image,
          size: item.size,
          quantity: item.qty,
          unitPrice: item.price,
        })),
        subtotal,
        shippingFee,
        discount,
        total,
        paymentMethod: "credit_card",
        paymentStatus: "pending_payment", // Waiting for iyzico callback
        orderStatus: "pending",
        appliedCoupon: couponCode || null,
        trackingNumber: null,
        updatedAt: new Date(),
      });
    } else {
      console.warn("Firebase Admin SDK is not initialized. Pending order will not be saved on server before payment. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is configured in production.");
    }

    // 4. Split Full Name into First Name & Last Name (iyzico requirement)
    const nameParts = customer.name.trim().split(/\s+/);
    const surname = nameParts.length > 1 ? nameParts.pop() || "User" : "User";
    const name = nameParts.join(" ") || "Customer";

    // 5. Clean phone number (iyzico requires GSM number formatted properly, e.g. +905XXXXXXXXX)
    let phoneClean = customer.phone.replace(/\D/g, "");
    if (phoneClean.startsWith("0")) {
      phoneClean = phoneClean.substring(1);
    }
    if (!phoneClean.startsWith("90")) {
      phoneClean = "90" + phoneClean;
    }
    const phoneFormatted = "+" + phoneClean;

    // 6. Get absolute callback URL dynamically
    const origin = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const callbackUrl = `${origin}/api/checkout/iyzico/callback`;

    // 7. Proportional coupon discount distribution across basket items
    // Sum of basketItems.price * quantity + shippingFee must exactly match the paidPrice (total)
    const totalDiscount = discount;
    const basketItemsList: BasketItem[] = [];

    // We split quantities into single basket items (1 unit each) to avoid rounding issues
    items.forEach((item) => {
      for (let i = 0; i < item.qty; i++) {
        // Calculate item share of discount
        // item discount share = (itemPrice / subtotal) * totalDiscount
        const itemDiscount = subtotal > 0 ? (item.price / subtotal) * totalDiscount : 0;
        const finalPrice = Math.max(0.1, item.price - itemDiscount);

        basketItemsList.push({
          id: `${item.productId}_${i}`,
          name: `${item.brand} - ${item.perfumeName} (${item.size})`,
          category1: "Perfume",
          itemType: "PHYSICAL",
          price: finalPrice.toFixed(2),
        });
      }
    });

    // Add shipping fee as a virtual basket item if greater than 0
    if (shippingFee > 0) {
      basketItemsList.push({
        id: "shipping_fee",
        name: "Kargo Ücreti",
        category1: "Shipping",
        itemType: "VIRTUAL",
        price: shippingFee.toFixed(2),
      });
    }

    // Calculate total price of basket items to verify it matches
    const calculatedPaidPrice = basketItemsList.reduce((sum, item) => sum + parseFloat(item.price), 0);

    // 8. Construct iyzico API Request
    const requestPayload = {
      locale: "tr",
      conversationId: orderId,
      price: subtotal.toFixed(2),
      paidPrice: calculatedPaidPrice.toFixed(2), // Matches exactly the sum of basket items
      currency: "TRY",
      basketId: orderId,
      paymentGroup: "PRODUCT",
      callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9, 12],
      buyer: {
        id: userId || "guest_" + Date.now(),
        name,
        surname,
        gsmNumber: phoneFormatted,
        email: customer.email,
        identityNumber: "11111111111", // Default individual ID
        registrationAddress: customer.address,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
        city: customer.city,
        country: "Turkey",
      },
      shippingAddress: {
        contactName: customer.name,
        city: customer.city,
        country: "Turkey",
        address: `${customer.address} - ${customer.district}`,
      },
      billingAddress: {
        contactName: customer.name,
        city: customer.city,
        country: "Turkey",
        address: `${customer.address} - ${customer.district}`,
      },
      basketItems: basketItemsList,
    };

    // 9. Call iyzico API using a wrapped Promise
    const iyzicoResult = await new Promise<IyzicoInitializeResponse>((resolve, reject) => {
      iyzico.checkoutFormInitialize.create(requestPayload, (err: Error | null, result: IyzicoInitializeResponse) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (iyzicoResult && iyzicoResult.status === "success") {
      return NextResponse.json({
        success: true,
        token: iyzicoResult.token,
        checkoutFormContent: iyzicoResult.checkoutFormContent,
        paymentPageUrl: iyzicoResult.paymentPageUrl,
      });
    }

    console.error("iyzico initialization failed:", iyzicoResult);
    return NextResponse.json({
      success: false,
      message: iyzicoResult?.errorMessage || "iyzico ödeme formu başlatılamadı.",
    }, { status: 500 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("iyzico initialize API error:", err);
    return NextResponse.json({
      success: false,
      message: err?.message || "Sunucu hatası oluştu.",
    }, { status: 500 });
  }
}
