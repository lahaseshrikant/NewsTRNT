"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Breadcrumb from "@/components/layout/Breadcrumb";
import UnifiedAdminGuard from "@/components/auth/UnifiedAdminGuard";
import AdminJWTBridge from "@/lib/jwt-auth";
import { showToast } from "@/lib/toast";

// Navigation configuration stored in localStorage for now
const NAVIGATION_STORAGE_KEY = 'newstrnt-navigation-config';
const COMBINED_NAVIGATION_KEY = 'newstrnt-combined-navigation';

interface NavigationItem {
  id: string;
  name: string;
  label: string;
  href: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  isSystem: boolean;
  type: 'navigation' | 'category';
  categoryId?: string; // For category items
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive?: boolean;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
  // compatibility fields so Category can be used in union with NavigationItem
  label?: string;
  href?: string;
  isSystem?: boolean;
  type?: 'category';
}

interface NavigationFormState {
  name: string;
  label: string;
  href: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

const DEFAULT_FORM_STATE: NavigationFormState = {
  name: "",
  label: "",
  href: "",
  icon: "",
  isActive: true,
  sortOrder: 0,
};

// NOTE: `defaultNavigationItems` removed — admin navigation must be sourced from the database (no hardcoded defaults or local fallback).

const NavigationPage: React.FC = () => {
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [formState, setFormState] = useState<NavigationFormState>(DEFAULT_FORM_STATE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<NavigationItem | Category | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const originalAlertRef = useRef<typeof window.alert | null>(null);
  const originalOverflowRef = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load categories from backend
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/categories?includeInactive=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      const categoriesList = data.categories || [];
      setCategories(categoriesList);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Load navigation from admin backend (DB only — no local fallback)
  const loadNavigation = useCallback(async () => {
    try {
      setLoading(true);
      const token = AdminJWTBridge.getJWTToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const resp = await fetch('/api/navigation/admin', { method: 'GET', headers, cache: 'no-cache' });
      if (!resp.ok) {
        console.error(`Failed to load navigation from server (status ${resp.status})`);
        setError('Unable to load navigation from server — navigation must come from the database.');
        setNavigation([]);
        return;
      }

      const data: NavigationItem[] = await resp.json();
      setNavigation(data.map(item => ({ ...item, type: 'navigation' })));
      setError(null);
    } catch (error) {
      console.error('Error loading navigation from API:', error);
      setError('Unable to load navigation from server — navigation must come from the database.');
      setNavigation([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // saveNavigation is a no-op in admin UI — authoritative source is the database.
  const saveNavigation = useCallback((items: NavigationItem[]) => {
    // Intentionally do not persist navigation to localStorage from admin UI.
    // Admin changes are authoritative in the DB; frontend consumers should fetch from the API.
    return;
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadNavigation();
      loadCategories();
    }
  }, [isMounted, loadNavigation, loadCategories]);

  // Prevent any default alerts on this page with multiple strategies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Store original functions
      originalAlertRef.current = window.alert;
      const originalError = console.error;

      // Override window.alert
      window.alert = (message) => {
        console.warn('🚫 Default alert blocked on navigation page:', message);
        console.trace('Alert call stack:'); // Show where the alert came from
        showToast(String(message), 'warning');
        return undefined;
      };

      // Also intercept any unhandled promise rejections that might cause alerts
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.warn('🚫 Unhandled promise rejection blocked:', event.reason);
        event.preventDefault();
        showToast('Operation failed. Please try again.', 'error');
      };

      // Add global error handler for this page
      const handleError = (event: ErrorEvent) => {
        console.warn('🚫 Global error intercepted:', event.message);
        event.preventDefault();
        showToast('An error occurred. Please try again.', 'error');
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
      document.body.style.overflow = "hidden";
    } else if (originalOverflowRef.current !== null) {
      document.body.style.overflow = originalOverflowRef.current ?? "";
      originalOverflowRef.current = null;
    }

    return () => {
      if (originalOverflowRef.current !== null) {
        document.body.style.overflow = originalOverflowRef.current ?? "";
        originalOverflowRef.current = null;
      }
    };
  }, [isModalOpen, isMounted]);

  const handleFieldChange = (field: keyof NavigationFormState, value: string | number | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev } as Record<string, string>;
      delete copy[field];
      return copy;
    });
  };

  const openModal = (item?: NavigationItem) => {
    if (item) {
      setEditingItem(item);
      const normalizeLabel = (v: string) => String(v || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
      setFormState({
        name: item.name,
        label: normalizeLabel(item.label),
        href: item.href,
        icon: item.icon || "",
        isActive: item.isActive,
        sortOrder: item.sortOrder,
      });
    } else {
      setEditingItem(null);
      setFormState(DEFAULT_FORM_STATE);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormState(DEFAULT_FORM_STATE);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({}); // clear prior errors

    // basic client-side checks to avoid predictable server rejections
    const nameTrim = String(formState.name || '').trim();
    const hrefTrim = String(formState.href || '').trim();
    if (nameTrim.length < 2) {
      setFormErrors({ name: 'Name must be at least 2 characters' });
      setIsSubmitting(false);
      return;
    }
    if (!hrefTrim) {
      setFormErrors({ href: 'URL path is required' });
      setIsSubmitting(false);
      return;
    }

    // prevent duplicates client-side
    const duplicateName = navigation.some(n => n.name.toLowerCase() === nameTrim.toLowerCase() && n.id !== editingItem?.id);
    if (duplicateName) {
      setFormErrors({ name: 'A navigation item with this name already exists' });
      setIsSubmitting(false);
      return;
    }
    const duplicateHref = navigation.some(n => n.href === hrefTrim && n.id !== editingItem?.id);
    if (duplicateHref) {
      setFormErrors({ href: 'Another navigation item already uses this URL path' });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = AdminJWTBridge.getJWTToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      if (editingItem) {
        // Update existing item on server
        // Don't send `name` or `href` when editing a system item (server rejects those fields)
        const payload: any = {
          label: String(formState.label || '').trim(),
          icon: formState.icon || undefined,
          isActive: formState.isActive,
          sortOrder: Number(formState.sortOrder) || 0
        } as Record<string, any>;

        if (!editingItem.isSystem) {
          // allow changing name/href for non-system items
          payload.name = String(formState.name || '').trim();
          payload.href = String(formState.href || '').trim();
        }

        const response = await fetch(`/api/navigation/${editingItem.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          // try to extract structured validation details from server
          const body = await response.json().catch(() => null);
          if (body?.details && Array.isArray(body.details)) {
            const errors: Record<string, string> = {};
            body.details.forEach((d: any) => {
              const key = Array.isArray(d.path) && d.path.length ? String(d.path[0]) : 'form';
              errors[key] = d.message || String(d);
            });
            setFormErrors(errors);
            throw new Error(body.error || 'Validation failed');
          }

          const msg = await safeErrorMessage(response);
          throw new Error(msg || 'Failed to update navigation item');
        }

        const updated = await response.json();
        const updatedNavigation = navigation.map((item) => (item.id === editingItem.id ? { ...item, ...updated } : item));
        setNavigation(updatedNavigation);
        saveNavigation(updatedNavigation);
        showToast('Navigation item updated successfully', 'success');
      } else {
        // Create new item on server
        const response = await fetch('/api/navigation', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...formState,
            name: String(formState.name || '').trim(),
            label: String(formState.label || '').trim(),
            sortOrder: Number(formState.sortOrder) || 0,
            type: 'navigation'
          })
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          if (body?.details && Array.isArray(body.details)) {
            const errors: Record<string, string> = {};
            body.details.forEach((d: any) => {
              const key = Array.isArray(d.path) && d.path.length ? String(d.path[0]) : 'form';
              errors[key] = d.message || String(d);
            });
            setFormErrors(errors);
            throw new Error(body.error || 'Validation failed');
          }

          // server may return a clearer error (e.g. duplicate name)
          if (body?.error) {
            // surface server error directly in UI when appropriate
            if (body.error.includes('already exists')) {
              setFormErrors({ name: body.error });
            }
            throw new Error(body.error);
          }

          const msg = await safeErrorMessage(response);
          throw new Error(msg || 'Failed to create navigation item');
        }

        const created = await response.json();
        const updatedNavigation = [...navigation, { ...created, type: 'navigation' }];
        setNavigation(updatedNavigation);
        saveNavigation(updatedNavigation);
        showToast('Navigation item created successfully', 'success');
      }

      closeModal();
    } catch (error) {
      console.error("Error saving navigation item:", error);
      // prefer showing form-specific messages when available
      if (Object.keys(formErrors).length > 0) {
        showToast('Please fix the highlighted errors and try again.', 'error');
      } else {
        showToast(error instanceof Error ? error.message : "Failed to save navigation item", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleItemStatus = async (item: NavigationItem | Category) => {
    if (item.type === 'category') {
      showToast('Categories are managed via API and cannot be toggled here', 'info');
      return;
    }

    try {
      const token = AdminJWTBridge.getJWTToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`/api/navigation/${item.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isActive: !(item as NavigationItem).isActive })
      });

      if (!response.ok) {
        const msg = await safeErrorMessage(response);
        throw new Error(msg || 'Failed to toggle status');
      }

      const updated = await response.json();
      const updatedNavigation = navigation.map((nav) => (nav.id === item.id ? { ...nav, ...updated } : nav));
      setNavigation(updatedNavigation);
      saveNavigation(updatedNavigation);
      showToast(`Navigation item ${!item.isActive ? 'activated' : 'deactivated'}`, 'success');
    } catch (err) {
      console.error('Error toggling navigation status:', err);
      showToast(err instanceof Error ? err.message : 'Unable to toggle status', 'error');
    }
  };

  const deleteItem = async (item: NavigationItem | Category) => {
    if (item.type === 'category') {
      showToast('Categories are managed via API and cannot be deleted here', 'info');
      return;
    }

    if ((item as NavigationItem).isSystem) {
      showToast('Cannot delete system navigation items', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${(item as NavigationItem).label}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = AdminJWTBridge.getJWTToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`/api/navigation/${item.id}`, { method: 'DELETE', headers });
      if (!response.ok) {
        const msg = await safeErrorMessage(response);
        throw new Error(msg || 'Failed to delete navigation item');
      }

      const updatedNavigation = navigation.filter((nav) => nav.id !== item.id);
      setNavigation(updatedNavigation);
      saveNavigation(updatedNavigation);
      showToast('Navigation item deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting navigation item:', err);
      showToast(err instanceof Error ? err.message : 'Unable to delete navigation item', 'error');
    }
  };

  const handleDragStart = (e: React.DragEvent, item: NavigationItem | Category) => {
    setDraggedItem(item);
    // ensure drag works across browsers — set a dataTransfer payload as well
    try {
      e.dataTransfer.setData('text/plain', item.id);
    } catch (err) {
      /* ignore */
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem) return;

    const draggedIndex = sortedNavigation.findIndex(nav => nav.id === draggedItem.id);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    // Create new order
    const newNavigation = [...sortedNavigation];
    const [removed] = newNavigation.splice(draggedIndex, 1);
    newNavigation.splice(dropIndex, 0, removed);

    // Update sortOrder for all items (treat both models' sortOrder as global positions)
    const updatedNavigation = newNavigation.map((nav, index) => ({
      ...nav,
      sortOrder: index + 1,
      updatedAt: new Date().toISOString()
    }));

    // Persist changes to server for both navigation items and categories
    try {
      const token = AdminJWTBridge.getJWTToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const navUpdates: Promise<any>[] = [];

      for (const item of updatedNavigation) {
        if (item.type === 'navigation') {
          // update navigation table
          navUpdates.push(
            fetch(`/api/navigation/${item.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ sortOrder: item.sortOrder })
            }).then(r => r.ok ? r.json() : Promise.reject(r))
          );
        } else if (item.type === 'category' && item.categoryId) {
          // update category table
          navUpdates.push(
            fetch(`/api/categories/${item.categoryId}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ sortOrder: item.sortOrder })
            }).then(r => r.ok ? r.json() : Promise.reject(r))
          );
        }
      }

      const results = await Promise.allSettled(navUpdates);
      const failed = results.some(r => r.status === 'rejected');
      if (failed) {
        showToast('Some items failed to persist to server; UI updated locally', 'warning');
      }

      // refresh authoritative state from server
      await Promise.allSettled([loadNavigation(), loadCategories()]);
    } catch (err) {
      console.error('Error persisting order to server:', err);
      showToast('Failed to persist order to server; local order saved as fallback', 'warning');
      // still update local state below
      const navItems = updatedNavigation.filter(item => item.type === 'navigation');
      setNavigation(navItems as NavigationItem[]);
      saveNavigation(navItems as NavigationItem[]);
    }

    // Clear drag state and give feedback
    setDraggedItem(null);
    setDragOverIndex(null);
    showToast('Navigation & category order updated', 'success');
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Create combined navigation from navigation items and categories
  const combinedNavigation = useMemo(() => {
    const navItems = navigation.map(item => ({ ...item, type: 'navigation' as const }));
    const categoryItems = categories.map((cat) => ({
      id: `category-${cat.id}`,
      name: cat.name,
      label: cat.name,
      href: `/category/${cat.slug}`,
      icon: cat.icon || '📂',
      isActive: cat.isActive !== false,
      // Use category.sortOrder as a global position (we treat both models' sortOrder as global positions)
      sortOrder: cat.sortOrder || 0,
      isSystem: false,
      type: 'category' as const,
      categoryId: cat.id,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }));

    return [...navItems, ...categoryItems];
  }, [navigation, categories]);

  const sortedNavigation = useMemo(
    () =>
      [...combinedNavigation].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.label.localeCompare(b.label);
      }),
    [combinedNavigation]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Reusable helper copied from categories page to extract server error messages
  async function safeErrorMessage(response: Response): Promise<string | null> {
    try {
      const text = await response.text();
      if (!text) return null;
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed === 'string') return parsed;
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

  const stats = useMemo(() => {
    const totalItems = combinedNavigation.length;
    const activeCount = combinedNavigation.filter(item => item.isActive).length;
    const inactiveCount = combinedNavigation.filter(item => !item.isActive).length;
    const systemCount = combinedNavigation.filter(item => item.isSystem).length;
    const navigationCount = combinedNavigation.filter(item => item.type === 'navigation').length;
    const categoryCount = combinedNavigation.filter(item => item.type === 'category').length;

    return {
      totalItems,
      activeCount,
      inactiveCount,
      systemCount,
      navigationCount,
      categoryCount,
    };
  }, [combinedNavigation]);

  const renderModal = () => {
    if (!isModalOpen) return null;

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl transition-colors">
          <div className="border-b border-border/60 p-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingItem ? "Edit Navigation Item" : "Add Navigation Item"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {editingItem ? "Update navigation item details and ordering." : "Create a new navigation item."}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Name *</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="e.g., home, news, opinion"
                  className={`w-full rounded-xl border-2 ${formErrors.name ? 'border-red-400 ring-1 ring-red-300' : 'border-border'} bg-card px-4 py-3 text-foreground shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  required
                  disabled={editingItem?.isSystem}
                />
                {formErrors.name && (
                  <p className="mt-2 text-xs text-red-500">{formErrors.name}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Unique identifier for the navigation item.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Display Label *</label>
                <input
                  type="text"
                  value={formState.label}
                  onChange={(event) => handleFieldChange("label", event.target.value)}
                  placeholder="e.g., Home, News, Opinion"
                  className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-foreground shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Text shown in the navigation menu.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">URL Path *</label>
                <input
                  type="text"
                  value={formState.href}
                  onChange={(event) => handleFieldChange("href", event.target.value)}
                  placeholder="e.g., /, /news, /opinion"
                  className={`w-full rounded-xl border-2 ${formErrors.href ? 'border-red-400 ring-1 ring-red-300' : 'border-border'} bg-card px-4 py-3 text-foreground shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  required
                  disabled={editingItem?.isSystem}
                />
                {formErrors.href && (
                  <p className="mt-2 text-xs text-red-500">{formErrors.href}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  The URL this navigation item links to.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Icon</label>
                <input
                  type="text"
                  value={formState.icon}
                  onChange={(event) => handleFieldChange("icon", event.target.value)}
                  placeholder="Optional emoji or short label"
                  maxLength={10}
                  className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-center text-2xl text-foreground shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <p className="mt-2 text-xs text-muted-foreground">For quick visual identification in navigation.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Display Order</label>
                <input
                  type="number"
                  value={formState.sortOrder}
                  onChange={(event) => handleFieldChange("sortOrder", Number(event.target.value) || 0)}
                  min={0}
                  className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-foreground shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Lower numbers appear first. Use 0 to rely on alphabetical ordering.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formState.isActive}
                  onChange={(event) => handleFieldChange("isActive", event.target.checked)}
                  className="rounded border-border text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                  Active (visible in navigation)
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border/60 p-8">
              <button
                type="button"
                className="rounded-xl border border-border bg-muted px-6 py-3 font-medium text-foreground transition hover:bg-muted/80"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Content", href: "/admin/content" },
          { label: "Navigation", href: "/admin/content/navigation" },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-lg transition-colors">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Navigation Management
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage navigation menu items and their display order. Drag and drop to reorder items.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadNavigation()}
                className="rounded-xl border border-border bg-background px-4 py-3 font-medium text-foreground transition hover:bg-muted/60"
                disabled={loading}
              >
                🔄 Refresh
              </button>
              <button
                type="button"
                onClick={() => openModal()}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700"
              >
                ➕ Add Navigation Item
              </button>

              {/* Sync categories into navigation (create missing nav entries from categories) */}
              <button
                onClick={async () => {
                  try {
                    const token = AdminJWTBridge.getJWTToken();
                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                    if (token) headers.Authorization = `Bearer ${token}`;
                    const resp = await fetch('/api/navigation/sync-categories', { method: 'POST', headers });
                    if (!resp.ok) throw new Error(`Sync failed (status ${resp.status})`);
                    await loadNavigation();
                    await loadCategories();
                    showToast('Categories synced into navigation', 'success');
                  } catch (err) {
                    console.error('Error syncing categories:', err);
                    showToast(err instanceof Error ? err.message : 'Failed to sync categories', 'error');
                  }
                }}
                className="ml-3 inline-flex items-center rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-slate-100"
              >
                🔁 Sync categories
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Items" value={stats.totalItems} accent="from-blue-500/20 to-blue-500/5" />
            <StatCard label="Active" value={stats.activeCount} accent="from-emerald-500/20 to-emerald-500/5" />
            <StatCard label="Inactive" value={stats.inactiveCount} accent="from-amber-500/20 to-amber-500/5" />
            <StatCard label="System Items" value={stats.systemCount} accent="from-purple-500/20 to-purple-500/5" />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-lg transition-colors">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Navigation Order</h2>
              <p className="text-sm text-muted-foreground">
                Drag and drop navigation items to reorder them. Display order affects how they appear in the header navigation.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>🔀</span>
              <span>Drag to reorder</span>
            </div>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p>Loading navigation items...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-red-500">{error}</p>
              <button
                type="button"
                onClick={() => loadNavigation()}
                className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700"
              >
                Try Again
              </button>
            </div>
          ) : sortedNavigation.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-muted-foreground">No navigation items yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating your first navigation item.
              </p>
              <button
                type="button"
                onClick={() => openModal()}
                className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700"
              >
                Create Navigation Item
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {sortedNavigation.map((item, index) => (
                <article
                  key={item.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative overflow-hidden rounded-2xl border border-border/70 p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl supports-[backdrop-filter]:bg-card/75 cursor-move ${
                    item.isActive
                      ? 'bg-card/95'
                      : 'bg-card/50 opacity-75 grayscale-[25%]'
                  } ${dragOverIndex === index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${
                    draggedItem?.id === item.id ? 'opacity-50' : ''
                  }`}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: item.isActive ? '#10b981' : '#f59e0b' }}
                  />

                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
                          style={{ backgroundColor: item.isActive ? '#10b981' : '#f59e0b' }}
                        >
                          {item.type === 'category' ? '📁' : (item.icon || item.label.charAt(0).toUpperCase())}
                        </span>
                        <div className="flex flex-col items-center gap-1">
                          {item.isSystem && (
                            <div className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              System
                            </div>
                          )}
                          <div className={`rounded px-2 py-0.5 text-xs font-semibold ${
                            item.type === 'category'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {item.type === 'category' ? 'Category' : 'Navigation'}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{item.label}</h3>
                        <p className="text-xs text-muted-foreground">Name: {item.name}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        item.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-muted-foreground">
                    {item.type === 'category' ? (
                      <>Category: <code className="rounded bg-muted px-2 py-1 font-mono">{item.name}</code></>
                    ) : (
                      <>Links to: <code className="rounded bg-muted px-2 py-1 font-mono">{item.href}</code></>
                    )}
                  </p>

                  <div className="mb-6 grid gap-2 rounded-xl border border-border/50 bg-muted/40 p-4 text-xs transition">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Display Order</span>
                      <span className="font-mono text-sm text-foreground">#{item.sortOrder}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-sm text-foreground">{formatDate(item.createdAt || new Date().toISOString())}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.type === 'navigation' && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleItemStatus(item)}
                          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                            item.isActive
                              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                          }`}
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal(item)}
                          className="rounded-xl border border-border bg-background p-2.5 text-muted-foreground transition hover:text-blue-600 hover:shadow dark:hover:text-blue-400"
                          title="Edit navigation item"
                        >
                          ✏️
                        </button>
                        {!item.isSystem && (
                          <button
                            type="button"
                            onClick={() => deleteItem(item)}
                            className="rounded-xl border border-border bg-background p-2.5 text-muted-foreground transition hover:text-red-600 hover:shadow dark:hover:text-red-400"
                            title="Move to trash"
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    )}
                    {item.type === 'category' && (
                      <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        Category (managed via API)
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {/* final drop target to allow dropping after last item */}
              <div
                onDragOver={(e) => handleDragOver(e, sortedNavigation.length)}
                onDrop={(e) => handleDrop(e, sortedNavigation.length)}
                className={`flex items-center justify-center rounded-2xl border-2 border-dashed border-border/30 p-6 text-sm text-muted-foreground transition ${dragOverIndex === sortedNavigation.length ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              >
                {sortedNavigation.length === 0 ? 'Drop items here' : 'Drop here to append to end'}
              </div>
            </div>
          )}
        </section>
      </div>

      {renderModal()}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; accent: string }> = ({ label, value, accent }) => (
  <div className={`rounded-2xl border border-border bg-gradient-to-br ${accent} p-6 shadow-sm transition`}>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
  </div>
);

const NavigationRoute: React.FC = () => (
  <UnifiedAdminGuard>
    <NavigationPage />
  </UnifiedAdminGuard>
);

export default NavigationRoute;