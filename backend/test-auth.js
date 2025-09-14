// Test script to verify authentication and API functionality
const BACKEND_URL = 'http://localhost:5000/api';

// Test JWT token generation and validation
function generateTestJWT() {
  const jwt = require('jsonwebtoken');
  const secret = 'newstrnt-super-secret-jwt-key-2025';
  
  const payload = {
    id: 'admin-test',
    email: 'admin@newstrnt.com',
    role: 'admin',
    type: 'admin_token',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };
  
  return jwt.sign(payload, secret);
}

// Test basic connectivity
async function testPing() {
  try {
    const response = await fetch(`${BACKEND_URL}/ping`);
    const result = await response.json();
    console.log('✅ Ping test:', result);
    return true;
  } catch (error) {
    console.error('❌ Ping test failed:', error.message);
    return false;
  }
}

// Test health check
async function testHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const result = await response.json();
    console.log('✅ Health check:', result);
    return result.database;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test authentication
async function testAuth() {
  try {
    const token = generateTestJWT();
    console.log('🔑 Generated JWT token (first 50 chars):', token.substring(0, 50) + '...');
    
    const response = await fetch(`${BACKEND_URL}/articles/admin/drafts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Authentication successful! Articles endpoint responded:', {
        success: result.success,
        articlesCount: result.articles?.length || 0,
        status: response.status
      });
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Authentication failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Auth test error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Running NewsTRNT Backend Tests...\n');
  
  const pingResult = await testPing();
  const healthResult = await testHealth();
  const authResult = await testAuth();
  
  console.log('\n📊 Test Summary:');
  console.log(`Server Connectivity: ${pingResult ? '✅' : '❌'}`);
  console.log(`Database Health: ${healthResult ? '✅' : '❌'}`);
  console.log(`JWT Authentication: ${authResult ? '✅' : '❌'}`);
  
  if (pingResult && healthResult && authResult) {
    console.log('\n🎉 All systems operational! Authentication and database are working correctly.');
  } else {
    console.log('\n⚠️  Some systems need attention. Check the errors above.');
  }
}

// Only run if this is the main module
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testPing, testHealth, testAuth, generateTestJWT };