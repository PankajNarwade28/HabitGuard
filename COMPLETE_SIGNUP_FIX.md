# ✅ COMPLETE FIX: "Failed to Connect to Server" Error

## 🚨 The Problem
Users getting **"Failed to connect to server"** error when trying to signup/login.

## 🎯 The Solution
**START THE BACKEND SERVER!**

---

## 🚀 QUICK FIX (2 Minutes)

### Step 1: Start Backend Server

**Option A - Double Click:**
```
Double-click: start-backend.bat
```

**Option B - Command Line:**
```powershell
cd backend
npm install  # First time only
npm start
```

### Step 2: Wait for Success Message

You should see:
```
✅ Successfully connected to MySQL database
🚀 HabitGuard Backend Server Started
📡 Server running on http://localhost:3000
```

### Step 3: Verify Backend is Running

**Option A - Use Check Script:**
```
Double-click: check-backend.bat
```

**Option B - Open Browser:**
```
http://localhost:3000/api/health
```

Should show:
```json
{
  "success": true,
  "message": "HabitGuard API is running"
}
```

### Step 4: Try Signup Again ✅

---

## 🔧 What I Fixed

### 1. ✅ Enhanced Error Messages

Updated `AuthService.ts` to show detailed error info:
- Logs the API URL being used
- Shows which endpoint failed
- Provides helpful troubleshooting steps

**Console will now show:**
```
🔄 Attempting signup to: http://localhost:3000/api/auth/signup
❌ Signup error: [error details]
🔍 API URL: http://localhost:3000/api
💡 Make sure backend server is running at: http://localhost:3000
```

### 2. ✅ Created Check Scripts

**`check-backend.bat` / `check-backend.ps1`**
- Checks if backend is running
- Tests health endpoint
- Shows status in color-coded output

### 3. ✅ Comprehensive Documentation

**`SIGNUP_CONNECTION_ERROR_FIX.md`**
- Complete troubleshooting guide
- Platform-specific fixes
- Step-by-step solutions

---

## 📋 Pre-Flight Checklist

Before testing signup, ensure:

- [ ] **MySQL is running**
  - XAMPP/WAMP started
  - Apache & MySQL services running

- [ ] **Database is configured**
  - Database `habitguard` exists in phpMyAdmin
  - `users` table created (run `backend/setup-database.sql`)
  - Credentials added to `backend/config/db.config.js`

- [ ] **Backend dependencies installed**
  ```powershell
  cd backend
  npm install
  ```

- [ ] **Backend server is running**
  ```powershell
  cd backend
  npm start
  ```

- [ ] **Health check passes**
  - Browser: `http://localhost:3000/api/health`
  - Or run: `check-backend.bat`

---

## 🔍 Testing Different Platforms

### Testing on Android Emulator

**Update `services/AuthService.ts`:**
```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

### Testing on Physical Android Device

1. **Find your computer's IP:**
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.5)

2. **Update `services/AuthService.ts`:**
   ```typescript
   const API_BASE_URL = 'http://192.168.1.5:3000/api';
   ```

3. **Ensure both on same WiFi network**

### Testing on iOS Simulator

Keep default:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

---

## 🧪 Manual Testing

### Test 1: Check Backend is Running

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# If shows result → Backend running ✅
# If empty → Backend NOT running ❌
```

### Test 2: Test Health Endpoint

```powershell
# PowerShell command
Invoke-RestMethod -Uri "http://localhost:3000/api/health"

# Expected output:
# success  : True
# message  : HabitGuard API is running
# timestamp: 2025-10-13T...
```

### Test 3: Test Signup Endpoint

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

# Should return user data and token
```

If PowerShell test works but app doesn't → **API URL issue**

---

## 📊 Troubleshooting Decision Tree

```
Signup fails with "Failed to connect to server"
    ↓
Is backend running? (check-backend.bat)
    ↓
    ├─ NO → Start backend (start-backend.bat)
    │        ↓
    │   Did it start successfully?
    │        ↓
    │        ├─ NO → Check MySQL is running
    │        │        Check database credentials
    │        │        Read AUTHENTICATION_SETUP.md
    │        │
    │        └─ YES → Try signup again ✅
    │
    └─ YES → Can access health endpoint?
             ↓
             ├─ NO → Firewall blocking?
             │        Port conflict?
             │        Check backend logs
             │
             └─ YES → Using correct API URL?
                      ↓
                      ├─ Emulator? Use 10.0.2.2
                      ├─ Device? Use computer IP
                      └─ Simulator? Use localhost
```

---

## 🎯 Common Scenarios & Fixes

### Scenario 1: First Time Setup
**Status:** Backend never started before

**Fix:**
1. Start XAMPP/MySQL
2. Create database in phpMyAdmin
3. Add credentials to `backend/config/db.config.js`
4. Run `cd backend && npm install`
5. Run `npm start`

### Scenario 2: Backend Was Working, Now Isn't
**Status:** Worked yesterday, fails today

**Fix:**
1. Check if XAMPP/MySQL stopped
2. Restart backend server
3. Check if another app is using port 3000

### Scenario 3: Works on One Device, Not Another
**Status:** Works on emulator, fails on phone

**Fix:**
1. Update API_BASE_URL in AuthService.ts
2. Use computer's IP address (not localhost)
3. Ensure same WiFi network

### Scenario 4: Backend Starts But Signup Fails
**Status:** Health check works, signup doesn't

**Fix:**
1. Check backend console for errors
2. Verify database connection
3. Check users table exists
4. Test with PowerShell command

---

## 📝 Files Created/Modified

### Created Files:
1. ✅ `SIGNUP_CONNECTION_ERROR_FIX.md` - Detailed troubleshooting
2. ✅ `check-backend.bat` - Windows batch checker
3. ✅ `check-backend.ps1` - PowerShell checker
4. ✅ `COMPLETE_SIGNUP_FIX.md` - This summary

### Modified Files:
1. ✅ `services/AuthService.ts` - Enhanced error logging

---

## 🚀 Quick Commands Reference

```powershell
# Start backend
cd backend && npm start

# Check if running
netstat -ano | findstr :3000

# Test health
Invoke-RestMethod http://localhost:3000/api/health

# Check status
.\check-backend.ps1

# Get your IP (for device testing)
ipconfig

# Clear app data (for fresh test)
adb shell pm clear com.habitguard.wellbeing
```

---

## ✅ Success Checklist

You'll know everything is working when:

1. ✅ **Backend Terminal Shows:**
   ```
   ✅ Successfully connected to MySQL database
   🚀 HabitGuard Backend Server Started
   📡 Server running on http://localhost:3000
   ```

2. ✅ **Health Check Works:**
   - Browser shows JSON at `http://localhost:3000/api/health`
   - Or `check-backend.bat` shows success

3. ✅ **App Console Shows:**
   ```
   🔄 Attempting signup to: http://localhost:3000/api/auth/signup
   📡 Signup response status: 201
   📦 Signup response data: { success: true, ... }
   ```

4. ✅ **User Created:**
   - Check phpMyAdmin → habitguard → users
   - New row with hashed password appears

5. ✅ **App Redirects:**
   - After signup, goes to main app
   - No error alerts

---

## 💡 Pro Tips

### Tip 1: Keep Backend Running
**Open a dedicated terminal for backend:**
```powershell
cd backend
npm start
# Leave this terminal open while developing
```

### Tip 2: Auto-Start Backend
**Add to Windows Startup (optional):**
1. Press `Win + R`
2. Type: `shell:startup`
3. Create shortcut to `start-backend.bat`

### Tip 3: Quick Test Script
**Save this as `test-signup.ps1`:**
```powershell
$body = @{
    name = "Test User"
    email = "test$(Get-Random)@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" `
                  -Method Post `
                  -Body $body `
                  -ContentType "application/json"
```

### Tip 4: Environment-Based API URL
**For production, use environment variables:**
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Dev
  : 'https://your-production-api.com/api';  // Prod
```

---

## 📞 Still Having Issues?

### Check These in Order:

1. **Backend logs** - Look at terminal running backend
2. **App console** - Look at Metro bundler output
3. **Network tab** - If using Chrome DevTools
4. **Database** - Verify in phpMyAdmin
5. **Firewall** - Windows Defender settings

### Get More Help:

- 📖 Read: `AUTHENTICATION_SETUP.md`
- 🐛 Read: `DEBUG_APP_FLOW.md`
- 🔧 Run: `check-backend.ps1`
- 🧪 Test: Use PowerShell commands above

---

## 🎉 Summary

**Most common cause:** Backend not running

**Most common fix:** 
```powershell
cd backend
npm start
```

**Verification:**
```
Open: http://localhost:3000/api/health
Run: check-backend.bat
```

**Then try signup again!** ✅

---

**Remember: Backend must be running for signup/login to work!** 🚀

Keep the backend terminal open while developing! 💻
