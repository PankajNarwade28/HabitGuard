# 🔴 ERROR: Port 3000 Already in Use

## 🐛 The Error

```
Error: listen EADDRINUSE: address already in use :::3000
```

This means **port 3000 is already being used** by another process (probably a previous instance of the backend server).

---

## ✅ QUICK FIX (Choose One)

### Option 1: Kill the Process (Recommended)

**Use the kill script I created:**

```powershell
# PowerShell (Recommended)
cd backend
.\kill-port-3000.ps1
```

OR

```cmd
# Command Prompt
cd backend
kill-port-3000.bat
```

### Option 2: Manual Kill

**Find the process:**
```powershell
netstat -ano | findstr :3000
```

You'll see output like:
```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
```

The last number (12345) is the Process ID (PID).

**Kill it:**
```powershell
taskkill /F /PID 12345
```
*(Replace 12345 with your actual PID)*

### Option 3: Use a Different Port

**Edit `backend/server.js`:**

Change the port from 3000 to something else (like 3001):

```javascript
const PORT = process.env.PORT || 3001;  // Changed from 3000
```

**Don't forget to update the API URL in your app:**

Edit `services/AuthService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3001/api';  // Changed from 3000
```

---

## 🎯 Step-by-Step Fix

### 1. Stop Any Running Instances

```powershell
# Check what's using port 3000
netstat -ano | findstr :3000
```

### 2. Kill the Process

**PowerShell (Easiest):**
```powershell
cd C:\Projects\HabitGuard\backend
.\kill-port-3000.ps1
```

**Or manually:**
```powershell
# Get the PID from step 1, then:
taskkill /F /PID <PID_NUMBER>
```

### 3. Verify Port is Free

```powershell
netstat -ano | findstr :3000
```

Should return **nothing** (empty result means port is free).

### 4. Start Backend Again

```powershell
npm start
```

---

## 🔍 Why This Happens

### Common Causes:

1. **Previous server still running**
   - You started the server before
   - Terminal was closed but process didn't stop
   - Server crashed but didn't release the port

2. **Multiple terminals**
   - You have multiple terminals open
   - Each tried to start the server

3. **Another app using port 3000**
   - Create React App default port
   - Other Node.js apps
   - Some development tools

---

## 🛠️ Prevention Tips

### Tip 1: Use Nodemon Properly

When you want to stop the server:
- Press `Ctrl + C` in the terminal
- Wait for "Server stopped" message
- Don't just close the terminal

### Tip 2: Check Before Starting

Before running `npm start`:
```powershell
# Check if anything is on port 3000
netstat -ano | findstr :3000

# If empty → Port is free ✅
# If shows result → Port is in use ❌ (kill it first)
```

### Tip 3: Use Port Environment Variable

**Add to `backend/package.json`:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "kill": "powershell -File kill-port-3000.ps1"
  }
}
```

Now you can run:
```powershell
npm run kill  # Kill port 3000
npm start     # Start server
```

---

## 📊 Troubleshooting Decision Tree

```
Port 3000 in use error
    ↓
Can you find the process? (netstat -ano | findstr :3000)
    ↓
    ├─ YES → Kill it
    │         ↓
    │    Use kill script OR taskkill command
    │         ↓
    │    Start server again ✅
    │
    └─ NO → Port might be free now
             ↓
        Try starting server
             ↓
             ├─ Still fails → Change to port 3001
             │
             └─ Works → Success ✅
```

---

## 🧪 Verify Everything Works

After killing the process and restarting:

### 1. Check Server Started
```
✅ Successfully connected to MySQL database
🚀 HabitGuard Backend Server Started
📡 Server running on http://localhost:3000
```

### 2. Test Health Endpoint
```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Should return:
```
success  : True
message  : HabitGuard API is running
```

### 3. Try Signup in App
Should work now! ✅

---

## 📝 Quick Reference Commands

```powershell
# Check what's on port 3000
netstat -ano | findstr :3000

# Kill specific PID
taskkill /F /PID <PID>

# Kill all node processes (nuclear option)
taskkill /F /IM node.exe

# Use the script
.\kill-port-3000.ps1

# Check if port is free (should return nothing)
netstat -ano | findstr :3000

# Start server
npm start
```

---

## 🚨 Alternative: Change Port

If you prefer to use a different port:

### 1. Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3001;  // Or any free port
```

### 2. Edit `services/AuthService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

### 3. For emulator:
```typescript
const API_BASE_URL = 'http://10.0.2.2:3001/api';
```

### 4. For device:
```typescript
const API_BASE_URL = 'http://YOUR_IP:3001/api';
```

---

## ✅ Solution Summary

**Quickest Fix:**
```powershell
cd backend
.\kill-port-3000.ps1
npm start
```

**Manual Fix:**
```powershell
# Find PID
netstat -ano | findstr :3000

# Kill it (replace 12345 with actual PID)
taskkill /F /PID 12345

# Start server
npm start
```

**Alternative:**
- Change port to 3001 in server.js
- Update API_BASE_URL in AuthService.ts

---

## 🎯 Files Created

1. ✅ `backend/kill-port-3000.bat` - Batch script to kill process
2. ✅ `backend/kill-port-3000.ps1` - PowerShell script (better)
3. ✅ `PORT_IN_USE_FIX.md` - This guide

---

## 💡 Pro Tip

**Add to your workflow:**

Before starting development:
```powershell
cd backend
.\kill-port-3000.ps1  # Make sure port is free
npm start              # Start server
```

---

**Just run the kill script and restart! The issue will be fixed!** 🎉

```powershell
.\kill-port-3000.ps1
npm start
```
