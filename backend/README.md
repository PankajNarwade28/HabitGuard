# HabitGuard Backend API

Backend server for HabitGuard authentication system with MySQL database.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Edit `config/db.config.js` and add your MySQL credentials:
```javascript
module.exports = {
  host: 'localhost',
  user: 'YOUR_USERNAME',      // Your MySQL username
  password: 'YOUR_PASSWORD',   // Your MySQL password
  database: 'habitguard',
  port: 3306,
  // ...
};
```

### 3. Create Database
Run the SQL script in phpMyAdmin:
- Open `setup-database.sql`
- Copy the SQL commands
- Run in phpMyAdmin SQL tab

### 4. Start Server
```bash
npm start
```

Server will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user
- **Body**: `{ name, email, password, age?, education?, mobile_no? }`
- **Response**: `{ success, message, data: { userId, name, email, token } }`

#### POST `/api/auth/login`
Login user
- **Body**: `{ email, password }`
- **Response**: `{ success, message, data: { userId, name, email, token, ... } }`

#### GET `/api/auth/profile`
Get user profile (requires authentication)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ success, data: { user_info } }`

### Health Check

#### GET `/api/health`
Check if server is running
- **Response**: `{ success: true, message, timestamp }`

## 🔒 Security

- Passwords encrypted with bcrypt (10 rounds)
- JWT tokens for authentication
- Token expires in 30 days
- Parameterized SQL queries to prevent injection
- Input validation on all endpoints
- CORS enabled for React Native app

## 📁 Structure

```
backend/
├── config/
│   ├── db.config.js      # Database credentials (CONFIGURE THIS)
│   └── db.js             # Database connection
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   └── authMiddleware.js # JWT verification
├── routes/
│   └── authRoutes.js     # API routes
├── .env.example          # Environment variables template
├── package.json          # Dependencies
├── server.js             # Express server
└── setup-database.sql    # Database setup script
```

## 🛠️ Development

Run with auto-restart on file changes:
```bash
npm run dev
```

## 📦 Dependencies

- **express**: Web framework
- **mysql2**: MySQL client
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT tokens
- **cors**: Cross-origin support

## 🐛 Troubleshooting

### MySQL Connection Error
- Check if MySQL is running
- Verify credentials in `config/db.config.js`
- Ensure database exists

### Port Already in Use
- Change PORT in server.js
- Or kill process using port 3000

### CORS Error
- Ensure backend is running
- Check API_BASE_URL in mobile app
- Verify CORS is enabled in server.js

## 📝 Notes

- Change JWT_SECRET in production
- Use environment variables for sensitive data
- Keep db.config.js out of version control
- Test all endpoints before deployment
