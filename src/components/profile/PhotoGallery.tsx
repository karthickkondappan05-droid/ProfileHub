import React, { useState, useEffect, useCallback } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ExternalLink,
  Check,
  User,
  Sparkles,
} from "lucide-react";
import { ProfilePhoto } from "../../types";

interface PhotoGalleryProps {
  photos: ProfilePhoto[];
  title?: string;
  isOwner?: boolean;
  onSetAvatar?: (url: string) => void;
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  title = "Photos & Media",
  isOwner = false,
  onSetAvatar,
  className = "",
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [avatarSetSuccess, setAvatarSetSuccess] = useState(false);

  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null));
    }
  }, [lightboxIndex, photos.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) =>
        prev !== null ? (prev - 1 + photos.length) % photos.length : null
      );
    }
  }, [lightboxIndex, photos.length]);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, handleNext, handlePrev, handleClose]);

  if (!photos || photos.length === 0) {
    return null;
  }

  const handleSetAvatar = (url: string) => {
    if (onSetAvatar) {
      onSetAvatar(url);
      setAvatarSetSuccess(true);
      setTimeout(() => setAvatarSetSuccess(false), 2000);
    }
  };

  return (
    <div className={`mt-10 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            {title}
          </h2>
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/30 dark:text-amber-300">
            {photos.length}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Click any photo to view full size
        </p>
      </div>

      {/* Photo Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, idx) => (
          <button
            key={photo.id || `photo-${idx}`}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100 text-left transition-all duration-300 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10 dark:border-zinc-800/80 dark:bg-zinc-900"
          >
            <img
              src={photo.url}
              alt={photo.caption || `Profile photo ${idx + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Gradient & Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Primary badge if applicable */}
            {photo.isPrimary && (
              <span className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-amber-500/90 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                <Sparkles className="h-2.5 w-2.5" />
                Featured
              </span>
            )}

            {/* Hover Caption / Expand Icon */}
            <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="text-[11px] font-medium text-white line-clamp-1 drop-shadow-sm">
                {photo.caption || `Photo ${idx + 1}`}
              </p>
              <div className="rounded-full bg-white/20 p-1 text-white backdrop-blur-xs">
                <Maximize2 className="h-3 w-3" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-all duration-300 animate-fadeIn"
          onClick={handleClose}
        >
          {/* Modal Container */}
          <div
            className="relative flex flex-col max-h-[92vh] max-w-5xl w-full rounded-3xl border border-zinc-700/60 bg-zinc-950 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-3.5 text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400">
                  Photo {lightboxIndex + 1} of {photos.length}
                </span>
                {activePhoto.isPrimary && (
                  <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isOwner && onSetAvatar && (
                  <button
                    type="button"
                    onClick={() => handleSetAvatar(activePhoto.url)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:text-amber-300"
                  >
                    {avatarSetSuccess ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Set as Avatar!</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5 text-amber-400" />
                        <span>Set as Avatar</span>
                      </>
                    )}
                  </button>
                )}

                <a
                  href={activePhoto.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white"
                  title="Open full resolution in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div className="relative flex flex-1 items-center justify-center min-h-[360px] max-h-[68vh] bg-black p-4 select-none overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || "Profile photo"}
                className="max-h-[64vh] max-w-full rounded-xl object-contain shadow-2xl transition-all"
              />

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-black/60 p-2.5 text-white backdrop-blur-md hover:bg-amber-500 hover:text-black hover:border-amber-500 transition shadow-lg"
                    title="Previous photo (Left arrow)"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-black/60 p-2.5 text-white backdrop-blur-md hover:bg-amber-500 hover:text-black hover:border-amber-500 transition shadow-lg"
                    title="Next photo (Right arrow)"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption Bar & Thumbnails */}
            <div className="border-t border-zinc-800/80 bg-zinc-950 p-4">
              {activePhoto.caption && (
                <p className="mb-3 text-center text-sm font-medium text-zinc-200">
                  {activePhoto.caption}
                </p>
              )}

              {/* Thumbnail Strip */}
              {photos.length > 1 && (
                <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id || `thumb-${idx}`}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border transition-all ${
                        idx === lightboxIndex
                          ? "border-amber-400 ring-2 ring-amber-400/40 scale-105"
                          : "border-zinc-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={p.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
