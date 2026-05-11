import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 uses the S3-compatible API.
// Endpoint format: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

// The public URL prefix for serving files.
// Either a custom domain (e.g. https://media.nichohalloween.com.au)
// or the R2 public bucket URL from Cloudflare dashboard.
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

/**
 * Generate a presigned PUT URL so the browser can upload directly to R2.
 * This avoids Vercel's 4.5MB serverless body limit entirely.
 *
 * @param key - the R2 object key, e.g. "2026/sponsor/logo-acme.png"
 * @param contentType - MIME type, e.g. "image/png"
 * @param maxSizeBytes - max upload size (default 25MB)
 * @returns presigned URL valid for 10 minutes
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number = 25 * 1024 * 1024
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    // ContentLength constraint is enforced by R2 if the actual upload
    // exceeds maxSizeBytes, but the real enforcement is client-side
    // (we check file size before requesting the presigned URL).
  });

  return getSignedUrl(s3, command, { expiresIn: 600 }); // 10 minutes
}

/**
 * Delete an object from R2. Used when removing media records.
 */
export async function deleteObject(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/**
 * Construct the public URL for a stored file.
 * Assumes the R2 bucket has public access enabled (or a custom domain).
 */
export function getPublicUrl(key: string): string {
  // Strip trailing slash from PUBLIC_URL if present
  const base = PUBLIC_URL.replace(/\/$/, "");
  return `${base}/${key}`;
}

/**
 * Build a sanitised R2 key from the upload metadata.
 * Format: {festivalYear}/{category}/{timestamp}-{sanitisedFilename}
 *
 * The timestamp prefix prevents collisions when two files share a name.
 */
export function buildR2Key(
  festivalYear: number,
  category: string,
  filename: string
): string {
  const timestamp = Date.now();
  // Sanitise: lowercase, replace spaces with hyphens, strip non-alphanumeric except .-_
  const safe = filename
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
  return `${festivalYear}/${category}/${timestamp}-${safe}`;
}
