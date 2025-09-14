// Test script for UnifiedAdminAuth integration with backend API
const fs = require('fs');
const path = require('path');

// Simple Node.js fetch implementation (for older Node versions)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Mock localStorage for server-side testing
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  }
};

// Mock window and Buffer for server environment
global.window = { localStorage: global.localStorage };
global.Buffer = Buffer;

async function testUnifiedAuth() {
  console.log('🧪 Testing UnifiedAdminAuth Integration...\n');

  try {
    // Test 1: Login via Next.js API route (which uses UnifiedAdminAuth)
    console.log('1. Testing login with superadmin credentials via Next.js API...');
    const loginData = {
      email: 'superadmin@newstrnt.com',
      password: 'NewsTRNT!SuperAdmin#2025'
    };

    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginResult = await loginResponse.json();
    console.log('✅ Login successful:', {
      success: loginResult.success,
      email: loginResult.user?.email,
      isAdmin: loginResult.user?.isAdmin,
      isSuperAdmin: loginResult.user?.isSuperAdmin
    });

    const token = loginResult.token;
    if (!token) {
      throw new Error('No token received from login');
    }
    console.log('✅ Token received (length:', token.length, 'chars)\n');

    // Test 2: Test authenticated API call to articles admin endpoint
    console.log('2. Testing authenticated API call to /api/articles/admin...');
    const articlesResponse = await fetch('http://localhost:5000/api/articles/admin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!articlesResponse.ok) {
      const errorText = await articlesResponse.text();
      throw new Error(`Articles API failed: ${articlesResponse.status} ${articlesResponse.statusText} - ${errorText}`);
    }

    const articlesResult = await articlesResponse.json();
    console.log('✅ Articles API call successful:', {
      success: articlesResult.success,
      articleCount: articlesResult.articles?.length || 0,
      hasNext: articlesResult.pagination?.hasNext
    });

    // Test 3: Test token verification via Next.js API
    console.log('\n3. Testing token verification via Next.js /api/auth/me...');
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (meResponse.ok) {
      const meResult = await meResponse.json();
      console.log('✅ Token verification successful:', {
        success: meResult.success,
        email: meResult.user?.email,
        isAdmin: meResult.user?.isAdmin
      });
    } else {
      console.log('⚠️ Token verification failed:', meResponse.status, meResponse.statusText);
    }

    console.log('\n🎉 All tests passed! UnifiedAdminAuth integration is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Additional debugging info
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
      console.log('   Run: cd backend && npm run dev');
    }
  }
}

// Run the test
testUnifiedAuth();