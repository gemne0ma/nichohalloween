import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getPublicUrl } from "@/lib/r2";

/**
 * POST /api/upload/save
 *
 * Called after the browser successfully uploads a file to R2.
 * Inserts a media record into the database and returns the public URL.
 *
 * Body: { r2Key, filename, fileType, fileSize, category, festivalYear, caption?, altText? }
 * Response: { id, publicUrl }
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { r2Key, filename, fileType, fileSize, category, festivalYear, caption, altText } = body;

  if (!r2Key || !filename || !fileType || !fileSize || !category || !festivalYear) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const [record] = await db
    .insert(media)
    .values({
      filename,
      r2Key,
      fileType,
      fileSize,
      uploadedBy: userId,
      festivalYear,
      category,
      caption: caption || null,
      altText: altText || null,
    })
    .returning({ id: media.id });

  const publicUrl = getPublicUrl(r2Key);

  return NextResponse.json({ id: record.id, publicUrl });
}
