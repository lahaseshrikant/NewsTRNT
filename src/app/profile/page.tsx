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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="text-lg font-medium">{user.name || 'Not set'}</p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-lg font-medium">{getEmailString(user.email)}</p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground">Role</label>
              <p className="text-lg font-medium capitalize">{user.role || 'User'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
