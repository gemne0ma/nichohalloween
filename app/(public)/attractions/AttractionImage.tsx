"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  image?: string;
  // Extra photos shown alongside the cover when the lightbox is opened. The
  // card itself always shows `image`, so the grid stays uniform.
  extraImages?: string[];
  gradient: string;
  title: string;
};

export default function AttractionImage({
  image,
  extraImages,
  gradient,
  title,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!image) {
    return <div className={`aspect-[4/3] bg-gradient-to-br ${gradient}`} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Expand image: ${title}`}
        className="block w-full aspect-[4/3] bg-cover bg-center cursor-zoom-in"
        style={{ backgroundImage: `url(${image})` }}
      />

      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6 cursor-zoom-out"
          >
            {/* One photo fills the screen. Several sit side by side on
                desktop and stack on mobile, which beats a carousel when there
                are only two or three. */}
            <div
              className="flex flex-col md:flex-row items-center justify-center gap-4 max-h-[90vh] max-w-[92vw] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {[image, ...(extraImages ?? [])].map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={
                    extraImages?.length
                      ? `${title}, photo ${i + 1} of ${extraImages.length + 1}`
                      : title
                  }
                  className={
                    extraImages?.length
                      ? "max-h-[42vh] md:max-h-[80vh] max-w-full md:max-w-[45vw] object-contain"
                      : "max-h-[90vh] max-w-[90vw] object-contain"
                  }
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-paper font-mono text-sm uppercase tracking-[0.2em] px-4 py-2 border border-paper/40 hover:bg-paper hover:text-ink transition-colors"
            >
              Close
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
