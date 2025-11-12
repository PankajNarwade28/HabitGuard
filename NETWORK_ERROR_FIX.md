# Network Request Failed - Fixed ✅

## Problem
Quiz and profile API calls were failing with:
```
Get available quizzes error: [TypeError: Network request failed]
Error fetching profile data
```

## Root Cause
**IP Address Mismatch**
- `.env` file had: `API_URL=http://192.168.0.103:3000/api`
- Current machine IP: `192.168.0.100`
- The IP address changed, causing network requests to fail

## Investigation Steps

1. **Verified Backend Running**
   ```powershell
   netstat -an | Select-String "3000"
   # Result: TCP 0.0.0.0:3000 LISTENING ✅
   ```

2. **Tested API with Old IP (Failed)**
   ```powershell
   curl http://192.168.0.103:3000/api/quiz/available/1
   # Result: Unable to connect to the remote server ❌
   ```

3. **Tested API with Localhost (Success)**
   ```powershell
   curl http://localhost:3000/api/quiz/available/1
   # Result: 200 OK - API working ✅
   ```

4. **Checked Current IP**
   ```powershell
   ipconfig | Select-String -Pattern "IPv4"
   # Result: 192.168.0.100 (changed from .103)
   ```

5. **Tested API with New IP (Success)**
   ```powershell
   curl http://192.168.0.100:3000/api/quiz/available/1
   # Result: 200 OK ✅
   ```

## Solution Applied

### Updated `.env` file:
```env
# Before
API_URL=http://192.168.0.103:3000/api

# After
API_URL=http://192.168.0.100:3000/api
```

## Next Steps Required

### ⚠️ IMPORTANT: Restart Expo Dev Server

The Expo development server must be restarted to pick up the new `API_URL` from `.env`:

```powershell
# 1. Stop the current Expo server (Ctrl+C in the terminal)

# 2. Restart with cache clear
npx expo start --clear

# 3. Reload the app on your device/emulator
```

### How It Works

```
.env file
  ↓
app.config.js (reads API_URL from .env)
  ↓
config/api.config.ts (reads from expo-constants)
  ↓
services/QuizService.ts (uses API_CONFIG.BASE_URL)
```

When you restart Expo, it will:
1. Re-read `.env` file
2. Pass new API_URL to `app.config.js`
3. Expose it via `expo-constants`
4. All API calls will use `http://192.168.0.100:3000/api`

## Verification

After restarting Expo and reloading the app:

✅ Quiz API calls should work
✅ Profile data should load
✅ Student subjects should appear
✅ No more "Network request failed" errors

## Why IP Addresses Change

IP addresses can change due to:
- Router DHCP lease renewal
- Network reconnection
- Router reboot
- Device network settings

## Future-Proofing

To avoid this issue:

**Option 1: Static IP (Recommended for Development)**
1. Open Router settings
2. Find DHCP settings
3. Reserve IP address for your PC's MAC address
4. Set to `192.168.0.100` (or any fixed IP)

**Option 2: Check IP Before Development**
```powershell
ipconfig | Select-String -Pattern "IPv4"
```
If changed, update `.env` and restart Expo

**Option 3: Use Localhost for Emulator**
```env
# For Android Emulator
API_URL=http://10.0.2.2:3000/api

# For iOS Simulator
API_URL=http://localhost:3000/api
```

## Status
✅ **Root cause identified**: IP address changed from .103 to .100
✅ **Fix applied**: Updated `.env` with correct IP
⏳ **Pending**: Restart Expo dev server to apply changes

---

**Created**: 2025-11-07
**Issue**: Network request failed for quiz and profile APIs
**Solution**: Update API_URL in `.env` to match current machine IP
