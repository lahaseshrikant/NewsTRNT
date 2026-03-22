"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import adminAuth from "@/lib/auth/admin-auth";
import { API_CONFIG } from "@/config/api";
import {
  PhotoIcon,
  CircleStackIcon,
  PlusIcon,
  XMarkIcon,
  ChartBarIcon,
} from "@/components/icons/AdminIcons";

const API_BASE_URL = API_CONFIG.baseURL;

interface VariantInfo {
  key: string;
  url: string;
  width?: number;
  format: string;
  strategy: "prebuilt" | "on-demand-fallback";
}

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  type: "image" | "video" | "audio" | "document";
  size: number;
  sizeLabel: string;
  url: string;
  thumbnailUrl?: string | null;
  previewUrl?: string;
  usageCount: number;
  createdAt: string;
  folder: string;
  variants: VariantInfo[];
}

interface StorageStats {
  totalObjects: number;
  totalBytes: number;
  totalSizeLabel: string;
  estimatedMonthlyCostUsd: number;
  costPerGbUsd: number;
  byType: Record<string, { count: number; bytes: number }>;
}

const TYPE_BADGES: Record<string, string> = {
  image: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  video: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  audio: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
  document: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const MediaLibrary: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "audio" | "document">("all");
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupUsage, setCleanupUsage] = useState(0);
  const [cleanupPreview, setCleanupPreview] = useState<{ matchedCount: number; reclaimedSizeLabel: string } | null>(null);

  const headers = useMemo(() => ({ ...adminAuth.getAuthHeaders() }), []);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [filesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/media`, { headers }),
        fetch(`${API_BASE_URL}/admin/media/stats`, { headers }),
      ]);

      if (!filesRes.ok) throw new Error("Failed to load media files");
      if (!statsRes.ok) throw new Error("Failed to load storage stats");

      const filesJson = await filesRes.json();
      const statsJson = await statsRes.json();

      setMediaFiles(filesJson.files || []);
      setStats(statsJson);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
      setMediaFiles([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const filtered = useMemo(() => {
    return mediaFiles.filter((file) => {
      const matchesType = filterType === "all" || file.type === filterType;
      const needle = searchTerm.toLowerCase();
      const matchesSearch =
        file.originalName.toLowerCase().includes(needle) ||
        file.filename.toLowerCase().includes(needle) ||
        file.url.toLowerCase().includes(needle);
      return matchesType && matchesSearch;
    });
  }, [mediaFiles, filterType, searchTerm]);

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);

        const token = adminAuth.getToken();

        const res = await fetch(`${API_BASE_URL}/admin/media/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body,
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || `Upload failed for ${file.name}`);
        }
      }

      await fetchMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/media/${id}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      await fetchMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete media");
    }
  };

  const runCleanup = async (dryRun: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/media/cleanup`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          olderThanDays: cleanupDays,
          maxUsageCount: cleanupUsage,
          dryRun,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Cleanup failed");

      setCleanupPreview({
        matchedCount: json.matchedCount,
        reclaimedSizeLabel: json.reclaimedSizeLabel,
      });

      if (!dryRun) {
        await fetchMedia();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cleanup media");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">Media Library</h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
            Cloudflare R2-backed storage with standard variants and cleanup controls.
          </p>
        </div>
        <label className="inline-flex cursor-pointer h-9 items-center gap-2 rounded-lg bg-[rgb(var(--primary))] px-4 text-sm font-medium text-white hover:bg-[rgb(var(--primary))]/90">
          <PlusIcon className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload Files"}
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
          <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]"><CircleStackIcon className="w-4 h-4" />Objects</div>
          <div className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">{stats?.totalObjects ?? 0}</div>
        </div>
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
          <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]"><ChartBarIcon className="w-4 h-4" />Storage</div>
          <div className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">{stats?.totalSizeLabel ?? "0 B"}</div>
        </div>
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
          <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]"><PhotoIcon className="w-4 h-4" />Images</div>
          <div className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">{stats?.byType.image?.count ?? 0}</div>
        </div>
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
          <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]"><PhotoIcon className="w-4 h-4" />Videos</div>
          <div className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">{stats?.byType.video?.count ?? 0}</div>
        </div>
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
          <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]"><ChartBarIcon className="w-4 h-4" />Estimated Cost</div>
          <div className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">${(stats?.estimatedMonthlyCostUsd ?? 0).toFixed(3)}/mo</div>
        </div>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[rgb(var(--foreground))]">Cleanup Suggestions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-[rgb(var(--muted-foreground))]">
            Older Than (days)
            <input
              type="number"
              min={1}
              value={cleanupDays}
              onChange={(e) => setCleanupDays(Number(e.target.value || 30))}
              className="mt-1 h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm"
            />
          </label>
          <label className="text-xs text-[rgb(var(--muted-foreground))]">
            Max Usage Count
            <input
              type="number"
              min={0}
              value={cleanupUsage}
              onChange={(e) => setCleanupUsage(Number(e.target.value || 0))}
              className="mt-1 h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              onClick={() => runCleanup(true)}
              className="h-9 rounded-lg border border-[rgb(var(--border))] px-3 text-sm font-medium"
            >
              Preview Cleanup
            </button>
            <button
              onClick={() => runCleanup(false)}
              className="h-9 rounded-lg bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete Matched
            </button>
          </div>
        </div>
        {cleanupPreview && (
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Matching files: {cleanupPreview.matchedCount} · Reclaimable: {cleanupPreview.reclaimedSizeLabel}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by filename or URL..."
          className="h-9 min-w-[240px] flex-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 text-left text-[11px] uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Variants</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))] bg-[rgb(var(--card))]">
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-[rgb(var(--muted-foreground))]" colSpan={8}>Loading media objects...</td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-[rgb(var(--muted-foreground))]" colSpan={8}>No media objects found for this filter.</td>
                </tr>
              )}

              {!loading && filtered.map((file) => (
                <tr key={file.id}>
                  <td className="px-4 py-3">
                    {file.type === "image" && (
                      <img src={file.previewUrl || file.url} alt={file.originalName} className="h-12 w-16 rounded object-cover" />
                    )}
                    {file.type === "video" && (
                      <video src={file.url} poster={file.thumbnailUrl || undefined} className="h-12 w-16 rounded object-cover" muted />
                    )}
                    {file.type !== "image" && file.type !== "video" && (
                      <div className="h-12 w-16 rounded border border-[rgb(var(--border))] grid place-items-center text-[10px] text-[rgb(var(--muted-foreground))]">{file.type}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[rgb(var(--foreground))]">{file.originalName}</div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">{new Date(file.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TYPE_BADGES[file.type] || TYPE_BADGES.document}`}>
                      {file.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{file.sizeLabel || formatBytes(file.size)}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[rgb(var(--foreground))]">{file.variants?.length ?? 0} variants</div>
                    <div className="text-[11px] text-[rgb(var(--muted-foreground))]">
                      {(file.variants || []).slice(0, 2).map((v) => `${v.width || "orig"}/${v.format}`).join(" · ") || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <a href={file.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-[rgb(var(--primary))] hover:underline">
                      {file.url}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-[rgb(var(--muted-foreground))]">{file.usageCount}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMedia(file.id)}
                      className="rounded-md p-1.5 text-[rgb(var(--muted-foreground))] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10"
                      title="Delete media"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
