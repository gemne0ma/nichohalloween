import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generatePresignedUploadUrl, buildR2Key } from "@/lib/r2";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];
const ALLOWED_CATEGORIES = ["gallery", "sponsor", "auction", "vendor", "other"];

/**
 * POST /api/upload/presign
 *
 * Returns a presigned PUT URL so the browser can upload directly to R2.
 * Auth-gated: only admin users can request upload URLs.
 *
 * Body: { filename, fileType, fileSize, category, festivalYear }
 * Response: { presignedUrl, r2Key }
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { filename, fileType, fileSize, category, festivalYear } = body;

  // Validate required fields
  if (!filename || !fileType || !fileSize || !category || !festivalYear) {
    return NextResponse.json(
      { error: "Missing required fields: filename, fileType, fileSize, category, festivalYear" },
      { status: 400 }
    );
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(fileType)) {
    return NextResponse.json(
      { error: `File type not allowed. Accepted: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate file size
  if (fileSize > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum: ${MAX_SIZE / 1024 / 1024}MB` },
      { status: 400 }
    );
  }

  // Validate category
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `Invalid category. Accepted: ${ALLOWED_CATEGORIES.join(", ")}` },
      { status: 400 }
    );
  }

  // Build the R2 key and generate presigned URL
  const r2Key = buildR2Key(festivalYear, category, filename);
  const presignedUrl = await generatePresignedUploadUrl(r2Key, fileType);

  return NextResponse.json({ presignedUrl, r2Key });
}
