"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Video,
  Download,
  RefreshCw,
  Sparkles,
  Loader2,
  SlidersHorizontal,
  Film,
  HardDrive,
  Clock3,
  Maximize2,
} from "lucide-react";

type MediaAsset = {
  id: string;
  title: string;
  type: string;
  url: string;
  size: number;
  duration?: number | null;
};

type ProcessedVideo = {
  id: string;
  title: string;
  originalSize: number;
  duration: number | null;
  requestedWidth: number | null;
  requestedHeight: number | null;
  quality: string | number;
  format: string;
  previewUrl: string;
  downloadUrl: string;
};

type ProcessedDetails = {
  size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
};

const presets = [
  { label: "Original resolution", width: "", height: "" },
  { label: "1080p — Full HD", width: "1920", height: "1080" },
  { label: "720p — HD", width: "1280", height: "720" },
  { label: "480p — SD", width: "854", height: "480" },
  { label: "Square — 1080p", width: "1080", height: "1080" },
  { label: "Vertical — 1080p", width: "1080", height: "1920" },
];

function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) {
    return "Unavailable";
  }

  if (bytes < 1024) return `${bytes} Bytes`;

  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatDuration(seconds?: number | null) {
  if (seconds == null || !Number.isFinite(seconds)) return "Unavailable";

  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getSavings(original: number, processed: number) {
  if (original <= 0) return null;
  return ((original - processed) / original) * 100;
}

export default function VideoStudio() {
  const [videos, setVideos] = useState<MediaAsset[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quality, setQuality] = useState("auto");

  const [processed, setProcessed] = useState<ProcessedVideo | null>(null);
  const [processedDetails, setProcessedDetails] =
    useState<ProcessedDetails>({
      size: null,
      width: null,
      height: null,
      duration: null,
    });
  const [checkingSize, setCheckingSize] = useState(false);

  const [loadingVideos, setLoadingVideos] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const selectedVideo = videos.find((video) => video.id === selectedId);

  const loadVideos = useCallback(async () => {
    setLoadingVideos(true);
    setError("");

    try {
      const response = await fetch("/api/media");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load your videos.");
      }

      const allMedia: MediaAsset[] = data.media ?? [];
      const videoItems = allMedia.filter((item) => item.type === "video");

      setVideos(videoItems);

      setSelectedId((current) => {
        if (current && videoItems.some((video) => video.id === current)) {
          return current;
        }

        return videoItems[0]?.id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load videos."
      );
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Try to read the delivered video's actual byte size.
  // Some browsers/CDN responses block cross-origin HEAD requests; in that
  // case we keep the size unavailable rather than displaying an estimate.
  useEffect(() => {
    if (!processed?.previewUrl) {
      setProcessedDetails({
        size: null,
        width: null,
        height: null,
        duration: null,
      });
      return;
    }

    const controller = new AbortController();

    async function checkProcessedSize() {
      setCheckingSize(true);

      try {
        const response = await fetch(processed!.previewUrl, {
          method: "HEAD",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const contentLength = response.headers.get("content-length");
        const actualSize = contentLength ? Number(contentLength) : null;

        if (actualSize && Number.isFinite(actualSize)) {
          setProcessedDetails((current) => ({
            ...current,
            size: actualSize,
          }));
        }
      } catch {
        // Cross-origin HEAD may be blocked by the browser.
      } finally {
        if (!controller.signal.aborted) {
          setCheckingSize(false);
        }
      }
    }

    checkProcessedSize();

    return () => controller.abort();
  }, [processed?.previewUrl]);

  function applyPreset(value: string) {
    const preset = presets.find((item) => item.label === value);
    if (!preset) return;

    setWidth(preset.width);
    setHeight(preset.height);
    setProcessed(null);
  }

  async function processVideo() {
    if (!selectedId) {
      setError("Please select a video first.");
      return;
    }

    setProcessing(true);
    setError("");
    setProcessed(null);
    setProcessedDetails({
      size: null,
      width: null,
      height: null,
      duration: null,
    });

    try {
      const response = await fetch("/api/videos/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedId,
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
          quality:
            quality === "auto" ||
            quality === "eco" ||
            quality === "good" ||
            quality === "best"
              ? quality
              : Number(quality),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Video processing failed.");
      }

      if (!data.video?.previewUrl || !data.video?.downloadUrl) {
        throw new Error("The server did not return valid video URLs.");
      }

      setProcessed(data.video);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process video."
      );
    } finally {
      setProcessing(false);
    }
  }

  function handleProcessedMetadata(
    event: React.SyntheticEvent<HTMLVideoElement>
  ) {
    const videoElement = event.currentTarget;

    setProcessedDetails((current) => ({
      ...current,
      width: videoElement.videoWidth || null,
      height: videoElement.videoHeight || null,
      duration: Number.isFinite(videoElement.duration)
        ? videoElement.duration
        : null,
    }));
  }

  const savings =
    processed && processedDetails.size != null
      ? getSavings(processed.originalSize, processedDetails.size)
      : null;

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-violet-400">
          <Sparkles size={16} />
          VIDEO WORKSPACE
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Video Studio
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Resize, compress and optimize your videos. Choose your preferred
          quality and download the result.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Video preview */}
        <section className="min-w-0 space-y-5 rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-white">Video preview</h2>

            <button
              type="button"
              onClick={loadVideos}
              disabled={loadingVideos}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {loadingVideos ? (
            <div className="flex min-h-[350px] items-center justify-center text-zinc-400">
              <Loader2 size={20} className="mr-2 animate-spin" />
              Loading your videos...
            </div>
          ) : videos.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
              <Video size={40} className="mb-3 text-zinc-500" />
              <p className="font-medium text-white">No videos found</p>
              <p className="mt-1 text-sm text-zinc-400">
                Upload a video to your Media Library first.
              </p>
              <a
                href="/home/media"
                className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Open Media Library
              </a>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Select an uploaded video
                </label>

                <select
                  value={selectedId}
                  onChange={(event) => {
                    setSelectedId(event.target.value);
                    setProcessed(null);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#191920] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                >
                  {videos.map((video) => (
                    <option key={video.id} value={video.id}>
                      {video.title || "Untitled video"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#09090d] p-4">
                {processed ? (
                  <video
                    key={processed.previewUrl}
                    src={processed.previewUrl}
                    controls
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={handleProcessedMetadata}
                    className="max-h-[440px] w-full rounded-lg object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : selectedVideo?.url ? (
                  <video
                    key={selectedVideo.url}
                    src={selectedVideo.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-[440px] w-full rounded-lg object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="text-sm text-zinc-500">
                    Video preview is unavailable.
                  </div>
                )}
              </div>

              {selectedVideo && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#191920] p-3">
                    <p className="text-xs text-zinc-500">Original size</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatBytes(selectedVideo.size)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#191920] p-3">
                    <p className="text-xs text-zinc-500">Duration</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatDuration(selectedVideo.duration)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#191920] p-3">
                    <p className="text-xs text-zinc-500">Output format</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {processed ? "MP4 (H.264)" : "Original"}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-zinc-500">
                {processed
                  ? "Showing your processed video preview."
                  : "Showing the original uploaded video."}
              </p>
            </>
          )}
        </section>

        {/* Processing settings */}
        <section className="h-fit space-y-6 rounded-2xl border border-white/10 bg-[#111116] p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-violet-400" />
            <h2 className="font-medium text-white">Processing settings</h2>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Resolution presets
            </label>

            <select
              defaultValue=""
              onChange={(event) => applyPreset(event.target.value)}
              disabled={!selectedVideo}
              className="w-full rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="" disabled>
                Choose a resolution
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
                max="3840"
                placeholder="Width"
                value={width}
                onChange={(event) => {
                  setWidth(event.target.value);
                  setProcessed(null);
                }}
                disabled={!selectedVideo}
                className="min-w-0 rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
              />

              <input
                type="number"
                min="1"
                max="3840"
                placeholder="Height"
                value={height}
                onChange={(event) => {
                  setHeight(event.target.value);
                  setProcessed(null);
                }}
                disabled={!selectedVideo}
                className="min-w-0 rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Leave both empty to keep the original dimensions. Resizing
              preserves the aspect ratio.
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
              disabled={!selectedVideo}
              className="w-full rounded-xl border border-white/10 bg-[#191920] px-3 py-3 text-sm text-white outline-none focus:border-violet-500"
            >
              <option value="auto">Automatic (recommended)</option>
              <option value="eco">Maximum compression</option>
              <option value="good">Balanced quality</option>
              <option value="best">High quality</option>
              <option value="80">Manual — 80%</option>
            </select>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#191920] p-3">
            <div className="flex items-center gap-2">
              <Film size={17} className="text-violet-400" />
              <span className="text-sm font-medium text-white">
                Output format
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              MP4 (H.264) — compatible with most browsers and devices.
            </p>
          </div>

          <button
            type="button"
            onClick={processVideo}
            disabled={!selectedVideo || processing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Preparing video...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Process video
              </>
            )}
          </button>

          {processed && (
            <div className="space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  Your video is ready
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Play the preview to read its output dimensions. The file
                  size is measured when the delivery server exposes it.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[#191920] p-3">
                  <p className="text-xs text-zinc-500">Original size</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatBytes(processed.originalSize)}
                  </p>
                </div>

                <div className="rounded-lg bg-[#191920] p-3">
                  <p className="text-xs text-zinc-500">Processed size</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {checkingSize
                      ? "Checking..."
                      : formatBytes(processedDetails.size)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-[#191920] p-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-400">Output dimensions</span>
                  <span className="font-medium text-white">
                    {processedDetails.width && processedDetails.height
                      ? `${processedDetails.width} × ${processedDetails.height} px`
                      : "Loading preview..."}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-400">Output duration</span>
                  <span className="font-medium text-white">
                    {formatDuration(processedDetails.duration)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-400">Output format</span>
                  <span className="font-medium text-white">MP4 (H.264)</span>
                </div>

                <div className="border-t border-white/10 pt-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-zinc-400">Storage saved</span>
                    <span
                      className={`font-semibold ${
                        savings != null && savings > 0
                          ? "text-emerald-400"
                          : "text-zinc-300"
                      }`}
                    >
                      {savings == null
                        ? "Unavailable"
                        : savings > 0
                          ? `${savings.toFixed(1)}% smaller`
                          : savings < 0
                            ? `${Math.abs(savings).toFixed(1)}% larger`
                            : "No size change"}
                    </span>
                  </div>

                  {savings != null && (
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          savings > 0 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.abs(savings))}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <a
                href={processed.downloadUrl}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                <Download size={16} />
                Download video
              </a>

              <p className="text-xs text-zinc-500">
                <HardDrive size={13} className="mr-1 inline" />
                Original file: {formatBytes(processed.originalSize)}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
