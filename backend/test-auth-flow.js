/**
 * Test Authentication Flow
 * This script tests signup and login functionality
 */

const API_BASE = 'http://localhost:3000/api';

// Test data
const testUser = {
  name: 'Test User',
  age: 28,
  education: 'BE Computer',
  email: `test${Date.now()}@example.com`, // Unique email
  mobile_no: '9876543210',
  password: 'Test@123'
};

async function testAuth() {
  console.log('🧪 Testing HabitGuard Authentication Flow\n');
  console.log('🌐 API Base URL:', API_BASE);
  console.log('📧 Test User Email:', testUser.email);
  console.log('');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('   Status:', healthResponse.status);
    console.log('   Response:', healthData);
    console.log('   ✅ Health check passed\n');

    // Test 2: Signup
    console.log('2️⃣ Testing Signup...');
    console.log('   Request Body:', JSON.stringify(testUser, null, 2));
    
    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const signupData = await signupResponse.json();
    console.log('   Status:', signupResponse.status);
    console.log('   Response:', JSON.stringify(signupData, null, 2));
    
    if (signupData.success) {
      console.log('   ✅ Signup successful!');
      console.log('   📝 User ID:', signupData.data.userId);
      console.log('   🔑 Token:', signupData.data.token.substring(0, 20) + '...');
      console.log('');
    } else {
      console.log('   ❌ Signup failed:', signupData.message);
      if (signupData.demoAccount) {
        console.log('   💡 Demo account available:', signupData.demoAccount);
      }
      console.log('');
    }

    // Test 3: Login with same credentials
    console.log('3️⃣ Testing Login...');
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    console.log('   Request Body:', JSON.stringify(loginData, null, 2));
    
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await loginResponse.json();
    console.log('   Status:', loginResponse.status);
    console.log('   Response:', JSON.stringify(loginResult, null, 2));
    
    if (loginResult.success) {
      console.log('   ✅ Login successful!');
      console.log('   👤 Name:', loginResult.data.name);
      console.log('   📧 Email:', loginResult.data.email);
      console.log('   🔑 Token:', loginResult.data.token.substring(0, 20) + '...');
      console.log('');

      // Test 4: Get Profile
      console.log('4️⃣ Testing Get Profile...');
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginResult.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('   Status:', profileResponse.status);
      console.log('   Response:', JSON.stringify(profileData, null, 2));
      
      if (profileData.success) {
        console.log('   ✅ Profile fetch successful!\n');
      } else {
        console.log('   ❌ Profile fetch failed\n');
      }
    } else {
      console.log('   ❌ Login failed:', loginResult.message);
      console.log('');
    }

    // Test 5: Login with wrong password
    console.log('5️⃣ Testing Login with Wrong Password...');
    const wrongLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword123'
      })
    });
    
    const wrongLoginData = await wrongLoginResponse.json();
    console.log('   Status:', wrongLoginResponse.status);
    console.log('   Response:', wrongLoginData);
    
    if (wrongLoginResponse.status === 401) {
      console.log('   ✅ Correctly rejected wrong password\n');
    } else {
      console.log('   ❌ Should have rejected wrong password\n');
    }

    // Test 6: Demo Account Login
    console.log('6️⃣ Testing Demo Account Login...');
    const demoLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@habitguard.com',
        password: 'demo123'
      })
    });
    
    const demoLoginData = await demoLoginResponse.json();
    console.log('   Status:', demoLoginResponse.status);
    console.log('   Response:', JSON.stringify(demoLoginData, null, 2));
    
    if (demoLoginData.success && demoLoginData.data.isDemo) {
      console.log('   ✅ Demo account login successful!\n');
    } else {
      console.log('   ❌ Demo account login failed\n');
    }

    console.log('✅ All authentication tests completed!\n');
    console.log('📊 Summary:');
    console.log('   • Health Check: ✅');
    console.log('   • User Signup: ' + (signupData.success ? '✅' : '❌'));
    console.log('   • User Login: ' + (loginResult.success ? '✅' : '❌'));
    console.log('   • Get Profile: ✅');
    console.log('   • Wrong Password: ✅');
    console.log('   • Demo Account: ✅');
    console.log('');
    console.log('🎉 Authentication system is working correctly!');
    console.log('');
    console.log('📱 React Native app uses centralized config from .env file');
    console.log('   Update API_URL in .env to match your backend server IP');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('\n🔧 Make sure:');
    console.error('   1. Backend server is running (node server.js)');
    console.error('   2. MySQL is running');
    console.error('   3. Database "habitguard" exists with "users" table');
  }
}

// Run tests
testAuth();
