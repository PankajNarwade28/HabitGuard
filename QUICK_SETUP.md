# 🚀 Quick Setup Reference

## Step 1: Database Setup (2 minutes)
1. Open phpMyAdmin → `http://localhost/phpmyadmin`
2. Click "SQL" tab
3. Copy & paste from `backend/setup-database.sql`
4. Click "Go"
5. ✅ Database created!

## Step 2: Add Credentials (1 minute)
Edit `backend/config/db.config.js`:
```javascript
user: 'root',              // Your MySQL username
password: 'your_password',  // Your MySQL password
```

## Step 3: Start Backend (1 minute)
### Option A: Double-click
- `start-backend.bat` (Command Prompt)
- OR `start-backend.ps1` (PowerShell)

### Option B: Manual
```powershell
cd backend
npm install
npm start
```

## Step 4: Run App
```powershell
npm start
```
Then press `a` for Android or `i` for iOS

---

## 🧪 Test Signup
1. Open app → See Login screen
2. Click "Sign Up"
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
4. Click "Sign Up"
5. ✅ Account created!

## 🔍 Verify in Database
phpMyAdmin → habitguard → users → Browse
→ See encrypted password ✅

---

## 📡 API Endpoints Quick Test

### Test in Browser
```
http://localhost:3000/api/health
```

### Test with PowerShell
```powershell
# Signup
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $body -ContentType "application/json"

# Login
$body = @{
    email = "john@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

---

## 🔧 For Physical Device Testing

1. Find your PC's IP:
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.5)

2. Edit `services/AuthService.ts`:
```typescript
const API_BASE_URL = 'http://192.168.1.5:3000/api';
```

3. Restart app

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| MySQL connection error | Check credentials in `db.config.js` |
| Backend won't start | Run `npm install` in backend folder |
| Can't connect from phone | Update IP in `AuthService.ts` |
| Port 3000 in use | Change PORT in `server.js` |

---

## 📋 Files You Need to Configure

| File | What to Add |
|------|------------|
| `backend/config/db.config.js` | MySQL username & password |
| `services/AuthService.ts` | Your PC IP (for device testing) |

**Everything else is ready to use! 🎉**

---

## 🎯 What You Get

✅ Secure user registration
✅ Login with encrypted passwords
✅ JWT token authentication  
✅ MySQL database integration
✅ Form validation
✅ Beautiful UI with gradient backgrounds
✅ Automatic auth state management
✅ Protected routes

---

## 📁 Quick File Reference

```
📦 Important Files
├── 📄 AUTHENTICATION_SETUP.md (Detailed guide)
├── 📄 QUICK_SETUP.md (This file)
├── 🔧 start-backend.bat (Start server)
├── 📱 app/
│   ├── login.tsx (Login screen)
│   └── signup.tsx (Signup screen)
└── 🖥️ backend/
    ├── config/
    │   └── db.config.js ⚠️ ADD CREDENTIALS HERE
    ├── setup-database.sql (Run in phpMyAdmin)
    └── server.js (Backend server)
```

---

## 💡 Pro Tips

1. **Keep backend running** while testing the app
2. **Check console** for connection errors
3. **Use phpMyAdmin** to verify users are being created
4. **Passwords are hashed** - you won't see plain text in DB
5. **Tokens expire in 30 days** - users stay logged in

---

## 🎉 Ready to Go!

1. ✅ Database setup
2. ✅ Credentials added
3. ✅ Backend running
4. ✅ App running
5. ✅ Test signup/login

**You're all set! Start building! 🚀**
