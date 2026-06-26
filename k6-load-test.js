import http from "k6/http";
import { check, sleep } from "k6";

// ─────────────────────────────────────────────────────────
//  CONFIG — Change BASE_URL to your deployed domain
//  For local testing:  http://localhost:3000
// ─────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3000";

export const options = {
  // 500 users start at the same time
  vus: 200,

  // Each user runs the default function once then exits
  iterations: 200,

  // Safety net — abort if the test runs longer than 2 min
  duration: "2m",

  // Thresholds: fail the test if > 5% of requests are NOT 200 or p(95) > 3s
  thresholds: {
    http_req_failed: ["rate<0.05"],          // < 5% errors
    http_req_duration: ["p(95)<3000"],        // 95% of requests < 3s
  },
};

// ─────────────────────────────────────────────────────────
//  MAIN TEST — simulates one user's browsing and checkout session
// ─────────────────────────────────────────────────────────
export default function () {
  // 1. Visit the Homepage
  const resHome = http.get(`${BASE_URL}/`, {
    tags: { page: "Home" },
  });
  check(resHome, {
    "Home → status is 200": (r) => r.status === 200,
    "Home → responded in < 3s": (r) => r.timings.duration < 3000,
  });

  // Wait 1-2 seconds (simulates reading / browsing)
  sleep(Math.random() + 1);

  // 2. Open Shop Page
  const resShop = http.get(`${BASE_URL}/shop`, {
    tags: { page: "Shop" },
  });
  check(resShop, {
    "Shop → status is 200": (r) => r.status === 200,
    "Shop → responded in < 3s": (r) => r.timings.duration < 3000,
  });

  // Wait 1-2 seconds
  sleep(Math.random() + 1);

  // 3. Open Product Detail Page (Creed Aventus)
  const resProduct = http.get(`${BASE_URL}/shop/creed-aventus`, {
    tags: { page: "Product Detail" },
  });
  check(resProduct, {
    "Product Detail → status is 200": (r) => r.status === 200,
    "Product Detail → responded in < 3s": (r) => r.timings.duration < 3000,
  });

  // Wait 1-2 seconds
  sleep(Math.random() + 1);

  // 4. Validate Coupon (simulates entering coupon on checkout page)
  const couponPayload = JSON.stringify({
    code: "WELCOME10",
    cartItems: [
      {
        productId: "aventus",
        sku: "CRE-AVE",
        perfumeName: "Aventus",
        brand: "Creed",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop",
        size: "5ml",
        qty: 1,
        price: 290,
        slug: "creed-aventus"
      }
    ],
    locale: "tr"
  });

  const resCoupon = http.post(`${BASE_URL}/api/validate-coupon`, couponPayload, {
    headers: { "Content-Type": "application/json" },
    tags: { page: "Validate Coupon API" },
  });
  check(resCoupon, {
    "Validate Coupon → status is 200": (r) => r.status === 200,
    "Validate Coupon → responded in < 3s": (r) => r.timings.duration < 3000,
  });

  // Wait 1-2 seconds
  sleep(Math.random() + 1);

  // 5. Submit Order (Create Order API)
  const orderPayload = JSON.stringify({
    customer: {
      name: `K6 User ${__VU}-${__ITER}`,
      phone: "5551234567",
      email: `k6-user-${__VU}-${__ITER}@example.com`,
      city: "İstanbul",
      district: "Şişli",
      address: "Mecidiyeköy, Load Test Street No.1"
    },
    items: [
      {
        productId: "aventus",
        perfumeName: "Aventus",
        brand: "Creed",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop",
        size: "5ml",
        qty: 1,
        price: 290,
        slug: "creed-aventus"
      }
    ],
    subtotal: 290,
    shippingFee: 50,
    discount: 0,
    total: 340,
    paymentMethod: "whatsapp",
    couponCode: null,
    userId: null,
    locale: "tr"
  });

  const resOrder = http.post(`${BASE_URL}/api/create-order`, orderPayload, {
    headers: { "Content-Type": "application/json" },
    tags: { page: "Create Order API" },
  });
  check(resOrder, {
    "Create Order → status is 200": (r) => r.status === 200,
    "Create Order → responded in < 3s": (r) => r.timings.duration < 3000,
  });
}
