// Dev Tools layout — restricts all pages under /dev-tools to SUPER_ADMIN role
'use client';

import { ReactNode } from'react';
import UnifiedAdminGuard from'@/components/auth/UnifiedAdminGuard';

export default function DevToolsLayout({ children }: { children: ReactNode }) {
 return (
 <UnifiedAdminGuard requireSuperAdmin>
 {children}
 </UnifiedAdminGuard>
 );
}
