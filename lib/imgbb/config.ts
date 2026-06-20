// lib/imgbb/config.ts
// ImgBB upload helper (client-side upload using API key)

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY!;

export interface ImgBBUploadResult {
  id: string;
  url: string;
  display_url: string;
  thumb_url: string;
  delete_url: string;
}

/**
 * Upload a File object to ImgBB.
 * Returns url, display_url, thumb_url, delete_url on success.
 */
export async function uploadToImgBB(
  file: File,
  name?: string
): Promise<ImgBBUploadResult> {
  const formData = new FormData();
  formData.append("image", file);
  if (name) formData.append("name", name);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`ImgBB upload failed: ${response.statusText}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error("ImgBB upload failed: " + (json.error?.message || "Unknown error"));
  }

  return {
    id: json.data.id,
    url: json.data.display_url,          // high-res display URL
    display_url: json.data.display_url,
    thumb_url: json.data.thumb?.url || json.data.display_url,
    delete_url: json.data.delete_url,
  };
}

/**
 * Get an optimized image URL from an image value.
 * Works with both plain string URLs and objects like { url: string }.
 * ImgBB doesn't support on-the-fly transforms, so we just return the URL as-is.
 */
export function getOptimizedImage(
  image: string | { url: string } | undefined | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _preset: "thumb" | "card" | "full" | "og" = "full"
): string {
  const fallback =
    "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800";
  if (!image) return fallback;
  const url = typeof image === "string" ? image : image.url;
  if (!url) return fallback;
  return url;
}
