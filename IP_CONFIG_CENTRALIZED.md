# IP Address Configuration - Complete Setup

## ✅ All Hardcoded IPs Removed

### Current Configuration
**Current IP**: `192.168.0.105` (Updated: November 3, 2025)

All services now use centralized configuration from `.env` file.

## Files Updated

### 1. ✅ `.env` (Root Directory)
```properties
API_URL=http://192.168.0.105:3000/api
API_TIMEOUT=10000
```

### 2. ✅ `app.config.js`
```javascript
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
```
- Reads from .env
- Fallback to localhost (not hardcoded IP)

### 3. ✅ `config/api.config.ts`
```typescript
const getBaseApiUrl = (): string => {
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  
  if (configUrl) {
    return configUrl;
  }
  
  // Fallback to localhost with warning
  console.warn('⚠️ API_URL not found in config! Using localhost fallback.');
  return 'http://localhost:3000/api';
};
```
- Removed hardcoded IP (was 172.16.35.214)
- Shows warning if .env not configured
- All services use this centralized config

### 4. ✅ `backend/controllers/studentController.js`
- Fixed database import: `require('../config/db')` ✅

### 5. ✅ `backend/controllers/quizController.js`
- Fixed database import: `require('../config/db')` ✅

### 6. ✅ `backend/test-auth-flow.js`
- Removed hardcoded IP message
- Updated to reference .env configuration

## Services Using Centralized Config

All these services automatically read from `.env`:

1. ✅ `services/AuthService.ts`
2. ✅ `services/WeeklyReportService.ts`
3. ✅ `services/StudentService.ts`
4. ✅ `services/QuizService.ts`

**Import Chain:**
```
.env → app.config.js → config/api.config.ts → All Services
```

## How to Change IP Address

### When WiFi Changes (Quick Update)

1. **Find your new IP:**
   ```powershell
   ipconfig
   ```
   Look for: `IPv4 Address. . . . . . . . . . . : X.X.X.X`

2. **Update .env file:**
   ```properties
   API_URL=http://YOUR_NEW_IP:3000/api
   ```

3. **Restart Expo (Frontend):**
   ```powershell
   # Press 'r' in terminal where Expo is running
   # OR
   npx expo start --clear
   ```

4. **Backend auto-detects IP** (no restart needed for IP display)

### Verification Steps

1. **Check Backend Server Output:**
   ```
   🚀 HabitGuard Backend Server Started
   📡 Local: http://localhost:3000
   🌐 Network: http://192.168.0.105:3000  ← Should match your IP
   💻 API: http://192.168.0.105:3000/api
   ```

2. **Check Frontend Logs:**
   ```
   📡 API Configuration:
      Base URL: http://192.168.0.105:3000/api  ← Should match .env
      Timeout: 10000 ms
   ```

3. **Test API Connection:**
   ```powershell
   # PowerShell
   Invoke-RestMethod http://192.168.0.105:3000/api/health
   
   # Expected: {"success":true,"message":"HabitGuard API is running",...}
   ```

## Common Issues & Solutions

### Issue: "Failed to connect to server"

**Solution:**
```powershell
# 1. Check your current IP
ipconfig

# 2. Update .env
# API_URL=http://192.168.0.105:3000/api

# 3. Restart Expo
npx expo start --clear

# 4. Verify backend is running
node backend/server.js
```

### Issue: Still seeing old IP in logs

**Cause:** Expo cache not cleared

**Solution:**
```powershell
# Clear cache and restart
npx expo start --clear

# Or manually clear
rm -rf .expo
npx expo start
```

### Issue: "Cannot find module '../config/database'"

**Status:** ✅ FIXED
**Solution:** Changed to `require('../config/db')`

## IP Address History

| Date | IP Address | Reason |
|------|------------|--------|
| Initial | 10.177.101.177 | First WiFi network |
| Oct 30 | 10.187.209.177 | WiFi change |
| Oct 30 | 172.16.35.214 | WiFi change |
| Nov 3 | **192.168.0.105** | Current (Home network) |

## No More Hardcoded IPs! 🎉

### Before (❌):
- Multiple files with different IPs
- Manual updates in 5+ places
- Easy to forget updating a file
- Hard to switch networks

### After (✅):
- Single source of truth: `.env`
- One place to update
- Automatic propagation to all services
- Easy WiFi switching

## Quick Reference Commands

```powershell
# Find IP
ipconfig

# Update .env (edit manually)
notepad .env

# Restart backend
cd backend
node server.js

# Restart frontend (in Expo terminal)
Press 'r'

# Test connection
Invoke-RestMethod http://YOUR_IP:3000/api/health
```

## Architecture

```
┌─────────┐
│  .env   │  ← Single source of truth
└────┬────┘
     │
     ▼
┌──────────────┐
│ app.config.js│  ← Reads .env, exposes to app
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│ api.config.ts   │  ← Central API configuration
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐  ┌──────────────┐
│Services │  │ All API calls│
└─────────┘  └──────────────┘
```

---

**Status:** ✅ Complete - No hardcoded IPs remain  
**Current IP:** 192.168.0.105  
**Last Updated:** November 3, 2025
