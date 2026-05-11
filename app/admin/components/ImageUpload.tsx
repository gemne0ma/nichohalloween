"use client";

import { useState, useRef, useCallback } from "react";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];

type UploadResult = {
  id: string;
  publicUrl: string;
  r2Key: string;
};

type ImageUploadProps = {
  category: "gallery" | "sponsor" | "auction" | "vendor" | "other";
  festivalYear?: number;
  onUploadComplete: (result: UploadResult) => void;
  /** Show existing image if editing */
  existingUrl?: string;
  /** Compact mode for inline use in forms */
  compact?: boolean;
  /** Custom label */
  label?: string;
};

type UploadState = "idle" | "stripping" | "signing" | "uploading" | "saving" | "done" | "error";

/**
 * Reusable image upload component.
 *
 * Flow:
 * 1. User picks a file
 * 2. Client strips EXIF data (canvas redraw for images)
 * 3. Client requests a presigned URL from /api/upload/presign
 * 4. Client PUTs the file directly to R2
 * 5. Client calls /api/upload/save to create the media record
 * 6. onUploadComplete fires with the public URL
 */
export default function ImageUpload({
  category,
  festivalYear = 2026,
  onUploadComplete,
  existingUrl,
  compact = false,
  label = "Upload image",
}: ImageUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      // Validate type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("File type not supported. Use JPG, PNG, WebP, HEIC, or PDF.");
        return;
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        setError(`File too large. Maximum ${MAX_SIZE / 1024 / 1024}MB.`);
        return;
      }

      try {
        // Step 1: Strip EXIF (images only, skip PDFs)
        let processedFile = file;
        if (file.type.startsWith("image/") && file.type !== "image/heic") {
          setState("stripping");
          processedFile = await stripExif(file);
        }

        // Show preview
        if (processedFile.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
          reader.readAsDataURL(processedFile);
        }

        // Step 2: Get presigned URL
        setState("signing");
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileType: processedFile.type,
            fileSize: processedFile.size,
            category,
            festivalYear,
          }),
        });

        if (!presignRes.ok) {
          const err = await presignRes.json();
          throw new Error(err.error || "Failed to get upload URL");
        }

        const { presignedUrl, r2Key } = await presignRes.json();

        // Step 3: Upload directly to R2
        setState("uploading");
        setProgress(0);

        // Use XMLHttpRequest for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setProgress(Math.round((ev.loaded / ev.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", processedFile.type);
          xhr.send(processedFile);
        });

        // Step 4: Save media record
        setState("saving");
        const saveRes = await fetch("/api/upload/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            r2Key,
            filename: file.name,
            fileType: processedFile.type,
            fileSize: processedFile.size,
            category,
            festivalYear,
          }),
        });

        if (!saveRes.ok) {
          const err = await saveRes.json();
          throw new Error(err.error || "Failed to save file record");
        }

        const { id, publicUrl } = await saveRes.json();
        setState("done");
        onUploadComplete({ id, publicUrl, r2Key });
      } catch (err) {
        setState("error");
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [category, festivalYear, onUploadComplete]
  );

  const stateLabels: Record<UploadState, string> = {
    idle: "",
    stripping: "Removing location data...",
    signing: "Preparing upload...",
    uploading: `Uploading... ${progress}%`,
    saving: "Saving...",
    done: "Uploaded",
    error: "Failed",
  };

  const isProcessing = !["idle", "done", "error"].includes(state);

  if (compact) {
    return (
      <div className="space-y-2">
        <label className="block font-mono text-xs uppercase tracking-wider text-ink-soft">
          {label}
        </label>

        {previewUrl && (
          <div className="relative w-20 h-20 rounded overflow-hidden border border-mist">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-3 py-1.5 text-sm font-body bg-bone border border-mist rounded hover:bg-paper-deep transition-colors disabled:opacity-50"
          >
            {previewUrl ? "Replace" : "Choose file"}
          </button>
          {isProcessing && (
            <span className="text-sm font-mono text-moss">{stateLabels[state]}</span>
          )}
          {state === "done" && (
            <span className="text-sm font-mono text-forest">Uploaded</span>
          )}
        </div>

        {error && <p className="text-sm text-rust">{error}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  // Full-size version (for the media library upload form)
  return (
    <div className="space-y-4">
      <label className="block font-mono text-xs uppercase tracking-wider text-ink-soft">
        {label}
      </label>

      {/* Drop zone */}
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isProcessing
            ? "border-moss/30 bg-paper-deep/50 cursor-wait"
            : "border-mist hover:border-moss hover:bg-paper-deep/30"
        }`}
      >
        {previewUrl ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded"
            />
            {!isProcessing && (
              <p className="text-sm font-body text-moss">Click to replace</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="w-10 h-10 mx-auto text-mist"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            <p className="font-body text-ink-soft">
              Click to select a file
            </p>
            <p className="text-xs font-mono text-moss">
              JPG, PNG, WebP, HEIC, PDF. Max 25MB.
            </p>
          </div>
        )}

        {/* Progress overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-paper/80 rounded-lg flex flex-col items-center justify-center">
            <div className="w-48 h-2 bg-mist/30 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-rust transition-all duration-300 rounded-full"
                style={{
                  width: state === "uploading" ? `${progress}%` : "100%",
                  animation: state !== "uploading" ? "pulse 1.5s ease-in-out infinite" : undefined,
                }}
              />
            </div>
            <p className="text-sm font-mono text-moss">{stateLabels[state]}</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-rust">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

/**
 * Strip EXIF data from an image by drawing it to a canvas and re-exporting.
 * This removes GPS coordinates, camera model, timestamps, etc.
 * Canvas.toBlob() produces a clean file with no metadata.
 */
async function stripExif(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Can't strip, return original
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0);

      // Determine output format. WebP stays WebP, everything else becomes JPEG or PNG.
      let outputType = file.type;
      if (outputType === "image/heic") outputType = "image/jpeg";

      const quality = outputType === "image/png" ? undefined : 0.92;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: outputType }));
        },
        outputType,
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image for EXIF stripping"));
    img.src = URL.createObjectURL(file);
  });
}
