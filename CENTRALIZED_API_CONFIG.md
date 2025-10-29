# ✅ Centralized API Configuration - Complete

## What Was Done

Created a centralized configuration system so you only need to change the server IP address in **ONE place**.

## Files Created/Modified

### 1. `.env` (Root directory) - **EDIT THIS FILE TO CHANGE IP**
```env
API_URL=http://10.187.209.177:3000/api
API_TIMEOUT=10000
```

### 2. `app.config.js` (Created)
- Reads from `.env` file
- Exposes API URL to the app through expo-constants
- Shows API URL in console when app starts

### 3. `config/api.config.ts` (Created)
- Central configuration file
- All services import from here
- Provides helper functions

### 4. `services/AuthService.ts` (Updated)
- Now imports from `config/api.config.ts`
- Logs API configuration on startup

### 5. `services/WeeklyReportService.ts` (Updated)
- Now imports from `config/api.config.ts`
- Uses centralized configuration

### 6. `HOW_TO_CHANGE_IP.md` (Created)
- Complete guide on changing IP address
- Troubleshooting steps
- Network scenarios

## How to Use

### When Your IP Changes:

1. **Option A: Update .env file (Easiest)**
   ```bash
   # Open .env file and change:
   API_URL=http://YOUR_NEW_IP:3000/api
   ```

2. **Option B: Update app.config.js**
   ```javascript
   const API_URL = process.env.API_URL || 'http://YOUR_NEW_IP:3000/api';
   ```

3. **Restart the app** (press `r` in Expo terminal)

That's it! All services automatically updated.

## Current Configuration

**Backend Server Running:**
- 🌐 Network: `http://10.187.209.177:3000`
- 💻 API: `http://10.187.209.177:3000/api`
- ✅ Database Connected: `habitguard`

**App Configuration:**
- 📱 API URL: `http://10.187.209.177:3000/api`
- ⏱️ Timeout: 10 seconds

## Benefits

✅ **Single Source of Truth** - Change IP in one place  
✅ **All Services Updated** - AuthService & WeeklyReportService automatically use new IP  
✅ **Easy Network Switching** - Switch between WiFi networks effortlessly  
✅ **Development Friendly** - Different IPs for emulator, physical device, etc.  
✅ **Error Reduction** - No need to search through multiple files  

## Testing

1. **Backend is running:**
   ```
   ✅ Server: http://10.187.209.177:3000
   ✅ API: http://10.187.209.177:3000/api
   ✅ Database: habitguard
   ```

2. **Start your app:**
   ```bash
   npx expo start
   ```

3. **Check console for:**
   ```
   📡 API URL configured as: http://10.187.209.177:3000/api
   ```

4. **Try logging in** - The error should be fixed!

## Quick Reference

| File | Purpose | Edit? |
|------|---------|-------|
| `.env` | Store IP address | ✅ YES - Edit this! |
| `app.config.js` | Read .env & expose to app | ⚠️ Only if .env doesn't work |
| `config/api.config.ts` | Central config | ❌ No - auto-updates |
| `services/AuthService.ts` | Auth API calls | ❌ No - imports from config |
| `services/WeeklyReportService.ts` | Report API calls | ❌ No - imports from config |

## Demo Account

If database is not configured, use:
- 📧 Email: `demo@habitguard.com`
- 🔑 Password: `demo123`

## Next Steps

1. ✅ Backend server is running on `10.187.209.177:3000`
2. ✅ App configured to use `10.187.209.177:3000/api`
3. 🔄 Restart your Expo app
4. 📱 Try logging in!

## Troubleshooting

If still getting "server not responding":

1. **Check backend is running:**
   ```bash
   cd backend
   npm start
   ```

2. **Verify IP in console:**
   Should see: `📡 API URL configured as: http://10.187.209.177:3000/api`

3. **Restart Expo:**
   Press `r` in terminal or `Ctrl+C` then `npx expo start`

4. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

## Future IP Changes

When your WiFi network changes and you get a new IP:

1. Run `ipconfig` (Windows) or `ifconfig` (Mac) to find new IP
2. Update `.env` file with new IP
3. Restart Expo
4. Done! ✅

---

**Note:** Your IP changed from `10.177.101.177` to `10.187.209.177` - this is why centralized config is helpful!
