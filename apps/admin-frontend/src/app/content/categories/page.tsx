"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from"react";
import { createPortal } from"react-dom";
import AdminJWTBridge from"@/lib/auth/jwt-auth";
import { showToast } from"@/lib/toast";

// Use Next.js API routes instead of direct backend calls
const API_BASE_URL ="";

interface Category {
 id: string;
 name: string;
 slug: string;
 description: string;
 articleCount: number;
 color: string;
 icon?: string;
 isActive: boolean;
 sortOrder: number;
 createdAt: string;
 updatedAt: string;
}

interface CategoryFormState {
 name: string;
 description: string;
 color: string;
 icon: string;
 sortOrder: number;
}

const DEFAULT_FORM_STATE: CategoryFormState = {
 name:"",
 description:"",
 color:"#3B82F6",
 icon:"",
 sortOrder: 0,
};

const normalizeCategory = (raw: any): Category => ({
 id: raw.id,
 name: raw.name,
 slug: raw.slug,
 description: raw.description ??"",
 articleCount: typeof raw.articleCount ==="number" ? raw.articleCount : raw._count?.articles ?? 0,
 color: raw.color ??"#3B82F6",
 icon: raw.icon ??"",
 isActive: raw.isActive !== false,
 sortOrder: typeof raw.sortOrder ==="number" ? raw.sortOrder : raw.sort_order ?? 0,
 createdAt: raw.createdAt ?? new Date().toISOString(),
 updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
});

const generateSlug = (value: string) =>
 value
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9\s-]/g,"")
 .replace(/\s+/g,"-")
 .replace(/-+/g,"-");

const CategoriesPage: React.FC = () => {
 const [categories, setCategories] = useState<Category[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isMounted, setIsMounted] = useState(false);
 const [editingCategory, setEditingCategory] = useState<Category | null>(null);
 const [formState, setFormState] = useState<CategoryFormState>(DEFAULT_FORM_STATE);
 const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
 const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
 const originalAlertRef = useRef<typeof window.alert | null>(null);
 const originalOverflowRef = useRef<string | null>(null);
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 setIsMounted(true);
 }, []);

 // Prevent any default alerts on this page with multiple strategies
 useEffect(() => {
 if (typeof window !=='undefined') {
 // Store original functions
 originalAlertRef.current = window.alert;
 const originalError = console.error;
 
 // Override window.alert
 window.alert = (message) => {
 console.warn('Default alert blocked on categories page:', message);
 console.trace('Alert call stack:'); // Show where the alert came from
 showToast(String(message),'warning');
 return undefined;
 };

 // Also intercept any unhandled promise rejections that might cause alerts
 const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
 console.warn('Unhandled promise rejection blocked:', event.reason);
 event.preventDefault();
 showToast('Operation failed. Please try again.','error');
 };

 // Add global error handler for this page
 const handleError = (event: ErrorEvent) => {
 console.warn('Global error intercepted:', event.message);
 event.preventDefault();
 showToast('An error occurred. Please try again.','error');
 };

 window.addEventListener('unhandledrejection', handleUnhandledRejection);
 window.addEventListener('error', handleError);

 return () => {
 // Restore original functions
 if (originalAlertRef.current) {
 window.alert = originalAlertRef.current;
 }
 window.removeEventListener('unhandledrejection', handleUnhandledRejection);
 window.removeEventListener('error', handleError);
 };
 }
 }, []);

 useEffect(() => {
 if (!isMounted) return;

 if (isModalOpen) {
 if (originalOverflowRef.current === null) {
 originalOverflowRef.current = document.body.style.overflow;
 }
 document.body.style.overflow ="hidden";
 } else if (originalOverflowRef.current !== null) {
 document.body.style.overflow = originalOverflowRef.current ??"";
 originalOverflowRef.current = null;
 }

 return () => {
 if (originalOverflowRef.current !== null) {
 document.body.style.overflow = originalOverflowRef.current ??"";
 originalOverflowRef.current = null;
 }
 };
 }, [isModalOpen, isMounted]);

 useEffect(() => {
 if (!isModalOpen) return;

 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key ==="Escape") {
 event.preventDefault();
 closeModal();
 }
 };

 window.addEventListener("keydown", handleKeyDown);
 return () => window.removeEventListener("keydown", handleKeyDown);
 }, [isModalOpen]);

 const getAuthHeaders = useCallback((): Record<string, string> => {
 const token = AdminJWTBridge.getJWTToken();
 const headers: Record<string, string> = {"Content-Type":"application/json" };
 if (token) {
 headers.Authorization = `Bearer ${token}`;
 }
 return headers;
 }, []);

 const fetchCategories = useCallback(
 async (showLoader = true) => {
 try {
 if (showLoader) {
 setLoading(true);
 }
 setError(null);

 const response = await fetch(`/api/categories?includeStats=true&includeInactive=true`, {
 method:"GET",
 headers: getAuthHeaders(),
 cache:"no-cache",
 });

 if (!response.ok) {
 throw new Error(`Failed to fetch categories (${response.status})`);
 }

 const payload = await response.json();
 // Backend may return either an array or a wrapped object { categories: [...] }.
 // Accept both shapes for backward-compatibility.
 const items = Array.isArray(payload) ? payload : payload?.categories ?? [];
 const normalized = (Array.isArray(items) ? items : []).map(normalizeCategory);

 setCategories(normalized);
 } catch (err) {
 console.error("Error fetching categories", err);
 setCategories([]);
 setError(err instanceof Error ? err.message :"Unable to load categories");
 } finally {
 if (showLoader) {
 setLoading(false);
 }
 }
 },
 [getAuthHeaders]
 );

 useEffect(() => {
 fetchCategories();
 }, [fetchCategories]);

 const openModal = (category?: Category) => {
 if (category) {
 setEditingCategory(category);
 setFormState({
 name: category.name,
 description: category.description,
 color: category.color,
 icon: category.icon ??"",
 sortOrder: category.sortOrder,
 });
 } else {
 setEditingCategory(null);
 setFormState(DEFAULT_FORM_STATE);
 }

 setIsModalOpen(true);
 };

 const closeModal = () => {
 setIsModalOpen(false);
 setEditingCategory(null);
 setFormState(DEFAULT_FORM_STATE);
 setIsSubmitting(false);
 };

 const handleFieldChange = (field: keyof CategoryFormState, value: string) => {
 setFormState((prev) => ({
 ...prev,
 [field]: field ==="sortOrder" ? Number(value) || 0 : value,
 }));
 };

 const handleSubmit = async () => {
 if (!formState.name.trim()) {
 showToast("Category name is required","warning");
 return;
 }

 try {
 setIsSubmitting(true);
 const headers = getAuthHeaders();
 if (!headers.Authorization) {
 showToast("Authentication required. Please log in again.","error");
 setIsSubmitting(false);
 return;
 }

 const payload = {
 name: formState.name.trim(),
 description: formState.description.trim(),
 color: formState.color,
 icon: formState.icon.trim(),
 sortOrder: formState.sortOrder,
 };

 const endpoint = `/api/categories${editingCategory ? `/${editingCategory.id}` :""}`;
 const method = editingCategory ?"PUT" :"POST";
 const response = await fetch(endpoint, {
 method,
 headers,
 body: JSON.stringify({
 ...payload,
 ...(editingCategory ? {} : { isActive: true }),
 }),
 });

 if (!response.ok) {
 const message = await safeErrorMessage(response);
 throw new Error(message ?? (editingCategory ?"Failed to update category" :"Failed to create category"));
 }

 await fetchCategories(false);
 showToast(editingCategory ?"Category updated successfully" :"Category created successfully","success");
 closeModal();
 } catch (error) {
 console.error("Error saving category", error);
 showToast(error instanceof Error ? error.message :"Unable to save category","error");
 } finally {
 setIsSubmitting(false);
 }
 };

 const toggleCategoryStatus = async (category: Category) => {
 try {
 const headers = getAuthHeaders();
 if (!headers.Authorization) {
 showToast("Authentication required. Please log in again.","error");
 return;
 }

 const response = await fetch(`/api/categories/${category.id}`, {
 method:"PUT",
 headers,
 body: JSON.stringify({ isActive: !category.isActive }),
 });

 if (!response.ok) {
 const message = await safeErrorMessage(response);
 throw new Error(message ??"Unable to update category status");
 }

 await fetchCategories(false);
 showToast(!category.isActive ?"Category activated" :"Category deactivated","success");
 } catch (error) {
 console.error("Error toggling category", error);
 showToast(error instanceof Error ? error.message :"Unable to toggle category","error");
 }
 };

 const deleteCategory = async (category: Category) => {
 try {
 const confirmed = window.confirm(
 `Move"${category.name}" to trash? You can restore it later from the trash.`
 );

 if (!confirmed) return;

 console.log('Starting category deletion:', category.name);

 const headers = getAuthHeaders();
 if (!headers.Authorization) {
 console.warn('No auth headers found');
 showToast("Authentication required. Please log in again.","error");
 return;
 }

 console.log('Auth headers valid, making delete request...');

 // Use a more robust fetch with timeout and better error handling
 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

 const response = await fetch(`/api/categories/${category.id}`, {
 method:"DELETE",
 headers,
 signal: controller.signal,
 }).finally(() => {
 clearTimeout(timeoutId);
 });

 console.log('Delete response received:', response.status, response.statusText);

 if (!response.ok) {
 const message = await safeErrorMessage(response);
 const errorMsg = message ?? `Failed to delete category (HTTP ${response.status})`;
 console.error("Delete category HTTP error:", errorMsg);
 showToast(errorMsg,"error");
 return;
 }

 console.log('Category moved to trash successfully, refreshing list...');
 await fetchCategories(false);
 showToast("Category moved to trash successfully","success");
 console.log('Category deletion complete');

 } catch (error) {
 console.error("Exception during category deletion:", error);
 
 let errorMessage ="Unable to delete category";
 if (error instanceof Error) {
 if (error.name ==='AbortError') {
 errorMessage ="Delete operation timed out. Please try again.";
 } else if (error.message.includes('Failed to fetch')) {
 errorMessage ="Network error. Please check your connection and try again.";
 } else {
 errorMessage = error.message;
 }
 }
 
 showToast(errorMessage,"error");
 }
 };

 const handleDragStart = (e: React.DragEvent, category: Category) => {
 setDraggedCategory(category);
 e.dataTransfer.effectAllowed ='move';
 };

 const handleDragOver = (e: React.DragEvent, index: number) => {
 e.preventDefault();
 e.dataTransfer.dropEffect ='move';
 setDragOverIndex(index);
 };

 const handleDragLeave = () => {
 setDragOverIndex(null);
 };

 const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
 e.preventDefault();
 setDragOverIndex(null);
 
 if (!draggedCategory) return;

 const draggedIndex = sortedCategories.findIndex(cat => cat.id === draggedCategory.id);
 if (draggedIndex === -1 || draggedIndex === dropIndex) return;

 // Create new order
 const newCategories = [...sortedCategories];
 const [removed] = newCategories.splice(draggedIndex, 1);
 newCategories.splice(dropIndex, 0, removed);

 // Update sortOrder for all categories
 const updatedCategories = newCategories.map((cat, index) => ({
 ...cat,
 sortOrder: index
 }));

 setCategories(updatedCategories);
 setDraggedCategory(null);

 // Save the new order to backend
 try {
 const headers = getAuthHeaders();
 if (!headers.Authorization) {
 showToast("Authentication required. Please log in again.","error");
 await fetchCategories(false); // Revert changes
 return;
 }

 // Update each category's sortOrder
 const updatePromises = updatedCategories.map((cat, index) => 
 fetch(`/api/categories/${cat.id}`, {
 method:"PUT",
 headers,
 body: JSON.stringify({ sortOrder: index }),
 })
 );

 const results = await Promise.allSettled(updatePromises);
 const failedUpdates = results.filter(result => result.status ==='rejected');

 if (failedUpdates.length > 0) {
 console.error('Some category updates failed:', failedUpdates);
 showToast("Some reordering changes may not have been saved. Please refresh and try again.","warning");
 await fetchCategories(false); // Revert changes
 } else {
 showToast("Category order updated successfully","success");
 }
 } catch (error) {
 console.error("Error updating category order:", error);
 showToast("Failed to save new order. Please try again.","error");
 await fetchCategories(false); // Revert changes
 }
 };

 const handleDragEnd = () => {
 setDraggedCategory(null);
 setDragOverIndex(null);
 };

 const sortedCategories = useMemo(
 () =>
 [...categories].sort((a, b) => {
 if (a.sortOrder !== b.sortOrder) {
 return a.sortOrder - b.sortOrder;
 }
 return a.name.localeCompare(b.name);
 }),
 [categories]
 );

 const stats = useMemo(() => {
 const totalArticles = categories.reduce((acc, cat) => acc + (cat.articleCount ?? 0), 0);
 const activeCount = categories.filter((cat) => cat.isActive).length;
 const inactiveCount = categories.length - activeCount;

 return {
 totalCategories: categories.length,
 activeCount,
 inactiveCount,
 totalArticles,
 };
 }, [categories]);

 const renderModal = () => {
 if (!(isMounted && isModalOpen)) {
 return null;
 }

 return createPortal(
 <div
 className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
 onMouseDown={(event) => {
 if (event.target === event.currentTarget) {
 closeModal();
 }
 }}
 >
 <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg transition-colors">
 <div className="border-b border-[rgb(var(--border))]/60 p-8">
 <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">
 {editingCategory ?"Edit Category" :"Add New Category"}
 </h2>
 <p className="mt-2 text-[rgb(var(--muted-foreground))]">
 {editingCategory ?"Update category information and ordering." :"Create a category to organize your content."}
 </p>
 </div>
 <div className="space-y-6 p-8">
 <div>
 <label className="mb-2 block text-sm font-semibold text-[rgb(var(--foreground))]">Category Name *</label>
 <input
 type="text"
 value={formState.name}
 onChange={(event) => handleFieldChange("name", event.target.value)}
 placeholder="e.g., Technology, Business, Sports"
 className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-[rgb(var(--foreground))] shadow-sm transition focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 {!!formState.name && (
 <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
 URL Slug preview: <code className="rounded bg-[rgb(var(--muted))]/10 px-2 py-1 font-mono">{generateSlug(formState.name)}</code>
 </p>
 )}
 </div>

 <div>
 <label className="mb-2 block text-sm font-semibold text-[rgb(var(--foreground))]">Description</label>
 <textarea
 value={formState.description}
 onChange={(event) => handleFieldChange("description", event.target.value)}
 rows={4}
 placeholder="Brief summary of what this category covers"
 className="w-full resize-none rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-[rgb(var(--foreground))] shadow-sm transition focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 </div>

 <div>
 <label className="mb-2 block text-sm font-semibold text-[rgb(var(--foreground))]">Brand Color</label>
 <div className="flex items-center gap-4">
 <div className="relative">
 <input
 type="color"
 value={formState.color}
 onChange={(event) => handleFieldChange("color", event.target.value)}
 className="h-14 w-14 cursor-pointer rounded-xl border border-[rgb(var(--border))]"
 />
 <span className="absolute -right-2 -bottom-2 flex h-6 w-6 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--background))] text-lg">
 
 </span>
 </div>
 <input
 type="text"
 value={formState.color}
 onChange={(event) => handleFieldChange("color", event.target.value)}
 placeholder="#3B82F6"
 className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 font-mono text-sm text-[rgb(var(--foreground))] shadow-sm transition focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 </div>
 <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
 This color highlights cards and indicators for the category.
 </p>
 </div>

 <div>
 <label className="mb-2 block text-sm font-semibold text-[rgb(var(--foreground))]">Category Icon</label>
 <input
 type="text"
 value={formState.icon}
 onChange={(event) => handleFieldChange("icon", event.target.value)}
 placeholder="Optional emoji or short label"
 maxLength={10}
 className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-center text-2xl text-[rgb(var(--foreground))] shadow-sm transition focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">For quick visual identification in dashboards.</p>
 </div>

 <div>
 <label className="mb-2 block text-sm font-semibold text-[rgb(var(--foreground))]">Display Order</label>
 <input
 type="number"
 value={formState.sortOrder}
 onChange={(event) => handleFieldChange("sortOrder", event.target.value)}
 min={0}
 className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-[rgb(var(--foreground))] shadow-sm transition focus:border-[rgb(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/30"
 />
 <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
 Lower numbers appear first. Use 0 to rely on alphabetical ordering.
 </p>
 </div>
 </div>
 <div className="flex items-center justify-end gap-3 border-t border-[rgb(var(--border))]/60 p-8">
 <button
 type="button"
 className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))]/10 px-6 py-3 font-medium text-[rgb(var(--foreground))] transition hover:bg-[rgb(var(--muted))]/10/80"
 onClick={closeModal}
 disabled={isSubmitting}
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={handleSubmit}
 disabled={isSubmitting}
 className="rounded-xl bg-[rgb(var(--primary))] px-8 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
 >
 {isSubmitting ?"Saving..." : editingCategory ?"Update Category" :"Create Category"}
 </button>
 </div>
 </div>
 </div>,
 document.body
 );
 };

 const formatDate = (value: string) => {
 try {
 const date = new Date(value);
 return date.toLocaleDateString("en-US", {
 month:"short",
 day:"numeric",
 year:"numeric",
 });
 } catch (error) {
 return value;
 }
 };

 return (
 <div className="space-y-6">


 <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 shadow-sm transition-colors">
 <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--foreground))]">
 Content Categories
 </h1>
 <p className="mt-2 text-[rgb(var(--muted-foreground))]">
 Organize your publishing pipeline with curated categories.
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-3">
 <button
 type="button"
 onClick={() => fetchCategories(false)}
 className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-4 py-3 font-medium text-[rgb(var(--foreground))] transition hover:bg-[rgb(var(--muted))]/10/60"
 disabled={loading}
 >
 Refresh
 </button>
 <button
 type="button"
 onClick={() => openModal()}
 className="rounded-xl bg-[rgb(var(--primary))] px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
 >
 Add Category
 </button>
 </div>
 </div>

 <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 <StatCard label="Total Categories" value={stats.totalCategories} accent="from-blue-500/20 to-blue-500/5" />
 <StatCard label="Active" value={stats.activeCount} accent="from-emerald-500/20 to-emerald-500/5" />
 <StatCard label="Inactive" value={stats.inactiveCount} accent="from-amber-500/20 to-amber-500/5" />
 <StatCard label="Articles Linked" value={stats.totalArticles} accent="from-purple-500/20 to-purple-500/5" />
 </div>
 </section>

 <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm transition-colors">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h2 className="text-xl font-semibold text-[rgb(var(--foreground))]">Category Order</h2>
 <p className="text-sm text-[rgb(var(--muted-foreground))]">
 Drag and drop categories to reorder them. Display order affects how they appear in navigation and listings.
 </p>
 </div>
 <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
 <span>🔀</span>
 <span>Drag to reorder</span>
 </div>
 </div>
 {loading ? (
 <div className="flex flex-col items-center justify-center gap-4 py-16 text-[rgb(var(--muted-foreground))]">
 <span className="h-10 w-10 animate-spin rounded-full border border-[rgb(var(--primary))] border-t-transparent" />
 <p>Loading categories...</p>
 </div>
 ) : error ? (
 <div className="py-16 text-center">
 <p className="text-lg font-semibold text-red-500">{error}</p>
 <button
 type="button"
 onClick={() => fetchCategories()}
 className="mt-4 rounded-xl bg-[rgb(var(--primary))] px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
 >
 Try Again
 </button>
 </div>
 ) : sortedCategories.length === 0 ? (
 <div className="py-16 text-center">
 <p className="text-lg font-semibold text-[rgb(var(--muted-foreground))]">No categories yet</p>
 <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
 Get started by creating your first category.
 </p>
 <button
 type="button"
 onClick={() => openModal()}
 className="mt-6 rounded-xl bg-[rgb(var(--primary))] px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
 >
 Create Category
 </button>
 </div>
 ) : (
 <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
 {sortedCategories.map((category, index) => (
 <article
 key={category.id}
 draggable
 onDragStart={(e) => handleDragStart(e, category)}
 onDragOver={(e) => handleDragOver(e, index)}
 onDragLeave={handleDragLeave}
 onDrop={(e) => handleDrop(e, index)}
 onDragEnd={handleDragEnd}
 className={`group relative overflow-hidden rounded-xl border border-[rgb(var(--border))]/70 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-sm supports-[backdrop-filter]:bg-[rgb(var(--card))]/75 cursor-move ${
 category.isActive 
 ?'bg-[rgb(var(--card))]/95' 
 :'bg-[rgb(var(--card))]/50 opacity-75 grayscale-[25%]'
 } ${dragOverIndex === index ?'ring-2 ring-blue-500 ring-opacity-50' :''} ${
 draggedCategory?.id === category.id ?'opacity-50' :''
 }`}
 >
 <div
 className="absolute inset-x-0 top-0 h-1"
 style={{ backgroundColor: category.color }}
 />

 <div className="mb-6 flex items-start justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex flex-col items-center gap-1">
 <span
 className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm"
 style={{ backgroundColor: category.color }}
 >
 {category.icon || category.name.charAt(0).toUpperCase()}
 </span>
 <div className="flex gap-0.5">
 <div className="h-1 w-1 rounded-full bg-[rgb(var(--muted))]/40"></div>
 <div className="h-1 w-1 rounded-full bg-[rgb(var(--muted))]/40"></div>
 <div className="h-1 w-1 rounded-full bg-[rgb(var(--muted))]/40"></div>
 </div>
 </div>
 <div>
 <h3 className="text-xl font-semibold text-[rgb(var(--foreground))]">{category.name}</h3>
 <p className="text-xs text-[rgb(var(--muted-foreground))]">Slug: {category.slug}</p>
 </div>
 </div>
 <span
 className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
 category.isActive
 ?"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
 :"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
 }`}
 >
 {category.isActive ?"Active" :"Inactive"}
 </span>
 </div>

 <p className="mb-4 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-[rgb(var(--muted-foreground))]">
 {category.description ||"No description provided."}
 </p>

 <div className="mb-6 grid gap-2 rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--muted))]/10 p-4 text-xs transition">
 <div className="flex items-center justify-between">
 <span className="text-[rgb(var(--muted-foreground))]">Articles Linked</span>
 <span className="text-sm font-semibold text-[rgb(var(--foreground))]">{category.articleCount}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[rgb(var(--muted-foreground))]">Display Order</span>
 <span className="font-mono text-sm text-[rgb(var(--foreground))]">#{category.sortOrder}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-[rgb(var(--muted-foreground))]">Created</span>
 <span className="text-sm text-[rgb(var(--foreground))]">{formatDate(category.createdAt)}</span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => toggleCategoryStatus(category)}
 className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
 category.isActive
 ?"border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
 :"border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
 }`}
 >
 {category.isActive ?"Deactivate" :"Activate"}
 </button>
 <button
 type="button"
 onClick={() => openModal(category)}
 className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] p-2.5 text-[rgb(var(--muted-foreground))] transition hover:text-[rgb(var(--primary))] hover:shadow"
 title="Edit category"
 >
 
 </button>
 <button
 type="button"
 onClick={() => deleteCategory(category)}
 className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] p-2.5 text-[rgb(var(--muted-foreground))] transition hover:text-red-600 hover:shadow dark:hover:text-red-400"
 title="Move to trash"
 >
 
 </button>
 </div>
 </article>
 ))}
 </div>
 )}
 </section>

 {renderModal()}
 </div>
 );
};

const StatCard: React.FC<{ label: string; value: number; accent: string }> = ({ label, value, accent }) => (
 <div className={`rounded-xl border border-[rgb(var(--border))] bg-gradient-to-br ${accent} p-6 shadow-sm transition`}>
 <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">{label}</p>
 <p className="mt-2 text-2xl font-semibold tabular-nums text-[rgb(var(--foreground))]">{value}</p>
 </div>
);

async function safeErrorMessage(response: Response): Promise<string | null> {
 try {
 const text = await response.text();
 if (!text) return null;
 try {
 const parsed = JSON.parse(text);
 if (typeof parsed ==="string") return parsed;
 if (parsed?.error) return parsed.error;
 if (parsed?.message) return parsed.message;
 return text;
 } catch (err) {
 return text;
 }
 } catch (error) {
 return null;
 }
}

export default CategoriesPage;


