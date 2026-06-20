import { MetadataRoute } from "next";
import { getDocuments, where } from "@/lib/firebase/firestore";
import { COLLECTIONS } from "@/lib/firebase/firestore";
import type { Product } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realdekant.com";

  // Base static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  try {
    // Fetch products dynamically from Firestore with filter matching security rules
    const publishedProducts = await getDocuments<Product>(COLLECTIONS.PRODUCTS, [
      where("isPublished", "==", true),
    ]);

    const productRoutes = publishedProducts.map((product) => {
      let lastModDate = new Date();
      if (product.updatedAt) {
        if (typeof product.updatedAt.toDate === "function") {
          lastModDate = product.updatedAt.toDate();
        } else if (typeof (product.updatedAt as unknown as { seconds: number }).seconds === "number") {
          lastModDate = new Date((product.updatedAt as unknown as { seconds: number }).seconds * 1000);
        }
      }
      return {
        url: `${baseUrl}/shop/${product.slug}`,
        lastModified: lastModDate,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

    return [...routes, ...productRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return routes;
  }
}
