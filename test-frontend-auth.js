// Frontend Authentication Test
// This simulates the exact flow used by the admin interface

console.log('🔐 Testing NewsTRNT Authentication Flow...\n');

// Simulate AdminJWTBridge
function generateAdminJWT() {
  // Mock admin user data (same as what AdminJWTBridge uses)
  const adminUser = {
    id: 'admin-user-001',
    email: 'admin@newstrnt.com',
    role: 'admin',
    name: 'Admin User'
  };
  
  // Generate JWT using the same secret as backend
  const jwt = require('jsonwebtoken');
  const secret = 'newstrnt-super-secret-jwt-key-2025';
  
  const payload = {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    name: adminUser.name,
    type: 'admin_token',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };
  
  return jwt.sign(payload, secret);
}

// Test the exact same flow as the frontend
async function testFrontendFlow() {
  console.log('1️⃣ Generating admin JWT token...');
  const token = generateAdminJWT();
  console.log('✅ Token generated (length:', token.length, ')');
  
  console.log('\n2️⃣ Testing /api/articles/admin/drafts endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/articles/admin/drafts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Admin endpoint responded with:', {
        success: data.success,
        articlesCount: data.articles?.length || 0,
        hasArticles: Array.isArray(data.articles),
        pagination: data.pagination ? 'Yes' : 'No'
      });
      
      console.log('\n🎉 AUTHENTICATION IS WORKING CORRECTLY!');
      console.log('🔒 The admin interface should now work without 403 errors.');
      
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ FAILED:', {
        status: response.status,
        error: errorText
      });
      
      // Analyze common errors
      if (response.status === 401) {
        console.log('🔍 Diagnosis: Token validation failed - check JWT secret match');
      } else if (response.status === 403) {
        console.log('🔍 Diagnosis: Token valid but insufficient permissions');
      } else if (response.status === 500) {
        console.log('🔍 Diagnosis: Server error - check database connection');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('🔍 Diagnosis: Backend server may not be running on port 5000');
    return false;
  }
}

// Run the test
testFrontendFlow();