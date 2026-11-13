
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Download,
  RefreshCw,
  Sparkles,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

type MediaAsset = {
  id: string;
  title?: string | null;
  type?: string;
  resourceType?: string;
  url?: string;
  size?: number;
  width?: number | null;
  height?: number | null;
};

type ProcessedImage = {
  previewUrl: string;
  downloadUrl: string;
  originalSize: number;
  width: number | null;
  height: number | null;
  quality: string | number;
  format: string;
  processedSize: number | null;
};

const presets = [
  { label: "Original size", width: "", height: "" },
  { label: "1920 × 1080", width: "1920", height: "1080" },
  { label: "1280 × 720", width: "1280", height: "720" },
  { label: "1080 × 1080", width: "1080", height: "1080" },
  { label: "1080 × 1350", width: "1080", height: "1350" },
  { label: "720 × 1280", width: "720", height: "1280" },
];

function formatBytes(bytes: number | null | undefined) {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) {
    return "Unavailable";
  }
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageStudio() {
  const [images, setImages] = useState<MediaAsset[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quality, setQuality] = useState("auto");
  const [format, setFormat] = useState("auto");
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number } | null>(null);
  const [loadingImages, setLoadingImages] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const selectedImage = images.find((image) => image.id === selectedId);

  const loadImages = useCallback(async () => {
    setLoadingImages(true);
    setError("");

    try {
      const response = await fetch("/api/media");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load your media.");
      }

      const allMedia: MediaAsset[] = data.media ?? data.assets ?? [];

      const imageItems = allMedia.filter((item) => {
        const type = (item.type ?? item.resourceType ?? "").toLowerCase();
        return type === "image";
      });

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
      setLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  function applyPreset(value: string) {
    const preset = presets.find((item) => item.label === value);
    if (!preset) return;

    setWidth(preset.width);
    setHeight(preset.height);
    setProcessed(null);
  }

  async function processImage() {
    if (!selectedId) {
      setError("Please select an image first.");
      return;
    }

    setProcessing(true);
    setError("");
    setProcessed(null);

    try {
      const response = await fetch("/api/media/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedId,
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
          quality: quality === "auto" ? "auto" : Number(quality),
          format,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Image processing failed.");
      }

      // Measure the actual transformed file rather than estimating its size.
      let processedSize: number | null = null;
      try {
        const fileResponse = await fetch(data.image.previewUrl);
        if (fileResponse.ok) {
          const outputBlob = await fileResponse.blob();
          processedSize = outputBlob.size;
        }
      } catch {
        // Some browser/network configurations block cross-origin file measurement.
        // The preview and download still work; we simply omit the savings figure.
      }

      setOutputDimensions(null);
      setProcessed({ ...data.image, processedSize });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process image."
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
          IMAGE WORKSPACE
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Image Studio
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Resize, compress and convert your images. Download the result
          whenever you are ready.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0 space-y-5 rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-white">Image preview</h2>
            <button
              type="button"
              onClick={loadImages}
              disabled={loadingImages}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {loadingImages ? (
            <div className="flex min-h-[350px] items-center justify-center text-zinc-400">
              <Loader2 className="mr-2 animate-spin" size={20} />
              Loading your images...
            </div>
          ) : images.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
              <ImageIcon size={38} className="mb-3 text-zinc-500" />
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
                    setProcessed(null);
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

              <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#09090d] p-4">
                {processed ? (
                  <img
                    src={processed.previewUrl}
                    alt="Processed image preview"
                    onLoad={(event) => {
                      setOutputDimensions({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      });
                    }}
                    className="max-h-[440px] max-w-full rounded-lg object-contain"
                  />
                ) : selectedImage?.url ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || "Selected image"}
                    className="max-h-[440px] max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-sm text-zinc-500">
                    Image preview is unavailable.
                  </div>
                )}
              </div>

              <p className="text-xs text-zinc-500">
                {processed
                  ? "Showing your processed preview."
                  : "Showing the original uploaded image."}
              </p>
            </>
          )}
        </section>

        <section className="h-fit space-y-6 rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-violet-400" />
            <h2 className="font-medium text-white">Processing settings</h2>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Dimension presets
            </label>
            <select
              onChange={(event) => applyPreset(event.target.value)}
              defaultValue=""
              disabled={!selectedImage}
              className="w-full rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="" disabled>
                Choose a preset
              </option>
              {presets.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Custom dimensions (pixels)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                max="5000"
                placeholder="Width"
                value={width}
                onChange={(event) => {
                  setWidth(event.target.value);
                  setProcessed(null);
                }}
                disabled={!selectedImage}
                className="min-w-0 rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
              />
              <input
                type="number"
                min="1"
                max="5000"
                placeholder="Height"
                value={height}
                onChange={(event) => {
                  setHeight(event.target.value);
                  setProcessed(null);
                }}
                disabled={!selectedImage}
                className="min-w-0 rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Leave both empty to keep the original dimensions.
              Resizing preserves the aspect ratio.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Compression quality
            </label>
            <select
              value={quality}
              onChange={(event) => {
                setQuality(event.target.value);
                setProcessed(null);
              }}
              disabled={!selectedImage}
              className="w-full rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="auto">Automatic (recommended)</option>
              <option value="90">90% — High quality</option>
              <option value="80">80% — Balanced</option>
              <option value="60">60% — Smaller file</option>
              <option value="40">40% — Maximum compression</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Output format
            </label>
            <select
              value={format}
              onChange={(event) => {
                setFormat(event.target.value);
                setProcessed(null);
              }}
              disabled={!selectedImage}
              className="w-full rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="auto">Automatic / optimized</option>
              <option value="webp">WebP</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          <button
            type="button"
            onClick={processImage}
            disabled={!selectedImage || processing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Processing image...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Process image
              </>
            )}
          </button>

          {processed && (
            <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  Your image is ready
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Your processed image is ready to download.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-zinc-400">Original size</p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {formatBytes(processed.originalSize)}
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-xs text-zinc-400">Processed size</p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {formatBytes(processed.processedSize)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-white/5 p-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-400">Output dimensions</span>
                  <span className="font-medium text-white">
                    {outputDimensions
                      ? `${outputDimensions.width} × ${outputDimensions.height} px`
                      : "Measuring..."}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-400">Output format</span>
                  <span className="font-medium uppercase text-white">
                    {format === "auto" ? "Auto / optimized" : format}
                  </span>
                </div>
                {processed.processedSize !== null && processed.originalSize > 0 && (
                  <>
                    <div className="flex items-center justify-between gap-3 pt-1 text-xs">
                      <span className="text-zinc-400">Storage saved</span>
                      <span className={`font-semibold ${
                        processed.processedSize < processed.originalSize
                          ? "text-emerald-300"
                          : "text-zinc-200"
                      }`}>
                        {processed.processedSize < processed.originalSize
                          ? `${(((processed.originalSize - processed.processedSize) / processed.originalSize) * 100).toFixed(1)}% smaller`
                          : processed.processedSize === processed.originalSize
                            ? "No size change"
                            : `${(((processed.processedSize - processed.originalSize) / processed.originalSize) * 100).toFixed(1)}% larger`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.max(0, Math.min(100, (1 - processed.processedSize / processed.originalSize) * 100))}%`,
                        }}
                      />
                    </div>
                  </>
                )}
                {processed.processedSize === null && (
                  <p className="text-xs text-amber-300">
                    File size could not be measured in this browser. You can still download the image.
                  </p>
                )}
              </div>

              <a
                href={processed.downloadUrl}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                <Download size={16} />
                Download image
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
