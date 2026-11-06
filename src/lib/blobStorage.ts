/**
 * Server-Side Vercel Blob Integration (Images + JSON State Persistence)
 * - Uses `process.env.BLOB_READ_WRITE_TOKEN` strictly on the server.
 * - Allows the entire site (photos + messages + moderation + admin changes)
 *   to work 100% on Vercel (Vercel Hobby + Vercel Blob Free) WITHOUT Supabase.
 * - Falls back to local `.data/cms-state.json` in development and static GitHub fixtures.
 */

export function isVercelBlobConfigured(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return Boolean(token && token.startsWith("vercel_blob_rw_"));
}

export async function uploadDataUrlToVercelBlob(
  pathname: string,
  dataUrl: string
): Promise<{ url: string; storageMode: "vercel-blob" | "static-memory" }> {
  if (!isVercelBlobConfigured() || !dataUrl.startsWith("data:")) {
    return { url: dataUrl, storageMode: "static-memory" };
  }

  try {
    const [meta, base64Data] = dataUrl.split(",");
    const contentTypeMatch = meta.match(/data:([^;]+);base64/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : "image/webp";
    const binary = Buffer.from(base64Data, "base64");

    const cleanPath = pathname.replace(/^\/+/, "");
    const response = await fetch(`https://blob.vercel-storage.com/${cleanPath}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        "x-api-version": "7",
        "x-content-type": contentType,
      },
      body: binary,
    });

    if (!response.ok) {
      return { url: dataUrl, storageMode: "static-memory" };
    }

    const result = (await response.json()) as { url?: string };
    return {
      url: result.url || dataUrl,
      storageMode: result.url ? "vercel-blob" : "static-memory",
    };
  } catch {
    return { url: dataUrl, storageMode: "static-memory" };
  }
}

const CMS_STATE_BLOB_KEY = "cambridge-1996/cms-state.json";

export async function saveJsonStateToVercelBlob(
  stateData: unknown
): Promise<boolean> {
  if (!isVercelBlobConfigured()) return false;
  try {
    const response = await fetch(
      `https://blob.vercel-storage.com/${CMS_STATE_BLOB_KEY}`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          "x-api-version": "7",
          "x-content-type": "application/json; charset=utf-8",
          "x-add-random-suffix": "0",
          "x-cache-control-max-age": "0",
        },
        body: JSON.stringify(stateData),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function loadJsonStateFromVercelBlob<T>(): Promise<T | null> {
  if (!isVercelBlobConfigured()) return null;
  try {
    const listRes = await fetch(
      `https://blob.vercel-storage.com?prefix=${encodeURIComponent(
        CMS_STATE_BLOB_KEY
      )}&limit=1`,
      {
        headers: {
          authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          "x-api-version": "7",
        },
        cache: "no-store",
      }
    );
    if (!listRes.ok) return null;
    const listJson = (await listRes.json()) as {
      blobs?: Array<{ url: string; pathname: string }>;
    };
    const match = listJson.blobs?.find(
      (b) => b.pathname === CMS_STATE_BLOB_KEY
    );
    if (!match?.url) return null;

    const dataRes = await fetch(match.url, { cache: "no-store" });
    if (!dataRes.ok) return null;
    return (await dataRes.json()) as T;
  } catch {
    return null;
  }
}
