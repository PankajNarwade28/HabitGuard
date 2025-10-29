# 🔧 How to Change the Server IP Address

This guide explains how to update the backend server IP address when your network changes.

## Quick Method (Recommended)

### Option 1: Update .env file (Easiest)
1. Open the `.env` file in the root directory
2. Change the `API_URL` to your new IP address:
   ```
   API_URL=http://YOUR_NEW_IP:3000/api
   ```
3. Restart your Expo app (press `r` in the terminal)

**Example:**
```env
API_URL=http://192.168.1.100:3000/api
```

### Option 2: Update app.config.js directly
1. Open `app.config.js`
2. Change the fallback IP address on line 11:
   ```javascript
   const API_URL = process.env.API_URL || 'http://YOUR_NEW_IP:3000/api';
   ```
3. Restart your Expo app

## Configuration Files

All API configuration is now centralized in these files:

### 1. `.env` (Root directory)
```env
API_URL=http://10.177.101.177:3000/api
API_TIMEOUT=10000
```

### 2. `app.config.js`
Reads from `.env` and exposes the API URL to the app through `expo-constants`.

### 3. `config/api.config.ts`
Central configuration file that all services import from. **Don't edit this file directly** - it automatically reads from `app.config.js`.

## How It Works

```
.env file
   ↓
app.config.js (reads .env)
   ↓
expo-constants (exposes to app)
   ↓
config/api.config.ts (imports from constants)
   ↓
AuthService.ts & WeeklyReportService.ts (use API_CONFIG)
```

## Finding Your IP Address

### Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

### Mac/Linux:
```bash
ifconfig | grep "inet "
```

### Requirements:
- Backend server must be running on port 3000
- Both your computer and phone must be on the same WiFi network
- Windows Firewall must allow port 3000

## Different Network Scenarios

### Localhost (Testing on same computer)
```env
API_URL=http://localhost:3000/api
```

### Android Emulator
```env
API_URL=http://10.0.2.2:3000/api
```

### Physical Device on WiFi
```env
API_URL=http://192.168.1.X:3000/api
```
(Replace X with your computer's local IP)

### Different Port
If your backend runs on a different port (e.g., 3001):
```env
API_URL=http://YOUR_IP:3001/api
```

## Troubleshooting

### Error: "Server not responding"

1. **Check backend server is running:**
   ```bash
   cd backend
   npm start
   ```

2. **Verify IP address:**
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

3. **Test connection:**
   Open browser and go to: `http://YOUR_IP:3000`
   You should see: "HabitGuard Backend API is running"

4. **Check firewall:**
   ```bash
   # Windows: Allow port 3000
   netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
   ```

5. **Verify both devices on same WiFi:**
   - Computer and phone must be on the same network
   - Some public WiFi networks block device-to-device communication

## After Changing IP

1. Update `.env` file
2. Restart Expo: Press `r` in terminal or run `npx expo start`
3. The app will automatically use the new IP
4. Check console for: `📡 API URL configured as: http://NEW_IP:3000/api`

## Benefits of Centralized Configuration

✅ Change IP in **one place** (`.env` file)  
✅ All services automatically updated  
✅ No need to search through multiple files  
✅ Easy to switch between networks  
✅ Works with different environments (dev/prod)  

## Notes

- The `.env` file is already in `.gitignore` to keep your local settings private
- If `.env` is missing, the app falls back to `10.177.101.177:3000/api`
- Changes take effect after restarting the Expo server
