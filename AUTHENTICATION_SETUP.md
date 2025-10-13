# Authentication Setup Guide

This guide will help you set up the authentication system with MySQL database for HabitGuard app.

## 📋 Prerequisites

- **phpMyAdmin** (for MySQL database management)
- **Node.js** installed on your system
- **MySQL** server running

---

## 🗄️ Database Setup

### Step 1: Create Database in phpMyAdmin

1. Open phpMyAdmin in your browser (usually `http://localhost/phpmyadmin`)
2. Click on **"New"** in the left sidebar
3. Create a new database named: `habitguard`
4. Select collation: `utf8mb4_general_ci`
5. Click **"Create"**

### Step 2: Create Users Table

1. Select the `habitguard` database
2. Click on **"SQL"** tab
3. Copy and paste this SQL query:

```sql
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

4. Click **"Go"** to execute
5. You should see: "1 table has been created"

### Step 3: Verify Table Structure

In phpMyAdmin, click on the `users` table to see its structure. It should have these columns:
- `u_id` - INT (Primary Key, Auto Increment)
- `name` - VARCHAR(100)
- `age` - INT
- `education` - VARCHAR(100)
- `email` - VARCHAR(255) (Unique)
- `mobile_no` - VARCHAR(20)
- `password` - VARCHAR(255) (Will store encrypted passwords)
- `created_at` - TIMESTAMP

---

## 🔧 Backend Configuration

### Step 1: Add MySQL Credentials

1. Open file: `backend/config/db.config.js`
2. Replace the placeholder values with your MySQL credentials:

```javascript
module.exports = {
  host: 'localhost',              // Usually localhost
  user: 'root',                   // Your MySQL username
  password: 'your_password',      // Your MySQL password
  database: 'habitguard',         // Database name (keep as is)
  port: 3306,                     // Default MySQL port
  
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
};
```

**Example:**
```javascript
module.exports = {
  host: 'localhost',
  user: 'root',
  password: 'mypassword123',
  database: 'habitguard',
  port: 3306,
  
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
};
```

### Step 2: Install Backend Dependencies

Open PowerShell/Command Prompt and navigate to the backend folder:

```powershell
cd backend
npm install
```

This will install:
- `express` - Web server framework
- `mysql2` - MySQL database driver
- `bcrypt` - Password encryption
- `jsonwebtoken` - JWT token generation
- `cors` - Cross-origin resource sharing

### Step 3: Start Backend Server

```powershell
npm start
```

You should see:
```
🚀 HabitGuard Backend Server Started
📡 Server running on http://localhost:3000
💻 API endpoints available at http://localhost:3000/api
```

**For development with auto-restart:**
```powershell
npm run dev
```

---

## 📱 Mobile App Configuration

### Step 1: Update API URL (For Physical Device Testing)

If testing on a physical device, you need to update the API URL:

1. Open: `services/AuthService.ts`
2. Find this line (around line 6):
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```
3. Replace with your computer's local IP:
```typescript
const API_BASE_URL = 'http://192.168.1.X:3000/api'; // Replace X with your IP
```

**To find your IP:**
- Windows: Run `ipconfig` in PowerShell
- Look for "IPv4 Address" under your active network adapter

### Step 2: Run the App

```powershell
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for Web

---

## 🧪 Testing the Authentication

### Test Signup

1. Open the app
2. You'll see the **Login** screen
3. Click **"Sign Up"**
4. Fill in the form:
   - Name: John Doe
   - Age: 25
   - Education: Bachelor's
   - Email: john@example.com
   - Mobile: 1234567890
   - Password: test123
   - Confirm Password: test123
5. Click **"Sign Up"**

### Verify in Database

1. Open phpMyAdmin
2. Select `habitguard` database
3. Click on `users` table
4. Click **"Browse"**
5. You should see the new user with encrypted password

### Test Login

1. Click **"Login"** on the signup screen
2. Enter credentials:
   - Email: john@example.com
   - Password: test123
3. Click **"Login"**
4. You should be redirected to the main app

---

## 🔒 Security Features

### Password Encryption
- Passwords are hashed using **bcrypt** with 10 salt rounds
- Original passwords are never stored in the database
- Each password gets a unique salt for extra security

### JWT Authentication
- After login, a JWT token is generated
- Token expires in 30 days
- Token is stored securely using AsyncStorage
- All API requests include the token for authentication

### Input Validation
- Email format validation
- Password strength requirements (min 6 characters)
- Duplicate email prevention
- SQL injection prevention through parameterized queries

---

## 📡 API Endpoints

### Public Endpoints

#### POST `/api/auth/signup`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 25,
  "education": "Bachelor's",
  "email": "john@example.com",
  "mobile_no": "1234567890",
  "password": "test123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST `/api/auth/login`
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "test123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "education": "Bachelor's",
    "mobile_no": "1234567890",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Protected Endpoints

#### GET `/api/auth/profile`
Get user profile (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "u_id": 1,
    "name": "John Doe",
    "age": 25,
    "education": "Bachelor's",
    "email": "john@example.com",
    "mobile_no": "1234567890",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## 🐛 Troubleshooting

### Problem: "Error connecting to MySQL database"

**Solution:**
1. Verify MySQL is running
2. Check credentials in `backend/config/db.config.js`
3. Ensure database `habitguard` exists in phpMyAdmin
4. Check MySQL port (default: 3306)

### Problem: "Failed to connect to server"

**Solution:**
1. Ensure backend server is running (`npm start` in backend folder)
2. Check if port 3000 is available
3. Update API_BASE_URL in `AuthService.ts` if testing on device

### Problem: "User with this email already exists"

**Solution:**
- This email is already registered
- Try a different email or login with existing account
- Or delete the user from phpMyAdmin to start fresh

### Problem: "Invalid email or password"

**Solution:**
1. Check email spelling
2. Passwords are case-sensitive
3. Ensure you're using the correct password

---

## 📁 Project Structure

```
HabitGuard/
├── app/
│   ├── login.tsx           # Login screen
│   ├── signup.tsx          # Signup screen
│   └── _layout.tsx         # App layout with auth check
├── services/
│   └── AuthService.ts      # Authentication service
└── backend/
    ├── config/
    │   ├── db.config.js    # Database credentials (ADD YOUR CREDENTIALS HERE)
    │   └── db.js           # Database connection
    ├── controllers/
    │   └── authController.js  # Auth logic
    ├── middleware/
    │   └── authMiddleware.js  # JWT verification
    ├── routes/
    │   └── authRoutes.js   # API routes
    ├── package.json        # Backend dependencies
    └── server.js           # Express server
```

---

## ✅ Quick Start Checklist

- [ ] MySQL is running
- [ ] Created `habitguard` database in phpMyAdmin
- [ ] Created `users` table with correct structure
- [ ] Added MySQL credentials in `backend/config/db.config.js`
- [ ] Installed backend dependencies (`npm install` in backend folder)
- [ ] Started backend server (`npm start` in backend folder)
- [ ] Updated API_BASE_URL if testing on physical device
- [ ] Tested signup with a new user
- [ ] Verified user in phpMyAdmin database
- [ ] Tested login with created user

---

## 🎉 Success!

If everything is set up correctly:
1. Backend server runs on port 3000
2. Users can sign up and login
3. Passwords are encrypted in database
4. JWT tokens are generated for authentication
5. App redirects to main screen after successful login

Need help? Check the troubleshooting section above!
