/**
 * seed-products.js
 * ────────────────────────────────────────────────────────────────
 * Reads catalog_realdekant.json and seeds every product into
 * Firestore → "products" collection.
 *
 * Each document matches the exact schema the admin dashboard expects,
 * so you can edit images, tags, notes, etc. from the admin panel
 * as if you added them manually.
 *
 * Usage:
 *   node seed-products.js
 *
 * Requirements:
 *   - FIREBASE_SERVICE_ACCOUNT_KEY must be set in .env.local
 *     (or you can place a serviceAccountKey.json in the project root)
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

// ─── 1. Load service account ─────────────────────────────────────────────────
let serviceAccount;

// Try .env.local first
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");
  for (const line of lines) {
    if (line.startsWith("FIREBASE_SERVICE_ACCOUNT_KEY")) {
      // Extract value after the first '='
      let value = line.substring(line.indexOf("=") + 1).trim();
      // Strip surrounding single or double quotes
      if ((value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      try {
        serviceAccount = JSON.parse(value);
      } catch {
        console.error("❌ Could not parse FIREBASE_SERVICE_ACCOUNT_KEY from .env.local");
      }
      break;
    }
  }
}

// Fallback: serviceAccountKey.json in project root
if (!serviceAccount) {
  const saPath = path.join(__dirname, "serviceAccountKey.json");
  if (fs.existsSync(saPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf-8"));
  }
}

if (!serviceAccount) {
  console.error(
    "❌ Service account not found.\n" +
      "   Set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local or place serviceAccountKey.json in root."
  );
  process.exit(1);
}

// ─── 2. Init Firebase Admin ──────────────────────────────────────────────────
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// ─── 3. Turkish-safe slug generator (same as route.ts) ───────────────────────
function generateSlug(brand, name) {
  const turkishMap = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
  };
  const text = `${brand} ${name}`.toLowerCase();
  return text
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => turkishMap[c] || c)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── 4. Gender mapping ───────────────────────────────────────────────────────
function mapGender(g) {
  const map = { M: "male", F: "female", U: "unisex" };
  return map[g] || "unisex";
}

// ─── 5. Main ─────────────────────────────────────────────────────────────────
async function seed() {
  // Load catalog
  const catalogPath = path.join(__dirname, "catalog_realdekant.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

  console.log(`📦 Found ${catalog.length} products in catalog.\n`);

  // Track slugs for uniqueness
  const usedSlugs = new Set();

  let success = 0;
  let skipped = 0;

  for (const item of catalog) {
    // Check if product already exists by SKU
    const existing = await db
      .collection("products")
      .where("sku", "==", item.sku)
      .limit(1)
      .get();

    if (!existing.empty) {
      console.log(`⏭️  SKU ${item.sku} already exists → skipping`);
      skipped++;
      continue;
    }

    // Generate unique slug
    let slug = generateSlug(item.brand, item.perfumeName);
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    usedSlugs.add(slug);

    // Build full product document (matches admin dashboard structure exactly)
    const productData = {
      sku: item.sku || "",
      brand: item.brand || "",
      perfumeName: item.perfumeName || "",
      slug: slug,
      gender: mapGender(item.gender),
      concentration: item.concentration || "EDP",
      prices: item.prices || { "3ml": 0, "5ml": 0, "10ml": 0 },
      compareAtPrices: item.compareAtPrices || {},
      availability: item.availability || "in_stock",
      scentFamily: item.scentFamily || [],
      notes: item.notes || { top: [], heart: [], base: [] },
      longevity: item.longevity || "",
      sillage: item.sillage || "",
      season: item.season || [],
      timeOfDay: item.timeOfDay || [],
      images: item.images || [],
      isPublished: item.isPublished ?? false,
      isFeatured: item.isFeatured ?? false,
      isNew: item.isNew ?? false,
      newUntil: item.isNew ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      stock: item.stock ?? 0,
      soldCount: item.soldCount ?? 0,
      tags: item.tags || [],
      adminNote: item.adminNote || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("products").add(productData);
    console.log(`✅ ${item.brand} – ${item.perfumeName}  →  ${docRef.id}`);
    success++;
  }

  console.log(`\n────────────────────────────────────────`);
  console.log(`✅ Seeded: ${success}   ⏭️ Skipped: ${skipped}   📦 Total: ${catalog.length}`);
  console.log(`────────────────────────────────────────\n`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
