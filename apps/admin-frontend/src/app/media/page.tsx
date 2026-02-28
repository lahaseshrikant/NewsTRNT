"use client";

import React, { useState, useEffect, useCallback } from"react";
import adminAuth from"@/lib/auth/admin-auth";
import { API_CONFIG } from"@/config/api";
import {
 PhotoIcon,
 DocumentTextIcon,
 ChartBarIcon,
 CircleStackIcon,
 EyeIcon,
 PlusIcon,
 XMarkIcon,
} from"@/components/icons/AdminIcons";

const API_BASE_URL = API_CONFIG.baseURL;

/* ── Types ── */
interface MediaFile {
 id: string;
 name: string;
 type:"image" |"video" |"audio" |"document";
 size: string;
 url: string;
 uploadDate: string;
 dimensions?: string;
 duration?: string;
 usedIn: string[];
}

/* ── Helpers ── */
const TYPE_META: Record<string, { label: string; color: string; iconBg: string }> = {
 image: { label:"Image", color:"text-emerald-600 dark:text-emerald-400", iconBg:"bg-emerald-50 dark:bg-emerald-900/20" },
 video: { label:"Video", color:"text-[rgb(var(--primary))]", iconBg:"bg-[rgb(var(--primary))]/5" },
 audio: { label:"Audio", color:"text-violet-600 dark:text-violet-400", iconBg:"bg-violet-50 dark:bg-violet-900/20" },
 document: { label:"Document", color:"text-amber-600 dark:text-amber-400", iconBg:"bg-amber-50 dark:bg-amber-900/20" },
};

const FileTypeIcon = ({ type, className ="w-5 h-5" }: { type: string; className?: string }) => {
 switch (type) {
 case"image": return <PhotoIcon className={className} />;
 case"video": return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>;
 case"audio": return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" /></svg>;
 default: return <DocumentTextIcon className={className} />;
 }
};

/* ── Component ── */
const MediaLibrary: React.FC = () => {
 const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
 const [viewMode, setViewMode] = useState<"grid" |"list">("grid");
 const [filterType, setFilterType] = useState<"all" |"image" |"video" |"audio" |"document">("all");
 const [searchTerm, setSearchTerm] = useState("");

 /* ── Data ── */
 const fetchMedia = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const response = await fetch(`${API_BASE_URL}/admin/media`, {
 headers: { ...adminAuth.getAuthHeaders(),"Content-Type":"application/json" },
 });
 if (response.ok) {
 const data = await response.json();
 setMediaFiles(data.files || []);
 } else {
 setMediaFiles([]);
 }
 } catch (err) {
 console.error("Error fetching media:", err);
 setError("Failed to load media files");
 setMediaFiles([]);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => { fetchMedia(); }, [fetchMedia]);

 const filteredFiles = mediaFiles.filter((file) => {
 const typeMatch = filterType ==="all" || file.type === filterType;
 const searchMatch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
 return typeMatch && searchMatch;
 });

 const totalSize = mediaFiles.reduce((sum, file) => {
 const size = parseFloat(file.size.split("")[0]);
 const unit = file.size.split("")[1];
 return sum + (unit ==="GB" ? size * 1024 : size);
 }, 0);

 const fileTypeCounts = mediaFiles.reduce((acc, file) => {
 acc[file.type] = (acc[file.type] || 0) + 1;
 return acc;
 }, {} as Record<string, number>);

 /* ── Selection ── */
 const handleFileSelect = (id: string) =>
 setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
 const handleSelectAll = () =>
 setSelectedFiles((prev) => (prev.length === filteredFiles.length ? [] : filteredFiles.map((f) => f.id)));

 /* ── UI ── */
 const statCards = [
 { label:"Total Files", value: mediaFiles.length, icon: <CircleStackIcon className="w-4 h-4" /> },
 { label:"Images", value: fileTypeCounts.image || 0, icon: <PhotoIcon className="w-4 h-4" /> },
 { label:"Videos", value: fileTypeCounts.video || 0, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg> },
 { label:"Documents", value: fileTypeCounts.document || 0, icon: <DocumentTextIcon className="w-4 h-4" /> },
 { label:"Storage", value: `${totalSize.toFixed(1)} MB`, icon: <ChartBarIcon className="w-4 h-4" /> },
 ];

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">Media Library</h1>
 <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">Upload, organize, and manage all your media assets</p>
 </div>
 <div className="flex gap-2">
 <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3.5 text-sm font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>
 New Folder
 </button>
 <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[rgb(var(--primary))] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90">
 <PlusIcon className="w-4 h-4" />
 Upload Files
 </button>
 </div>
 </div>

 {/* Stats Row */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
 {statCards.map((s) => (
 <div key={s.label} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
 <div className="flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
 {s.icon}
 <span className="text-[11px] uppercase tracking-wider">{s.label}</span>
 </div>
 <div className="mt-2 text-xl font-semibold tabular-nums text-[rgb(var(--foreground))]">{s.value}</div>
 </div>
 ))}
 </div>

 {/* Toolbar */}
 <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
 {/* Search */}
 <div className="relative flex-1 min-w-[200px]">
 <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
 <input
 type="text"
 placeholder="Search files..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="h-9 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] pl-9 pr-3 text-sm text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 </div>

 {/* Type Filter */}
 <select
 value={filterType}
 onChange={(e) => setFilterType(e.target.value as any)}
 className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 >
 <option value="all">All Types</option>
 <option value="image">Images</option>
 <option value="video">Videos</option>
 <option value="audio">Audio</option>
 <option value="document">Documents</option>
 </select>

 {/* View Toggle */}
 <div className="flex overflow-hidden rounded-lg border border-[rgb(var(--border))]">
 {(["grid","list"] as const).map((mode) => (
 <button
 key={mode}
 onClick={() => setViewMode(mode)}
 className={`h-9 px-3 text-xs font-medium uppercase tracking-wider transition-colors ${
 viewMode === mode
 ?"bg-[rgb(var(--primary))] text-white"
 :"bg-[rgb(var(--background))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
 } ${mode ==="list" ?"border-l border-[rgb(var(--border))]" :""}`}
 >
 {mode}
 </button>
 ))}
 </div>

 {/* Bulk Actions */}
 {selectedFiles.length > 0 && (
 <div className="flex items-center gap-2 ml-auto">
 <span className="text-xs text-[rgb(var(--muted-foreground))]">{selectedFiles.length} selected</span>
 <button className="h-8 rounded-lg bg-red-600 px-3 text-xs font-medium text-white transition-colors hover:bg-red-700">
 Delete
 </button>
 <button className="h-8 rounded-lg border border-[rgb(var(--border))] px-3 text-xs font-medium text-[rgb(var(--foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10">
 Move
 </button>
 </div>
 )}
 </div>

 {/* Select All / Count */}
 <div className="flex items-center gap-3">
 <button onClick={handleSelectAll} className="text-xs font-medium text-[rgb(var(--primary))] hover:underline">
 {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 ?"Deselect All" :"Select All"}
 </button>
 <span className="text-xs text-[rgb(var(--muted-foreground))]">
 {filteredFiles.length} file{filteredFiles.length !== 1 &&"s"}{""}
 {selectedFiles.length > 0 && `· ${selectedFiles.length} selected`}
 </span>
 </div>

 {/* Loading */}
 {loading && (
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
 {Array.from({ length: 12 }).map((_, i) => (
 <div key={i} className="skeleton-warm h-40 rounded-xl" />
 ))}
 </div>
 )}

 {/* Error */}
 {error && (
 <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/10 dark:text-red-400">
 {error}
 </div>
 )}

 {/* Empty State */}
 {!loading && !error && filteredFiles.length === 0 && (
 <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border))] py-16 text-center">
 <PhotoIcon className="mb-3 h-10 w-10 text-[rgb(var(--muted-foreground))]" />
 <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">No media files</h3>
 <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">Upload images, videos, or documents to get started.</p>
 <button className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[rgb(var(--primary))] px-4 text-sm font-medium text-white">
 <PlusIcon className="w-4 h-4" />
 Upload
 </button>
 </div>
 )}

 {/* Grid View */}
 {!loading && viewMode ==="grid" && filteredFiles.length > 0 && (
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
 {filteredFiles.map((file) => {
 const selected = selectedFiles.includes(file.id);
 const meta = TYPE_META[file.type] || TYPE_META.document;
 return (
 <button
 key={file.id}
 onClick={() => handleFileSelect(file.id)}
 className={`group relative flex flex-col items-center rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
 selected
 ?"border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/5 ring-1 ring-[rgb(var(--primary))]"
 :"border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary))]/40"
 }`}
 >
 {/* Selection Indicator */}
 <span className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] transition-all ${
 selected ?"bg-[rgb(var(--primary))] text-white" :"border border-[rgb(var(--border))] bg-[rgb(var(--card))] opacity-0 group-hover:opacity-100"
 }`}>
 {selected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
 </span>

 {/* Icon */}
 <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${meta.iconBg}`}>
 <FileTypeIcon type={file.type} className={`w-6 h-6 ${meta.color}`} />
 </div>

 <span className="w-full truncate text-center text-xs font-medium text-[rgb(var(--foreground))]" title={file.name}>
 {file.name}
 </span>
 <span className="mt-0.5 text-[11px] text-[rgb(var(--muted-foreground))]">{file.size}</span>
 <span className={`mt-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.iconBg} ${meta.color}`}>
 {file.type}
 </span>
 </button>
 );
 })}
 </div>
 )}

 {/* List View */}
 {!loading && viewMode ==="list" && filteredFiles.length > 0 && (
 <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))]">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/5">
 <th className="w-10 px-4 py-3 text-left">
 <input
 type="checkbox"
 checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
 onChange={handleSelectAll}
 className="rounded border-[rgb(var(--border))]"
 />
 </th>
 {["File","Type","Size","Details","Uploaded","Used In",""].map((h) => (
 <th key={h} className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-[rgb(var(--border))]">
 {filteredFiles.map((file) => {
 const meta = TYPE_META[file.type] || TYPE_META.document;
 return (
 <tr key={file.id} className="bg-[rgb(var(--card))] transition-colors hover:bg-[rgb(var(--muted))]/5">
 <td className="px-4 py-3">
 <input
 type="checkbox"
 checked={selectedFiles.includes(file.id)}
 onChange={() => handleFileSelect(file.id)}
 className="rounded border-[rgb(var(--border))]"
 />
 </td>
 {/* File */}
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}>
 <FileTypeIcon type={file.type} className={`w-4 h-4 ${meta.color}`} />
 </div>
 <div className="min-w-0">
 <div className="truncate font-medium text-[rgb(var(--foreground))]">{file.name}</div>
 <div className="text-[11px] text-[rgb(var(--muted-foreground))]">ID: {file.id}</div>
 </div>
 </div>
 </td>
 {/* Type */}
 <td className="px-4 py-3">
 <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.iconBg} ${meta.color}`}>
 {file.type}
 </span>
 </td>
 {/* Size */}
 <td className="px-4 py-3 tabular-nums text-[rgb(var(--foreground))]">{file.size}</td>
 {/* Details */}
 <td className="px-4 py-3 text-[rgb(var(--muted-foreground))]">
 {file.dimensions || file.duration ||"—"}
 </td>
 {/* Date */}
 <td className="px-4 py-3 text-[rgb(var(--muted-foreground))]">{file.uploadDate}</td>
 {/* Used In */}
 <td className="px-4 py-3">
 <div className="flex flex-wrap gap-1">
 {file.usedIn.slice(0, 2).map((u, i) => (
 <span key={i} className="rounded-md bg-[rgb(var(--primary))]/10 px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--primary))]">
 {u}
 </span>
 ))}
 {file.usedIn.length > 2 && (
 <span className="text-[11px] text-[rgb(var(--muted-foreground))]">+{file.usedIn.length - 2}</span>
 )}
 </div>
 </td>
 {/* Actions */}
 <td className="px-4 py-3">
 <div className="flex items-center gap-1">
 <button className="rounded-md p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--foreground))]" title="Preview">
 <EyeIcon className="w-4 h-4" />
 </button>
 <button className="rounded-md p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-[rgb(var(--muted))]/10 hover:text-[rgb(var(--foreground))]" title="Download">
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
 </button>
 <button className="rounded-md p-1.5 text-[rgb(var(--muted-foreground))] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10" title="Delete">
 <XMarkIcon className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Upload Drop Zone */}
 <div className="rounded-xl border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 text-center transition-colors hover:border-[rgb(var(--primary))]/40">
 <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--primary))]/10">
 <svg className="h-6 w-6 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
 </div>
 <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">Upload New Files</h3>
 <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">Drag and drop files here, or click to browse</p>
 <button className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[rgb(var(--primary))] px-4 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--primary))]/90">
 Choose Files
 </button>
 <p className="mt-2 text-[11px] text-[rgb(var(--muted-foreground))]">
 JPG, PNG, GIF, MP4, MP3, PDF — Max 100 MB per file
 </p>
 </div>
 </div>
 );
};

export default MediaLibrary;


