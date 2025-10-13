# Quick Start Guide - Using Authentication in Your App

## ✅ What's Now Working

### 1. User Authentication
- ✅ Users must login/signup before accessing the app
- ✅ JWT tokens for secure API requests
- ✅ Automatic token validation
- ✅ Auto-logout on token expiration

### 2. Real User Data
- ✅ User data stored in MySQL database
- ✅ Available throughout the app via `useUser()` hook
- ✅ Displayed in Settings screen
- ✅ Personalized welcome messages

### 3. Protected Routes
- ✅ All tabs require authentication
- ✅ Automatic redirect to login if not authenticated
- ✅ Token validation on every protected API request

## 🚀 How to Use in Your Screens

### Get Current User Data
```typescript
import { useUser } from '@/contexts/UserContext';

export default function MyScreen() {
  const { user, isAuthenticated } = useUser();
  
  return (
    <View>
      <Text>Name: {user?.name}</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Age: {user?.age}</Text>
      <Text>Education: {user?.education}</Text>
      <Text>Mobile: {user?.mobile_no}</Text>
    </View>
  );
}
```

### Add Logout Button
```typescript
import { useUser } from '@/contexts/UserContext';
import { Alert } from 'react-native';

export default function MyScreen() {
  const { logout } = useUser();
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout',
          onPress: async () => await logout()
        }
      ]
    );
  };
  
  return (
    <TouchableOpacity onPress={handleLogout}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
}
```

### Refresh User Data
```typescript
import { useUser } from '@/contexts/UserContext';
import { useEffect } from 'react';

export default function ProfileScreen() {
  const { refreshUserData } = useUser();
  
  useEffect(() => {
    refreshUserData(); // Fetch latest data from server
  }, []);
  
  // Component code...
}
```

### Check Authentication Status
```typescript
import { useUser } from '@/contexts/UserContext';

export default function MyScreen() {
  const { isAuthenticated, isLoading } = useUser();
  
  if (isLoading) {
    return <ActivityIndicator />;
  }
  
  if (!isAuthenticated) {
    return <Text>Please login</Text>;
  }
  
  return <Text>Authenticated content</Text>;
}
```

## 📱 Screens Already Updated

### 1. Settings Screen (`app/(tabs)/settings.tsx`)
- ✅ Displays real user data (name, email, age, education, mobile)
- ✅ Functional logout button
- ✅ Auto-refresh on screen focus

### 2. Home Screen (`app/(tabs)/index.tsx`)  
- ✅ Personalized welcome: "Welcome Back, John!"
- ✅ Uses user's first name

### 3. Login/Signup Screens
- ✅ Already working with authentication flow
- ✅ Auto-redirect to main app after login

## 🔐 Backend API Endpoints

### Public Endpoints (No Auth Required)
```
POST /api/auth/signup - Register new user
POST /api/auth/login - Login user
```

### Protected Endpoints (Auth Required)
```
GET    /api/auth/profile - Get user profile
PUT    /api/auth/profile - Update user profile
POST   /api/auth/change-password - Change password
DELETE /api/auth/account - Delete account
```

### Making Authenticated API Requests
```typescript
import { authService } from '@/services/AuthService';

const token = await authService.getToken();

const response = await fetch('http://192.168.0.101:3000/api/your-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

## 🎯 Examples for Common Use Cases

### Example 1: User Profile Page
```typescript
import { useUser } from '@/contexts/UserContext';

export default function ProfileScreen() {
  const { user, refreshUserData } = useUser();
  
  return (
    <ScrollView>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.age && <Text>Age: {user.age}</Text>}
        {user?.education && <Text>Education: {user.education}</Text>}
        {user?.mobile_no && <Text>Phone: {user.mobile_no}</Text>}
      </View>
      
      <TouchableOpacity onPress={refreshUserData}>
        <Text>Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

### Example 2: Personalized Analytics
```typescript
import { useUser } from '@/contexts/UserContext';

export default function AnalyticsScreen() {
  const { user } = useUser();
  
  return (
    <View>
      <Text style={styles.header}>
        {user?.name}'s Analytics
      </Text>
      <Text>Email: {user?.email}</Text>
      {/* Show user-specific analytics */}
    </View>
  );
}
```

### Example 3: Conditional Content Based on User
```typescript
import { useUser } from '@/contexts/UserContext';

export default function MyScreen() {
  const { user } = useUser();
  
  // Show different content based on user attributes
  const isPremiumUser = user?.education?.includes('PhD');
  
  return (
    <View>
      <Text>Hello {user?.name}!</Text>
      {isPremiumUser && (
        <View style={styles.premiumBadge}>
          <Text>Premium User</Text>
        </View>
      )}
    </View>
  );
}
```

### Example 4: User-Specific Settings
```typescript
import { useUser } from '@/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { user } = useUser();
  
  const saveUserPreference = async (key: string, value: string) => {
    // Save user-specific preferences
    const prefKey = `${user?.userId}_${key}`;
    await AsyncStorage.setItem(prefKey, value);
  };
  
  const getUserPreference = async (key: string) => {
    const prefKey = `${user?.userId}_${key}`;
    return await AsyncStorage.getItem(prefKey);
  };
  
  // Use these functions for user-specific settings
}
```

## 🛠️ Testing

### Test the Backend (PowerShell)

**1. Test Signup:**
```powershell
$body = @{
    name='Test User'
    email='test@test.com'
    password='test123'
    age=25
} | ConvertTo-Json

Invoke-RestMethod -Uri http://192.168.0.101:3000/api/auth/signup -Method POST -Body $body -ContentType 'application/json'
```

**2. Test Login:**
```powershell
$body = @{
    email='test@test.com'
    password='test123'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://192.168.0.101:3000/api/auth/login -Method POST -Body $body -ContentType 'application/json'

# Save token for next requests
$token = $response.data.token
```

**3. Test Protected Endpoint:**
```powershell
$headers = @{
    'Authorization' = "Bearer $token"
}

Invoke-RestMethod -Uri http://192.168.0.101:3000/api/auth/profile -Method GET -Headers $headers
```

### Test in the App

1. **Start Backend Server:**
   ```bash
   cd backend
   node server.js
   ```
   Should show: `✅ Successfully connected to MySQL database`

2. **Start React Native App:**
   ```bash
   npm start
   ```

3. **Test Flow:**
   - Open app → Should show login/signup screen
   - Sign up or login
   - Check Settings screen for user data
   - Check Home screen for personalized welcome
   - Try logout button in Settings

## 📋 User Data Available

From `useUser()` hook:

```typescript
{
  userId: number;        // Unique user ID
  name: string;         // Full name
  email: string;        // Email address
  age?: number;         // Age (optional)
  education?: string;   // Education level (optional)
  mobile_no?: string;   // Phone number (optional)
}
```

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Tokens stored securely in AsyncStorage
- ✅ Automatic token expiration (30 days)
- ✅ Protected API endpoints
- ✅ User ID extracted from token (not request body)

## 📝 Next Steps

### Recommended Implementations:

1. **Add User Data to Analytics Screen**
   - Show "John's Weekly Report"
   - User-specific insights

2. **Add User Data to Progress Screen**
   - Show "John's Progress"
   - User-specific goals

3. **Create Profile Edit Screen**
   - Allow users to update their info
   - Use PUT /api/auth/profile endpoint

4. **Add User Preferences**
   - Save user-specific app settings
   - Daily goals per user
   - Notification preferences per user

5. **Add User Statistics**
   - Track usage per user
   - Store goals per user
   - Generate reports per user

## ⚠️ Important Notes

1. **Backend Must Be Running**
   - Start with: `cd backend && node server.js`
   - Check: http://localhost:3000/api/health

2. **Network IP**
   - Using: 192.168.0.101
   - Change in `services/AuthService.ts` if your IP changes
   - Check with: `ipconfig`

3. **Both Devices on Same WiFi**
   - Your phone and computer must be on the same network
   - Or use Android Emulator

4. **Database Credentials**
   - Update in `backend/config/db.config.js`
   - MySQL must be running (phpMyAdmin)

## 🎉 Summary

Your app now has:
- ✅ Complete authentication system
- ✅ User context available everywhere
- ✅ Real user data from MySQL database
- ✅ Protected routes and API endpoints
- ✅ Automatic token management
- ✅ Logout functionality
- ✅ Personalized user experience

**Ready to use `useUser()` in any screen!** 🚀
