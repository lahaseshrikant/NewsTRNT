/** Shared admin UI component library — barrel export */

export { AdminCard, AdminCardHeader, StatCard } from './AdminCard';
export { AdminButton } from './AdminButton';
export { AdminBadge, StatusBadge } from './AdminBadge';
export { AdminTable, AdminInput, AdminSelect } from './AdminTable';
export { AdminTabs, AdminModal, EmptyState, Tooltip, ProgressBar } from './AdminExtras';

/* ─── New Design System Components ───────────────────────── */
export { default as ActivityFeedWidget } from './ActivityFeed';
export type { ActivityItem, ActivityType } from './ActivityFeed';

export { default as BulkActionsBar } from './BulkActionsBar';
export type { BulkAction } from './BulkActionsBar';

export { default as CommandPalette } from './CommandPalette';

export { default as ConfirmDialog } from './ConfirmDialog';

export { default as DataExport } from './DataExport';
export type { ExportColumn, ExportFormat } from './DataExport';

export { default as EmptyStateCard } from './EmptyState';

export { default as KeyboardShortcuts } from './KeyboardShortcuts';

export { default as PageHeader } from './PageHeader';

export { default as SearchFilter } from './SearchFilter';
export type { FilterGroup, FilterOption } from './SearchFilter';

export { default as StatCardNew } from './StatCard';

export { ToastProvider, useToast } from './ToastNotification';

export { default as FavoritesWidget } from './FavoritesWidget';
export type { Favorite } from './FavoritesWidget';

export { default as QuotaBar } from './QuotaBar';

export { UserAvatar, UserAvatarGroup, StatusDot } from './UserAvatar';
export type { Status, AvatarProps } from './UserAvatar';
