
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  RefreshCw,
  Loader2,
  Eraser,
} from "lucide-react";

type MediaImage = {
  id: string;
  title: string;
  type: string;
  url: string;
};

type BackgroundResult = {
  id: string;
  title: string;
  originalUrl: string;
  previewUrl: string;
  downloadUrl: string;
  format: string;
};

export default function BackgroundRemover() {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState<BackgroundResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [error, setError] = useState("");

  const selectedImage = images.find((image) => image.id === selectedId);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/media");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load images.");
      }

      const imageItems: MediaImage[] = (data.media ?? []).filter(
        (item: MediaImage) => item.type === "image"
      );

      setImages(imageItems);

      setSelectedId((current) => {
        if (current && imageItems.some((image) => image.id === current)) {
          return current;
        }

        return imageItems[0]?.id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load images."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  async function removeBackground() {
    if (!selectedId) {
      setError("Please select an image first.");
      return;
    }

    setProcessing(true);
    setError("");
    setResult(null);
    setImageReady(false);

    try {
      const response = await fetch("/api/images/remove-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to prepare background removal.");
      }

      if (!data.image?.previewUrl || !data.image?.downloadUrl) {
        throw new Error("The server did not return a valid image URL.");
      }

      setResult(data.image);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Background removal failed."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-400">
          <Sparkles size={16} />
          AI IMAGE TOOL
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Background Remover
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Remove image backgrounds automatically and download transparent PNGs.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-white">Image preview</h2>

            <button
              type="button"
              onClick={loadImages}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center text-zinc-400">
              <Loader2 size={20} className="mr-2 animate-spin" />
              Loading your images...
            </div>
          ) : images.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
              <ImageIcon size={40} className="mb-3 text-zinc-500" />
              <p className="font-medium text-white">No images found</p>
              <p className="mt-1 text-sm text-zinc-400">
                Upload an image to your Media Library first.
              </p>
              <a
                href="/home/media"
                className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
              >
                Open Media Library
              </a>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Select an uploaded image
                </label>

                <select
                  value={selectedId}
                  onChange={(event) => {
                    setSelectedId(event.target.value);
                    setResult(null);
                    setImageReady(false);
                    setError("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#191920] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                >
                  {images.map((image) => (
                    <option key={image.id} value={image.id}>
                      {image.title || "Untitled image"}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="flex min-h-[350px] items-center justify-center overflow-hidden rounded-xl border border-white/10 p-4"
                style={{
                  backgroundColor: "#09090d",
                  backgroundImage:
                    "linear-gradient(45deg, #17171d 25%, transparent 25%), linear-gradient(-45deg, #17171d 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #17171d 75%), linear-gradient(-45deg, transparent 75%, #17171d 75%)",
                  backgroundSize: "24px 24px",
                  backgroundPosition:
                    "0 0, 0 12px, 12px -12px, -12px 0",
                }}
              >
                {result ? (
                  <img
                    key={result.previewUrl}
                    src={result.previewUrl}
                    alt="Image with background removed"
                    onLoad={() => {
                      setImageReady(true);
                      setError("");
                    }}
                    onError={() => {
                      setImageReady(false);
                      setError(
                        "Cloudinary could not load the processed image yet. It may still be processing, or background removal may not be available for this image or account."
                      );
                    }}
                    className="max-h-[500px] max-w-full rounded-lg object-contain"
                  />
                ) : selectedImage?.url ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="max-h-[500px] max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <p className="text-sm text-zinc-500">
                    Image preview unavailable.
                  </p>
                )}
              </div>

              <p className="text-xs text-zinc-500">
                {result
                  ? imageReady
                    ? "Background-removed image loaded successfully."
                    : "Waiting for the processed image..."
                  : "Showing your original image."}
              </p>
            </>
          )}
        </section>

        <section className="h-fit space-y-6 rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center gap-2">
            <Eraser size={18} className="text-violet-400" />
            <h2 className="font-medium text-white">Background removal</h2>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#191920] p-4">
            <p className="text-sm font-medium text-white">
              AI-powered background removal
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Cloudinary analyzes your image, separates the foreground subject
              and creates a transparent PNG.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm text-zinc-400">Selected image</p>
            <p className="rounded-xl border border-white/10 bg-[#191920] px-4 py-3 text-sm text-white">
              {selectedImage?.title || "No image selected"}
            </p>
          </div>

          <button
            type="button"
            onClick={removeBackground}
            disabled={!selectedImage || processing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Remove background
              </>
            )}
          </button>

          {result && (
            <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  {imageReady
                    ? "Transparent image ready"
                    : "Processing requested"}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  {imageReady
                    ? "Your PNG preview has loaded. You can download it now."
                    : "Wait for the preview to load before downloading."}
                </p>
              </div>

              <a
                href={`/api/images/remove-background/download?id=${encodeURIComponent(result.id)}`}
                download
                aria-disabled={!imageReady}
                onClick={(event) => {
                  if (!imageReady) event.preventDefault();
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
                  imageReady
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "cursor-not-allowed bg-zinc-700 opacity-50"
                }`}
              >
                <Download size={16} />
                Download transparent PNG
              </a>
            </div>
          )}

          <p className="text-xs leading-5 text-zinc-500">
            Background removal may use Cloudinary transformation credits.
            Availability depends on your Cloudinary plan.
          </p>
        </section>
      </div>
    </div>
  );
}
