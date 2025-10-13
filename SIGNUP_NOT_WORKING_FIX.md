# Signup Not Working - FIXED ✅

## Problem
Signup was not working when testing on a real device or emulator because the app was trying to connect to `localhost`, which refers to the device itself, not your computer.

## Root Cause
- **AuthService.ts** was using `http://localhost:3000/api`
- On a device/emulator, `localhost` = the device, not your computer
- The backend server is running on your computer at IP `192.168.0.101`

## Solution Applied

### 1. Updated API URL in AuthService.ts ✅
```typescript
// OLD (doesn't work on device):
const API_BASE_URL = 'http://localhost:3000/api';

// NEW (works on device):
const API_BASE_URL = 'http://192.168.0.101:3000/api';
```

### 2. Updated Backend Server ✅
- Modified `server.js` to listen on all network interfaces (`0.0.0.0`)
- Server now displays your network IP on startup:
  ```
  📡 Local: http://localhost:3000
  📱 Network: http://192.168.0.101:3000
  💻 API: http://192.168.0.101:3000/api
  ```

## Testing Signup

### Option 1: Test from PowerShell
```powershell
$body = @{
    name='John Doe'
    age=25
    education='Graduate'
    email='john@example.com'
    mobile_no='9876543210'
    password='Test123!'
} | ConvertTo-Json

Invoke-RestMethod -Uri http://192.168.0.101:3000/api/auth/signup -Method POST -Body $body -ContentType 'application/json'
```

### Option 2: Test from React Native App
1. Make sure both servers are running:
   - **Backend**: Run `npm start` in `backend` folder (Terminal 1)
   - **Frontend**: Run `npm start` in root folder (Terminal 2)
2. Open the app on your device/emulator
3. Go to Signup screen
4. Fill in the form and submit

## Verification Steps

### Check Backend is Running
```powershell
# Should return success message
curl http://192.168.0.101:3000/api/health
```

### Check Database Connection
The backend server should show:
```
✅ Successfully connected to MySQL database
```

### Check Users Table
In phpMyAdmin:
1. Go to `habitguard` database
2. Open `users` table
3. You should see newly registered users

## Important Notes

### Your Computer's IP Address
- Current IP: **192.168.0.101**
- This IP can change if you restart your router or reconnect to WiFi
- If signup stops working, check your IP with: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### Both Servers Must Be Running
1. **Backend Server** (Port 3000):
   ```powershell
   cd backend
   npm start
   ```
   Should show: `🚀 HabitGuard Backend Server Started`

2. **React Native Metro** (Port 8081):
   ```powershell
   npm start
   ```
   Should show QR code for Expo Go

### Device and Computer Must Be on Same WiFi
- Your phone/emulator and computer must be on the same WiFi network
- If using Android Emulator, it should automatically work
- If using physical device, check WiFi connection

## Troubleshooting

### "Failed to connect to server"
1. Check your IP hasn't changed: `ipconfig`
2. Update IP in `services/AuthService.ts` if needed
3. Make sure backend server is running
4. Check both devices are on same WiFi

### "Network request failed"
1. Check if backend is accessible:
   ```powershell
   curl http://192.168.0.101:3000/api/health
   ```
2. Check Windows Firewall isn't blocking port 3000
3. Restart backend server

### Email Already Exists
If you see "Email already exists" error:
1. This means signup is working! 
2. The user is already registered
3. Try login instead or use a different email

### Database Errors
Check backend terminal for error messages:
- **ER_NO_SUCH_TABLE**: Run the database setup SQL
- **ER_ACCESS_DENIED_ERROR**: Check MySQL credentials in `config/db.config.js`
- **ECONNREFUSED**: MySQL server is not running

## Files Modified
1. ✅ `services/AuthService.ts` - Updated API_BASE_URL to use network IP
2. ✅ `backend/server.js` - Added network IP display on startup

## Success Indicators
- ✅ Backend server shows network IP on startup
- ✅ Backend shows "Successfully connected to MySQL database"
- ✅ Test signup from PowerShell works
- ✅ New users appear in phpMyAdmin users table
- ✅ App signup screen connects and creates users

## Next Steps
1. Test signup from the app
2. Test login with registered credentials
3. Verify user data is stored in database
4. Check authentication flow works (permissions → login → main app)

---

**Status**: FIXED ✅  
**Date**: October 13, 2025  
**Issue**: Signup not working on device/emulator  
**Cause**: Using localhost instead of network IP  
**Solution**: Updated API URL to use computer's network IP (192.168.0.101)
