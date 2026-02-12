'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEmailString } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth token
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.replace('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userData));
    } catch {
      router.replace('/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper dark:bg-ink flex items-center justify-center">
        <p className="font-mono text-xs tracking-wider uppercase text-stone">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <div className="bg-ink dark:bg-ivory/5 border-b-2 border-vermillion">
        <div className="container mx-auto py-8 px-4">
          <h1 className="font-serif text-3xl font-bold text-ivory">My Profile</h1>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        <div className="bg-ivory dark:bg-ash/10 border border-ash dark:border-ash/20 p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs tracking-wider uppercase text-stone">Name</label>
              <p className="font-serif text-lg font-medium text-ink dark:text-ivory">{user.name || 'Not set'}</p>
            </div>
            
            <div className="border-t border-ash dark:border-ash/20 pt-4">
              <label className="font-mono text-xs tracking-wider uppercase text-stone">Email</label>
              <p className="font-serif text-lg font-medium text-ink dark:text-ivory">{getEmailString(user.email)}</p>
            </div>
            
            <div className="border-t border-ash dark:border-ash/20 pt-4">
              <label className="font-mono text-xs tracking-wider uppercase text-stone">Role</label>
              <p className="font-serif text-lg font-medium text-ink dark:text-ivory capitalize">{user.role || 'User'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
