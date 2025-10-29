# 🎓 Demo Account Information

## Quick Access

If your database is not configured or connection fails, you can use the demo account:

```
📧 Email: demo@habitguard.com
🔑 Password: demo123
```

## How It Works

The backend now includes a **fallback demo account** that works even when:
- MySQL/XAMPP is not running
- Database is not created
- Database connection fails
- No users exist in database

## Features

✅ **Full Authentication** - Login works with JWT tokens  
✅ **No Database Required** - Works offline from database  
✅ **Testing Ready** - Perfect for app development and testing  
✅ **Same Experience** - All app features work normally  

## API Endpoints

### Get Demo Info
```bash
GET http://192.168.0.101:3000/api/demo
```

**Response:**
```json
{
  "success": true,
  "demoAccount": {
    "email": "demo@habitguard.com",
    "password": "demo123",
    "name": "Demo User",
    "note": "Use these credentials if database is not configured"
  }
}
```

### Login with Demo
```bash
POST http://192.168.0.101:3000/api/auth/login
Content-Type: application/json

{
  "email": "demo@habitguard.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful (Demo Account)",
  "data": {
    "userId": 999,
    "name": "Demo User",
    "email": "demo@habitguard.com",
    "age": 25,
    "education": "Computer Science",
    "mobile_no": "9999999999",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isDemo": true
  }
}
```

## Database Error Handling

When database is unavailable:

### Signup Error Response
```json
{
  "success": false,
  "message": "Database connection failed. Please check your database setup.",
  "demoAccount": {
    "available": true,
    "email": "demo@habitguard.com",
    "password": "demo123",
    "note": "Use demo account to test the app while database is being configured"
  },
  "error": "Database unavailable"
}
```

### Login Error Response
```json
{
  "success": false,
  "message": "Database connection failed",
  "demoAccount": {
    "available": true,
    "email": "demo@habitguard.com",
    "password": "demo123",
    "note": "Use this demo account to test the app"
  },
  "error": "Database unavailable"
}
```

## Usage in App

### In React Native
```typescript
// If signup fails, show demo account option
try {
  await authService.signup(userData);
} catch (error) {
  if (error.demoAccount) {
    Alert.alert(
      'Database Unavailable',
      `Use demo account:\nEmail: ${error.demoAccount.email}\nPassword: ${error.demoAccount.password}`,
      [
        {
          text: 'Try Demo Login',
          onPress: () => {
            // Auto-fill demo credentials
            setEmail(error.demoAccount.email);
            setPassword(error.demoAccount.password);
          }
        }
      ]
    );
  }
}
```

## Starting the Server

```bash
cd backend
npm start
# or
nodemon server.js
```

The server will show:
```
🚀 HabitGuard Backend Server Started
📡 Local: http://localhost:3000
🌐 Network: http://192.168.0.101:3000
💻 API: http://192.168.0.101:3000/api

📋 Available routes:
  POST /api/auth/signup - Register new user
  POST /api/auth/login - User login
  GET  /api/auth/profile - Get user profile (requires auth)
  GET  /api/health - Health check
  GET  /api/demo - Demo account info

💡 Use http://192.168.0.101:3000/api in your React Native app

🎓 Demo Account (use if database not configured):
   📧 Email: demo@habitguard.com
   🔑 Password: demo123
```

## Database Setup (Optional)

If you want to use real database instead of demo:

### 1. Start XAMPP/MySQL
- Open XAMPP Control Panel
- Start Apache and MySQL

### 2. Create Database
```sql
-- Open phpMyAdmin (http://localhost/phpmyadmin)
-- Run this SQL:

CREATE DATABASE habitguard;

USE habitguard;

CREATE TABLE users (
  u_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT,
  education VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile_no VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Update Config
Edit `backend/config/db.config.js`:
```javascript
module.exports = {
  host: 'localhost',
  user: 'root',        // Your MySQL username
  password: '',        // Your MySQL password (empty for default)
  database: 'habitguard',
  port: 3306
};
```

### 4. Restart Server
```bash
cd backend
nodemon server.js
```

## Testing

### Test Health Check
```bash
curl http://192.168.0.101:3000/api/health
```

### Test Demo Account
```bash
curl http://192.168.0.101:3000/api/demo
```

### Test Login
```bash
curl -X POST http://192.168.0.101:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@habitguard.com","password":"demo123"}'
```

## Benefits

✅ **Zero Setup** - Works immediately without database  
✅ **Development Ready** - Test all features instantly  
✅ **Error Resilient** - Graceful fallback when DB fails  
✅ **User Friendly** - Clear error messages with solutions  
✅ **Production Safe** - Real accounts still work normally  

## Notes

- Demo account has userId: 999
- JWT token includes `isDemo: true` flag
- Data for demo user is in-memory (not persisted)
- Real database accounts are preferred for production
- Demo account can't be modified or deleted

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process_id> /F

# Try different port
# In server.js, change: const PORT = 3001;
```

### Can't Connect from Phone
- Make sure phone and computer are on same WiFi
- Check firewall isn't blocking port 3000
- Use correct IP address (shown when server starts)
- Try: http://192.168.0.101:3000/api/health

### Database Connection Failed
- That's OK! Use demo account: demo@habitguard.com / demo123
- Or follow "Database Setup" section above

---

**🎉 Now you can test the app even without database setup!**
