import { signCloudinaryUpload } from "@workspace/api-client-react";

// Requests a signature from the API (auth attached automatically via the
// token getter) and uploads the file directly to Cloudinary. Returns the
// secure HTTPS URL of the uploaded asset.
export async function uploadToCloudinary(
  file: File,
  folder = "club-info",
): Promise<string> {
  const sign = await signCloudinaryUpload({ folder });

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error?.message ?? "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Cloudinary upload failed (${res.status})`);
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Cloudinary did not return a URL");
  }
  return data.secure_url;
}
