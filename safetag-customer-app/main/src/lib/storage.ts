export async function uploadPhoto(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<{ storageKey: string; url: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`photos/${Date.now()}-${filename}`, file, {
        access: "public",
        contentType: mimeType,
        token,
      });
      return { storageKey: blob.pathname, url: blob.url };
    } catch (err) {
      console.error("[storage] Vercel Blob upload failed:", err);
    }
  }
  const b64 = file.toString("base64");
  return {
    storageKey: `local/${Date.now()}-${filename}`,
    url: `data:${mimeType};base64,${b64}`,
  };
}
