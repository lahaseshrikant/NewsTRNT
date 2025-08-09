'use client';

import { useAdmin } from '@/contexts/AdminContext';
import AdminLogin from './AdminLogin';
import { ReactNode } from 'react';

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return (
    <>
      {children}
    </>
  );
};

export default AdminGuard;
