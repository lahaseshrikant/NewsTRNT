// Quick admin login test
console.log('🔍 Testing UnifiedAdminAuth...');

// Test if we can access UnifiedAdminAuth
try {
  // This should work if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check current auth state
    const authState = UnifiedAdminAuth.isAuthenticated();
    console.log('Current auth state:', authState);
    
    if (!authState.isAuthenticated) {
      console.log('🔐 Attempting login with superadmin...');
      const result = UnifiedAdminAuth.login('superadmin@newstrnt.com', 'NewsTRNT!SuperAdmin#2025');
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful!');
        // Test auth again
        const newAuthState = UnifiedAdminAuth.isAuthenticated();
        console.log('New auth state:', newAuthState);
      } else {
        console.log('❌ Login failed:', result.error);
      }
    } else {
      console.log('✅ Already authenticated as:', authState.session?.email);
    }
  }
} catch (error) {
  console.error('Auth test failed:', error);
}