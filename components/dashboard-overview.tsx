
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Image as ImageIcon,
  Video,
  Layers3,
  UploadCloud,
  ArrowUpRight,
  Clock3,
  RefreshCw,
  FolderOpen,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Film,
  HardDrive,
  ChartColumn,
} from "lucide-react";
import Link from "next/link";

type Upload = {
  id: string;
  title: string;
  publicId: string;
  type: "image" | "video";
  createdAt: string;
  size: number;
};

type UploadActivity = {
  date: string;
  images: number;
  videos: number;
  total: number;
};

type DashboardData = {
  stats: {
    totalAssets: number;
    totalImages: number;
    totalVideos: number;
    totalStorageBytes: number;
    imageStorageBytes: number;
    videoStorageBytes: number;
  };
  uploadActivity: UploadActivity[];
  recentUploads: Upload[];
};

type UploadType = "image" | "video";

const emptyStats = {
  totalAssets: 0,
  totalImages: 0,
  totalVideos: 0,
  totalStorageBytes: 0,
  imageStorageBytes: 0,
  videoStorageBytes: 0,
};

function formatSize(bytes: number) {
  if (!bytes) return "0 KB";

  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
  }).format(new Date(`${date}T12:00:00`));
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<UploadType | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load dashboard information.");
      }

      const result: DashboardData = await response.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleUpload(
    event: FormEvent<HTMLFormElement>,
    type: UploadType
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("Please select a file before uploading.");
      return;
    }

    if (type === "image" && !file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    setUploading(type);
    setError("");
    setNotice("");

    try {
      const endpoint =
        type === "image" ? "/api/image-upload" : "/api/video-upload";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error || "Upload failed. Please try again."
        );
      }

      form.reset();

      await loadDashboard();

      setNotice(
        result.message ||
          `${type === "image" ? "Image" : "Video"} uploaded successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during upload."
      );
    } finally {
      setUploading(null);
    }
  }

  const stats = data?.stats ?? emptyStats;
  const uploadActivity = data?.uploadActivity ?? [];

  const imagePercentage =
    stats.totalAssets > 0
      ? (stats.totalImages / stats.totalAssets) * 100
      : 0;

  const videoPercentage =
    stats.totalAssets > 0
      ? (stats.totalVideos / stats.totalAssets) * 100
      : 0;

  const maxUploads = Math.max(
    1,
    ...uploadActivity.map((day) => day.total)
  );

  const statCards = [
    {
      label: "Total Assets",
      value: stats.totalAssets,
      icon: Layers3,
      color: "text-violet-300",
      background: "bg-violet-500/10",
      description: "All your media",
    },
    {
      label: "Images",
      value: stats.totalImages,
      icon: ImageIcon,
      color: "text-sky-300",
      background: "bg-sky-500/10",
      description: "Image collection",
    },
    {
      label: "Videos",
      value: stats.totalVideos,
      icon: Video,
      color: "text-fuchsia-300",
      background: "bg-fuchsia-500/10",
      description: "Video collection",
    },
    {
      label: "Storage Used",
      value: formatSize(stats.totalStorageBytes),
      icon: HardDrive,
      color: "text-emerald-300",
      background: "bg-emerald-500/10",
      description: "Combined media size",
    },
  ];

  return (
    <div className="space-y-9">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#171426] via-[#11111c] to-[#10101a] p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-[-100px] right-1/3 h-56 w-56 rounded-full bg-indigo-600/10 blur-[90px]" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            Your creative workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Your media,
            <span className="text-sheen ml-2 font-serif italic">
              beautifully organized.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
            Manage your images and videos, keep your creative assets
            organized, and access everything from one workspace.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#quick-actions"
              className="btn-shine inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
            >
              <UploadCloud className="h-4 w-4" />
              Upload media
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Link
              href="#recent-uploads"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <FolderOpen className="h-4 w-4" />
              Browse uploads
            </Link>
          </div>
        </div>
      </section>

      {/* Notifications */}
      {notice && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.07] p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {notice}
          <button
            type="button"
            onClick={() => setNotice("")}
            className="ml-auto text-xs text-emerald-300/70 hover:text-emerald-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-500/[0.07] p-4 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-xs text-red-300/70 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace statistics */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Workspace overview
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your media library at a glance
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.07] bg-[#11111b] p-5 transition hover:border-violet-400/20 hover:bg-[#141421]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                      {loading ? "—" : stat.value}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-600">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.background}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Storage and media distribution */}
      <section className="grid gap-5 xl:grid-cols-2">
        {/* Storage analytics */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#11111b] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Storage analytics
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your combined media storage
              </p>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-xs text-slate-500">Total storage used</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
              {loading ? "—" : formatSize(stats.totalStorageBytes)}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Images
                </span>
                <span className="text-slate-400">
                  {loading ? "—" : formatSize(stats.imageStorageBytes)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalStorageBytes > 0
                        ? (stats.imageStorageBytes /
                            stats.totalStorageBytes) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                  Videos
                </span>
                <span className="text-slate-400">
                  {loading ? "—" : formatSize(stats.videoStorageBytes)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-fuchsia-400 transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalStorageBytes > 0
                        ? (stats.videoStorageBytes /
                            stats.totalStorageBytes) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-slate-600">
            Based on the original file sizes stored in your library.
          </p>
        </div>

        {/* Media distribution */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#11111b] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <ChartColumn className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Media distribution
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Images versus videos
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-7">
            <div
              className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  stats.totalAssets > 0
                    ? `conic-gradient(#38bdf8 0% ${imagePercentage}%, #d946ef ${imagePercentage}% 100%)`
                    : "conic-gradient(#334155 0% 100%)",
              }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#11111b]">
                <span className="text-2xl font-semibold text-white">
                  {loading ? "—" : stats.totalAssets}
                </span>
                <span className="text-[10px] text-slate-500">
                  Total assets
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  <span className="text-xs text-slate-400">Images</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-white">
                  {loading ? "—" : stats.totalImages}
                </p>
                <p className="text-[11px] text-slate-600">
                  {loading ? "—" : `${imagePercentage.toFixed(1)}% of assets`}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
                  <span className="text-xs text-slate-400">Videos</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-white">
                  {loading ? "—" : stats.totalVideos}
                </p>
                <p className="text-[11px] text-slate-600">
                  {loading ? "—" : `${videoPercentage.toFixed(1)}% of assets`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload activity */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#11111b] p-5 sm:p-6">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Upload activity
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your uploads over the last 7 days
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Images
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
              Videos
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-44 animate-pulse rounded-xl bg-white/[0.03]" />
        ) : uploadActivity.length > 0 ? (
          <div className="grid h-48 grid-cols-7 gap-3 sm:gap-5">
            {uploadActivity.map((day) => {
              const imageHeight =
                (day.images / maxUploads) * 100;
              const videoHeight =
                (day.videos / maxUploads) * 100;

              return (
                <div
                  key={day.date}
                  className="flex min-w-0 flex-col items-center"
                >
                  <span className="mb-2 text-[10px] text-slate-500">
                    {day.total}
                  </span>

                  <div className="flex h-full w-full max-w-10 items-end overflow-hidden rounded-t-lg bg-white/[0.035]">
                    <div className="flex h-full w-full flex-col justify-end">
                      {day.videos > 0 && (
                        <div
                          className="w-full bg-fuchsia-400 transition-all duration-500"
                          style={{
                            height: `${videoHeight}%`,
                            minHeight: "3px",
                          }}
                        />
                      )}
                      {day.images > 0 && (
                        <div
                          className="w-full bg-sky-400 transition-all duration-500"
                          style={{
                            height: `${imageHeight}%`,
                            minHeight: "3px",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <span className="mt-3 text-[10px] text-slate-500">
                    {formatActivityDate(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center text-xs text-slate-500">
            No upload activity available yet.
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section id="quick-actions" className="scroll-mt-24">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Quick actions
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Start managing your creative assets
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="#upload-image"
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#11111b] p-5 transition hover:border-violet-400/30 hover:bg-violet-500/[0.04]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition group-hover:scale-105">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white">
                Upload image
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Add images to your library
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-violet-300" />
          </Link>

          <Link
            href="#upload-video"
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#11111b] p-5 transition hover:border-fuchsia-400/30 hover:bg-fuchsia-500/[0.04]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300 transition group-hover:scale-105">
              <Video className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white">
                Upload video
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Store and manage your videos
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-fuchsia-300" />
          </Link>
        </div>
      </section>

      {/* Upload forms */}
      <section className="scroll-mt-24">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Upload your media
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Upload directly to your Cloudinary workspace
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {/* Image upload */}
          <form
            id="upload-image"
            onSubmit={(event) => handleUpload(event, "image")}
            className="scroll-mt-24 rounded-2xl border border-white/[0.07] bg-[#11111b] p-5 sm:p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                <FileImage className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Image upload
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Add an image to your library
                </p>
              </div>
            </div>

            <label className="mb-2 block text-xs font-medium text-slate-300">
              Image title <span className="text-slate-600">(optional)</span>
            </label>
            <input
              name="title"
              type="text"
              maxLength={120}
              placeholder="e.g. My profile photograph"
              className="mb-5 w-full rounded-xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50"
            />

            <label className="mb-2 block text-xs font-medium text-slate-300">
              Choose image
            </label>
            <input
              name="file"
              type="file"
              accept="image/*"
              required
              className="block w-full cursor-pointer rounded-xl border border-dashed border-white/15 bg-[#0b0b13] p-3 text-xs text-slate-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-violet-200 hover:border-violet-400/30"
            />

            <p className="mt-3 text-[11px] text-slate-600">
              Supported formats depend on Cloudinary configuration.
            </p>

            <button
              type="submit"
              disabled={uploading !== null}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading === "image" ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Uploading image...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Upload image
                </>
              )}
            </button>
          </form>

          {/* Video upload */}
          <form
            id="upload-video"
            onSubmit={(event) => handleUpload(event, "video")}
            className="scroll-mt-24 rounded-2xl border border-white/[0.07] bg-[#11111b] p-5 sm:p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Video upload
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Store and manage your videos
                </p>
              </div>
            </div>

            <label className="mb-2 block text-xs font-medium text-slate-300">
              Video title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. My travel video"
              className="mb-4 w-full rounded-xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-500/50"
            />

            <label className="mb-2 block text-xs font-medium text-slate-300">
              Description{" "}
              <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={2}
              maxLength={500}
              placeholder="Write a short description..."
              className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-[#0b0b13] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-fuchsia-500/50"
            />

            <label className="mb-2 block text-xs font-medium text-slate-300">
              Choose video
            </label>
            <input
              name="file"
              type="file"
              accept="video/*"
              required
              className="block w-full cursor-pointer rounded-xl border border-dashed border-white/15 bg-[#0b0b13] p-3 text-xs text-slate-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-fuchsia-500/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-fuchsia-200 hover:border-fuchsia-400/30"
            />

            <p className="mt-3 text-[11px] text-slate-600">
              Large video uploads may take longer depending on file size and
              connection.
            </p>

            <button
              type="submit"
              disabled={uploading !== null}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading === "video" ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Uploading video...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Upload video
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Recent uploads */}
      <section id="recent-uploads" className="scroll-mt-24">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent uploads
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your latest media activity
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            Latest first
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#11111b]">
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-white/[0.04]"
                />
              ))}
            </div>
          ) : data?.recentUploads.length ? (
            <div className="divide-y divide-white/[0.06]">
              {data.recentUploads.map((upload) => (
                <div
                  key={`${upload.type}-${upload.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.025]"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      upload.type === "image"
                        ? "bg-sky-500/10 text-sky-300"
                        : "bg-fuchsia-500/10 text-fuchsia-300"
                    }`}
                  >
                    {upload.type === "image" ? (
                      <ImageIcon className="h-5 w-5" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {upload.title}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      {formatDate(upload.createdAt)} ·{" "}
                      {formatSize(upload.size)}
                    </p>
                  </div>

                  <span className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-[10px] font-medium capitalize text-slate-400">
                    {upload.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                <FolderOpen className="h-7 w-7 text-violet-300" />
              </div>
              <h3 className="mt-5 text-sm font-semibold text-white">
                Your library is waiting
              </h3>
              <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
                Your uploaded images and videos will appear here. Start by
                uploading your first asset.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
