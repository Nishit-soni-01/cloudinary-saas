
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Image as ImageIcon,
  Video,
  Layers3,
  HardDrive,
  X,
  Play,
  RefreshCw,
  CalendarDays,
  Maximize2,
  FileImage,
  Clock3,
  Trash2,
  Pencil,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type MediaType = "image" | "video";
type FilterType = "all" | MediaType;

interface MediaAsset {
  id: string;
  title: string;
  publicId: string;
  type: MediaType;
  url: string;
  format: string | null;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  createdAt: string;
}

interface MediaResponse {
  media: MediaAsset[];
  stats: {
    totalAssets: number;
    totalImages: number;
    totalVideos: number;
  };
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(duration: number | null) {
  if (duration === null) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [stats, setStats] = useState<MediaResponse["stats"]>({
    totalAssets: 0,
    totalImages: 0,
    totalVideos: 0,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const filterParam = searchParams.get("type");

  const filter: FilterType =
    filterParam === "image" || filterParam === "video"
      ? filterParam
      : "all";

  const updateFilter = (nextFilter: FilterType) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFilter === "all") {
      params.delete("type");
    } else {
      params.set("type", nextFilter);
    }

    const query = params.toString();

    router.push(
      query ? `/home/media?${query}` : "/home/media",
      { scroll: false }
    );
  };

  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] =
    useState<MediaAsset | null>(null);
  const [assetToDelete, setAssetToDelete] =
    useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [assetToRename, setAssetToRename] = useState<MediaAsset | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/media", {
        cache: "no-store",
      });

      const data: MediaResponse & { error?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load your media.");
      }

      setMedia(data.media || []);
      setStats(
        data.stats || {
          totalAssets: 0,
          totalImages: 0,
          totalVideos: 0,
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading media."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const filteredMedia = useMemo(() => {
    return media.filter((asset) => {
      const matchesFilter =
        filter === "all" || asset.type === filter;

      const matchesSearch = asset.title
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      return matchesFilter && matchesSearch;
    });
  }, [media, filter, search]);

  const filters: {
    label: string;
    value: FilterType;
    count: number;
  }[] = [
    { label: "All assets", value: "all", count: stats.totalAssets },
    { label: "Images", value: "image", count: stats.totalImages },
    { label: "Videos", value: "video", count: stats.totalVideos },
  ];

  const openRenameDialog = (asset: MediaAsset) => {
    setAssetToRename(asset);
    setEditTitle(asset.title);
    setRenameError("");
  };

  const renameAsset = async () => {
    if (!assetToRename || renaming) return;

    const title = editTitle.trim();

    if (!title) {
      setRenameError("Please enter a title.");
      return;
    }

    if (title.length > 100) {
      setRenameError("Title cannot exceed 100 characters.");
      return;
    }

    try {
      setRenaming(true);
      setRenameError("");

      const response = await fetch("/api/media/rename", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: assetToRename.id,
          title,
        }),
      });

      const data: { error?: string; title?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to rename this media.");
      }

      const updatedTitle = data.title || title;

      setMedia((current) =>
        current.map((asset) =>
          asset.id === assetToRename.id
            ? { ...asset, title: updatedTitle }
            : asset
        )
      );

      setSelectedAsset((current) =>
        current?.id === assetToRename.id
          ? { ...current, title: updatedTitle }
          : current
      );

      setAssetToRename(null);
      setEditTitle("");
    } catch (err) {
      setRenameError(
        err instanceof Error
          ? err.message
          : "Unable to rename media. Please try again."
      );
    } finally {
      setRenaming(false);
    }
  };

  const deleteAsset = async () => {
    if (!assetToDelete || deleting) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const response = await fetch("/api/media/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: assetToDelete.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete this media.");
      }

      // Remove the deleted asset immediately from the UI.
      setMedia((current) =>
        current.filter((asset) => asset.id !== assetToDelete.id)
      );

      setStats((current) => ({
        totalAssets: Math.max(0, current.totalAssets - 1),
        totalImages:
          assetToDelete.type === "image"
            ? Math.max(0, current.totalImages - 1)
            : current.totalImages,
        totalVideos:
          assetToDelete.type === "video"
            ? Math.max(0, current.totalVideos - 1)
            : current.totalVideos,
      }));

      if (selectedAsset?.id === assetToDelete.id) {
        setSelectedAsset(null);
      }

      setAssetToDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Unable to delete media. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300">
                Your creative workspace
              </p>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {filter === "image"
                 ? "My Images"
                 : filter === "video"
                   ? "My Videos"
                   : "All Media"}
              <span className="text-violet-400">.</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {filter === "image"
                  ? "Manage, preview and organize all your uploaded images."
                  : filter === "video"
                    ? "Manage, preview and organize all your uploaded videos."
                    : "All your uploaded images and videos, organized in one place."}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMedia}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh library
          </button>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Layers3}
            label="Total assets"
            value={stats.totalAssets}
            description="All uploaded media"
          />

          <StatCard
            icon={ImageIcon}
            label="Images"
            value={stats.totalImages}
            description="Image files"
          />

          <StatCard
            icon={Video}
            label="Videos"
            value={stats.totalVideos}
            description="Video files"
          />
        </section>

        {/* Library panel */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#10101a]">
          <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Your uploads
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Browse and preview your media files.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search your media..."
                  className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-9 pr-4 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 sm:w-64"
                />
              </div>

              <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateFilter(item.value)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium transition ${
                      filter === item.value
                        ? "bg-violet-500/15 text-violet-300"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span className="text-[10px] opacity-60">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Media grid */}
          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]"
                  >
                    <div className="aspect-[4/3] animate-pulse bg-white/[0.04]" />
                    <div className="space-y-3 p-4">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                      <div className="h-2 w-1/3 animate-pulse rounded bg-white/[0.04]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <HardDrive className="mb-4 h-8 w-8 text-red-400" />

                <h3 className="text-sm font-semibold text-white">
                  Unable to load media
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchMedia}
                  className="mt-5 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400"
                >
                  Try again
                </button>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-400/[0.06]">
                  {search ? (
                    <Search className="h-7 w-7 text-violet-300" />
                  ) : (
                    <FileImage className="h-7 w-7 text-violet-300" />
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white">
                  {search ? "No matching files" : "No media found"}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  {search
                    ? "Try another search term."
                    : "Upload an image or video to see it here."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-4 text-xs font-medium text-violet-300 hover:text-violet-200"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-300">
                      {filteredMedia.length}
                    </span>{" "}
                    {filteredMedia.length === 1 ? "asset" : "assets"}
                  </p>

                  <p className="text-[10px] text-slate-600">
                    Newest first
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredMedia.map((asset) => (
                    <div
                      key={asset.id}
                      className="group overflow-hidden rounded-xl border border-white/[0.07] bg-[#151520] transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-xl hover:shadow-violet-950/20"
                    >
                      {/* Preview */}
                      <button
                        type="button"
                        onClick={() => setSelectedAsset(asset)}
                        aria-label={`Preview ${asset.title}`}
                        className="block w-full text-left"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#090912]">
                          {asset.type === "image" ? (
                            <img
                              src={asset.url}
                              alt={asset.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <video
                              src={asset.url}
                              muted
                              loop
                              autoPlay
                              playsInline
                              preload="metadata"
                              className="h-full w-full object-cover"
                            />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70 transition group-hover:opacity-100" />

                          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-md">
                            {asset.type === "image" ? (
                              <ImageIcon className="h-3 w-3 text-violet-300" />
                            ) : (
                              <Video className="h-3 w-3 text-indigo-300" />
                            )}
                            {asset.type === "image" ? "IMAGE" : "VIDEO"}
                          </div>

                          {asset.type === "video" &&
                            asset.duration !== null && (
                              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-md">
                                <Clock3 className="h-3 w-3" />
                                {formatDuration(asset.duration)}
                              </div>
                            )}

                          <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                            {asset.type === "video" ? (
                              <Play className="h-4 w-4 fill-white" />
                            ) : (
                              <Maximize2 className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Asset details */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-white transition group-hover:text-violet-300">
                              {asset.title}
                            </h3>
                            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                              {asset.format || asset.type}
                            </p>
                          </div>

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-500">
                            {asset.type === "image" ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : (
                              <Video className="h-4 w-4" />
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                          <span className="text-[10px] text-slate-500">
                            {formatBytes(asset.size)}
                          </span>

                          <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(asset.createdAt)}
                          </span>
                        </div>

                        {/* Media actions */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openRenameDialog(asset)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-400/10 bg-violet-400/[0.04] py-2.5 text-[11px] font-medium text-violet-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-violet-200"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError("");
                              setAssetToDelete(asset);
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/10 bg-red-400/[0.04] py-2.5 text-[11px] font-medium text-red-400 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Preview modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setSelectedAsset(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11111c] shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">
                  {selectedAsset.title}
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  {selectedAsset.type.toUpperCase()} ·{" "}
                  {formatBytes(selectedAsset.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                aria-label="Close preview"
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/40 p-3 sm:p-6">
              {selectedAsset.type === "image" ? (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.title}
                  className="max-h-[65vh] max-w-full rounded-lg object-contain"
                />
              ) : (
                <video
                  src={selectedAsset.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[65vh] max-w-full rounded-lg"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-5 py-4">
              <div className="text-[11px] text-slate-500">
                {selectedAsset.width && selectedAsset.height
                  ? `${selectedAsset.width} × ${selectedAsset.height} px`
                  : selectedAsset.duration !== null
                    ? `Duration: ${formatDuration(selectedAsset.duration)}`
                    : selectedAsset.type}
              </div>

              <div className="text-[11px] text-slate-500">
                Uploaded {formatDate(selectedAsset.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rename dialog */}
      {assetToRename && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => {
            if (!renaming) {
              setAssetToRename(null);
              setRenameError("");
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-dialog-title"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141420] p-6 shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.08] text-violet-300">
              <Pencil className="h-5 w-5" />
            </div>

            <h2
              id="rename-dialog-title"
              className="mt-5 text-lg font-semibold text-white"
            >
              Rename media
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Change the title of this {assetToRename.type}. The stored file
              will remain unchanged.
            </p>

            <label
              htmlFor="media-new-title"
              className="mt-5 block text-xs font-medium text-slate-300"
            >
              Media title
            </label>
            <input
              id="media-new-title"
              type="text"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !renaming) {
                  void renameAsset();
                }
              }}
              maxLength={100}
              autoFocus
              disabled={renaming}
              placeholder="Enter a new title"
              className="mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 disabled:opacity-60"
            />

            <div className="mt-1 text-right text-[10px] text-slate-600">
              {editTitle.length}/100
            </div>

            {renameError && (
              <div className="mt-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] p-3 text-xs leading-5 text-red-300">
                {renameError}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={renaming}
                onClick={() => {
                  setAssetToRename(null);
                  setRenameError("");
                }}
                className="rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={renaming || !editTitle.trim()}
                onClick={() => void renameAsset()}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-xs font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {renaming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil className="h-3.5 w-3.5" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {assetToDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => {
            if (!deleting) {
              setAssetToDelete(null);
              setDeleteError("");
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141420] p-6 shadow-2xl shadow-black/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/15 bg-red-400/[0.08] text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h2
              id="delete-dialog-title"
              className="mt-5 text-lg font-semibold text-white"
            >
              Delete this media?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {assetToDelete.title}
              </span>
              ? This will permanently remove the file from Cloudinary and
              your media library.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.06] p-3 text-xs leading-5 text-red-300">
                {deleteError}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setAssetToDelete(null);
                  setDeleteError("");
                }}
                className="rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={deleteAsset}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Confirm delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-[#10101a] p-5 transition hover:border-violet-400/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-1 text-[10px] text-slate-600">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-400/[0.06] text-violet-300 transition group-hover:bg-violet-400/[0.12]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
