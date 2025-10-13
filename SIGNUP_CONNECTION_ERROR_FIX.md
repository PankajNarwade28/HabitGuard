# 🚨 SIGNUP FAILED - "Failed to Connect to Server"

## 🐛 The Problem

Users getting error: **"Failed to connect to server"** when trying to signup.

## 🔍 Root Cause

The backend server is not running or not accessible.

---

## ✅ QUICK FIX - Start Backend Server

### Step 1: Check if Backend is Running

Open a **new terminal** and run:

```powershell
# Check if something is running on port 3000
netstat -ano | findstr :3000
```

**If nothing shows up** → Backend is NOT running ❌

### Step 2: Start the Backend Server

**Option A: Use the Startup Script (Easiest)**

1. Navigate to your project folder
2. Double-click: `start-backend.bat`

OR in terminal:
```powershell
.\start-backend.bat
```

**Option B: Manual Start**

```powershell
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

### Step 3: Verify Server is Running

You should see this output:
```
🚀 HabitGuard Backend Server Started
📡 Server running on http://localhost:3000
💻 API endpoints available at http://localhost:3000/api

📋 Available routes:
  POST /api/auth/signup - Register new user
  POST /api/auth/login - User login
  GET  /api/auth/profile - Get user profile (requires auth)
  GET  /api/health - Health check
```

### Step 4: Test Backend is Working

Open browser and go to: `http://localhost:3000/api/health`

**Expected response:**
```json
{
  "success": true,
  "message": "HabitGuard API is running",
  "timestamp": "2025-10-13T..."
}
```

If you see this → Backend is working! ✅

### Step 5: Try Signup Again

Now go back to your app and try signing up again. It should work!

---

## 🔧 Alternative Solutions

### Solution 1: Testing on Emulator (Android Studio)

If you're using **Android Emulator**, use `10.0.2.2` instead of `localhost`:

**Edit:** `services/AuthService.ts`

```typescript
// Change from:
const API_BASE_URL = 'http://localhost:3000/api';

// To:
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

### Solution 2: Testing on Physical Device

If you're using a **physical device**, use your computer's IP address:

**Step 1: Find your IP address**

```powershell
ipconfig
```

Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.5`)

**Step 2: Update API URL**

**Edit:** `services/AuthService.ts`

```typescript
// Change from:
const API_BASE_URL = 'http://localhost:3000/api';

// To (replace with YOUR IP):
const API_BASE_URL = 'http://192.168.1.5:3000/api';
```

**Step 3: Ensure device and PC on same network**

Both must be connected to the same WiFi network!

### Solution 3: Configure Firewall

Windows Firewall might be blocking the connection:

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "Node.js" or add it
4. Enable for both Private and Public networks

---

## 🔍 Troubleshooting

### Check 1: Is Backend Running?

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000
```

### Check 2: Can You Access Backend?

Open browser: `http://localhost:3000/api/health`

- ✅ Shows JSON response → Backend is working
- ❌ Connection refused → Backend is NOT running

### Check 3: Database Connection

Check backend terminal for:
- ✅ "Successfully connected to MySQL database"
- ❌ "Error connecting to MySQL database"

If database error, you need to:
1. Start MySQL/XAMPP
2. Add credentials to `backend/config/db.config.js`

### Check 4: Check Backend Logs

Look at backend terminal for errors when signup is attempted.

---

## 📋 Complete Setup Checklist

- [ ] MySQL/XAMPP is running
- [ ] Database `habitguard` exists in phpMyAdmin
- [ ] `users` table created (run `backend/setup-database.sql`)
- [ ] Database credentials added to `backend/config/db.config.js`
- [ ] Backend dependencies installed (`npm install` in backend folder)
- [ ] Backend server is running (`npm start` in backend folder)
- [ ] Health endpoint works (`http://localhost:3000/api/health`)
- [ ] Correct API URL in `services/AuthService.ts` for your setup:
  - Emulator: `http://10.0.2.2:3000/api`
  - Physical Device: `http://YOUR_IP:3000/api`
  - Web/iOS Simulator: `http://localhost:3000/api`

---

## 🚀 Quick Start Commands

### Terminal 1: Start Backend

```powershell
cd backend
npm install  # First time only
npm start
```

**Keep this terminal open!**

### Terminal 2: Start React Native App

```powershell
npm start
# Press 'a' for Android
```

---

## 🎯 Common Error Messages & Fixes

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "Failed to connect to server" | Backend not running | Start backend with `npm start` |
| "Network request failed" | Wrong API URL | Update API_BASE_URL in AuthService.ts |
| "ECONNREFUSED" | Backend not accessible | Check firewall, use correct IP |
| "MySQL connection error" | Database not configured | Add credentials to db.config.js |
| "Table doesn't exist" | Users table not created | Run setup-database.sql in phpMyAdmin |

---

## 📱 Testing on Different Platforms

### Android Emulator
```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

### Physical Android Device
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
// Example: 'http://192.168.1.5:3000/api'
```

### iOS Simulator
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Expo Go App (Physical Device)
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000/api';
// Both devices must be on same WiFi
```

---

## 🔄 Step-by-Step Quick Fix

1. **Open new terminal**
   ```powershell
   cd c:\Projects\HabitGuard\backend
   ```

2. **Check if MySQL is running**
   - Open XAMPP/WAMP
   - Start Apache & MySQL

3. **Check database exists**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Look for `habitguard` database
   - If not exist, create it and run `setup-database.sql`

4. **Add database credentials**
   - Edit `backend/config/db.config.js`
   - Add your MySQL username and password

5. **Start backend**
   ```powershell
   npm install
   npm start
   ```

6. **Wait for this message:**
   ```
   ✅ Successfully connected to MySQL database
   🚀 HabitGuard Backend Server Started
   ```

7. **Test in browser:**
   - Open: `http://localhost:3000/api/health`
   - Should see JSON response

8. **Update API URL (if needed)**
   - If using emulator: `http://10.0.2.2:3000/api`
   - If using physical device: `http://YOUR_IP:3000/api`

9. **Try signup again in app** ✅

---

## 📞 Still Not Working?

### Debug with PowerShell:

```powershell
# Test backend is accessible
Invoke-RestMethod -Uri "http://localhost:3000/api/health"

# Should return:
# success  : True
# message  : HabitGuard API is running
# timestamp: 2025-10-13T...
```

### Check Logs:

**Backend Terminal:** Look for errors when signup button is pressed

**App Console:** Look for error messages in Metro bundler

### Test Signup via PowerShell:

```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" `
                  -Method Post `
                  -Body $body `
                  -ContentType "application/json"
```

If this works but app doesn't → API URL issue in app

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Backend terminal shows: "Successfully connected to MySQL database"
2. ✅ Browser shows JSON at `http://localhost:3000/api/health`
3. ✅ Signup form submits without "Failed to connect" error
4. ✅ User appears in phpMyAdmin `users` table
5. ✅ App redirects to main screen after signup

---

**Most Common Fix: Just start the backend server!** 🚀

```powershell
cd backend
npm start
```

Then try signup again! 🎉
