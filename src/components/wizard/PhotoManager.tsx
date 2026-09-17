import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Check,
  User,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { ProfilePhoto } from "../../types";
import { profileService } from "../../services/firebase/profileService";

interface PhotoManagerProps {
  photos: ProfilePhoto[];
  avatarUrl?: string;
  coverUrl?: string;
  onChange: (photos: ProfilePhoto[]) => void;
  onSetAvatar: (url: string) => void;
  onSetCover: (url: string) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos = [],
  avatarUrl,
  coverUrl,
  onChange,
  onSetAvatar,
  onSetCover,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [urlCaptionValue, setUrlCaptionValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle files selected (either via browse or drag-drop)
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setUploadError("Please select valid image files (JPEG, PNG, WEBP, GIF).");
      return;
    }

    if (photos.length + files.length > 20) {
      setUploadError("You can add up to 20 photos to your profile gallery.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const uploadedUrls = await profileService.uploadMultipleImages(files, "photos");
      const newPhotos: ProfilePhoto[] = uploadedUrls.map((url, idx) => ({
        id: `photo_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        url,
        caption: files[idx]?.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || "",
        isPrimary: photos.length === 0 && idx === 0,
        uploadedAt: new Date().toISOString(),
      }));

      const updated = [...photos, ...newPhotos];
      onChange(updated);

      // If no avatar is set yet, suggest setting the first uploaded as avatar
      if (!avatarUrl && newPhotos[0]?.url) {
        onSetAvatar(newPhotos[0].url);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload one or more photos.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // reset input so same file can be re-selected if deleted
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddFromUrl = () => {
    if (!urlInputValue.trim()) return;
    try {
      new URL(urlInputValue.trim());
    } catch {
      setUploadError("Please provide a valid image web URL.");
      return;
    }

    const newPhoto: ProfilePhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: urlInputValue.trim(),
      caption: urlCaptionValue.trim(),
      isPrimary: photos.length === 0,
      uploadedAt: new Date().toISOString(),
    };

    onChange([...photos, newPhoto]);
    setUrlInputValue("");
    setUrlCaptionValue("");
    setShowUrlInput(false);
    setUploadError("");
  };

  const handleRemovePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(
      photos.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const reordered = [...photos];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, removed);
    onChange(reordered);
  };

  const handleAddSamplePhotos = () => {
    const samples: ProfilePhoto[] = [
      {
        id: `sample_${Date.now()}_1`,
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
        caption: "Team architecture review and hackathon session",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: `sample_${Date.now()}_2`,
        url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
        caption: "Tech conference workshop keynote",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: `sample_${Date.now()}_3`,
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
        caption: "Dedicated development workstation setup",
        uploadedAt: new Date().toISOString(),
      },
    ];
    onChange([...photos, ...samples]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
            <Camera className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Profile Photo Gallery &amp; Showcase
          </label>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Add multiple photos (speaking events, workspace, projects, portraits). Max 20 photos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddSamplePhotos}
            className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            <Sparkles className="h-3 w-3" />
            Add Demo Photos
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <LinkIcon className="h-3 w-3" />
            {showUrlInput ? "Hide URL Input" : "Add by Image URL"}
          </button>
        </div>
      </div>

      {/* Error display */}
      {uploadError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:border-red-500/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* URL Input Form */}
      {showUrlInput && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/30 dark:bg-zinc-950/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Image Web URL (HTTPS)
              </label>
              <input
                type="url"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Photo Caption (Optional)
              </label>
              <input
                type="text"
                value={urlCaptionValue}
                onChange={(e) => setUrlCaptionValue(e.target.value)}
                placeholder="e.g. Speaking at DevOps Summit 2024"
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="rounded-xl px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddFromUrl}
              className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400"
            >
              Add Photo to Gallery
            </button>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
          dragOver
            ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/20"
            : "border-zinc-300 bg-zinc-50/70 hover:border-amber-400 hover:bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-600 dark:text-amber-400" />
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Uploading &amp; optimizing selected photos...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="rounded-xl bg-amber-100/80 p-2.5 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Drag and drop multiple photos here, or{" "}
              <span className="text-amber-600 underline dark:text-amber-400">browse files</span>
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Supports selecting multiple JPEG, PNG, WEBP, and GIF files simultaneously
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Photos Grid */}
      {photos.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold">
              Current Photos ({photos.length})
            </span>
            <span>Use controls to set avatar or banner</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => {
              const isAvatar = avatarUrl === photo.url;
              const isCover = coverUrl === photo.url;

              return (
                <div
                  key={photo.id}
                  className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
                >
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Profile photo"}
                      className="h-full w-full object-cover"
                    />

                    {/* Active Roles Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {isAvatar && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          <User className="h-2.5 w-2.5" /> Avatar
                        </span>
                      )}
                      {isCover && (
                        <span className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          <ImageIcon className="h-2.5 w-2.5" /> Banner
                        </span>
                      )}
                    </div>

                    {/* Reorder Buttons */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 p-0.5 backdrop-blur-xs">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, "left")}
                          title="Move left"
                          className="rounded p-1 text-white hover:bg-white/20"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                      )}
                      {index < photos.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, "right")}
                          title="Move right"
                          className="rounded p-1 text-white hover:bg-white/20"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Caption Input */}
                  <div className="mt-2.5 flex-1">
                    <input
                      type="text"
                      value={photo.caption || ""}
                      onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                      placeholder="Add caption or context..."
                      className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    />
                  </div>

                  {/* Quick Action Footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      {!isAvatar && (
                        <button
                          type="button"
                          onClick={() => onSetAvatar(photo.url)}
                          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold text-zinc-700 hover:border-amber-400 hover:text-amber-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-amber-300"
                        >
                          Set Avatar
                        </button>
                      )}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => onSetCover(photo.url)}
                          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[10px] font-semibold text-zinc-700 hover:border-amber-400 hover:text-amber-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-amber-300"
                        >
                          Set Banner
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="rounded-lg p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      title="Remove photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
