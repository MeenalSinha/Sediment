import { env } from "../config/env";

export interface UploadResult {
  url: string;
}

/**
 * Uploads a buffer (e.g. an artifact photo or restored-museum render) to whichever
 * storage provider is configured via STORAGE_PROVIDER, and returns its public URL.
 */
export async function uploadArtifactImage(
  fileName: string,
  buffer: Buffer,
  contentType: string,
): Promise<UploadResult> {
  if (env.storage.provider === "supabase") {
    return uploadToSupabase(fileName, buffer, contentType);
  }
  return uploadToCloudinary(fileName, buffer, contentType);
}

async function uploadToSupabase(fileName: string, buffer: Buffer, contentType: string): Promise<UploadResult> {
  const { url, serviceRoleKey, bucket } = env.storage.supabase;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }

  const uploadUrl = `${url}/storage/v1/object/${bucket}/${encodeURIComponent(fileName)}`;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!res.ok) {
    throw new Error(`Supabase upload failed: ${res.status} ${await res.text()}`);
  }

  return { url: `${url}/storage/v1/object/public/${bucket}/${fileName}` };
}

async function uploadToCloudinary(fileName: string, buffer: Buffer, contentType: string): Promise<UploadResult> {
  const { cloudName, apiKey, apiSecret } = env.storage.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).");
  }

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: contentType }), fileName);
  form.append("api_key", apiKey);
  form.append("upload_preset", "sediment_unsigned"); // configure this preset in your Cloudinary dashboard

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { secure_url: string };
  return { url: json.secure_url };
}
