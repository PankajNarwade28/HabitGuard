# HabitGuard - Setup Guide

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd HabitGuard
npm install
```

### 2. Configure Environment
```bash
# Get your WiFi IP address
ipconfig | Select-String -Pattern "IPv4"

# Update .env file with your IP
# Example: API_URL=http://192.168.0.102:3000/api
```

### 3. Start Servers
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Expo
npx expo start --clear
```

### 4. Run on Device
- **Android Emulator**: Press `a` in Expo terminal
- **Physical Device**: Scan QR code with Expo Go app
- **iOS Simulator**: Press `i` in Expo terminal

---

## 📦 Prerequisites

### Required Software
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`

### For Android Development
- **Android Studio** with Android SDK
- **Android Emulator** or physical device
- **USB Debugging enabled** (for physical devices)

### For iOS Development (macOS only)
- **Xcode** 14+
- **iOS Simulator**
- **CocoaPods**: `sudo gem install cocoapods`

### Database
- **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- Create database: `habitguard`

---

## 🔧 Installation

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE habitguard;

# Import schema (if schema.sql exists)
mysql -u root -p habitguard < backend/schema.sql
```

### 3. Configure Environment Variables

**Root `.env` file:**
```env
# Frontend Configuration
API_URL=http://192.168.0.102:3000/api
API_TIMEOUT=10000

# Backend Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=habitguard
DB_PORT=3306
DB_CONNECTION_LIMIT=10

# CORS
ALLOWED_ORIGINS=*
```

**Important:** Update `API_URL` with your computer's WiFi IP address.

### 4. Get Your WiFi IP

**Windows:**
```powershell
ipconfig | Select-String -Pattern "IPv4"
```

**macOS/Linux:**
```bash
ifconfig | grep "inet "
```

Use this IP in your `.env` file:
```env
API_URL=http://YOUR_IP_HERE:3000/api
```

---

## ⚙️ Configuration

### API Configuration
The app uses a centralized API configuration system:

```
.env → app.config.js → config/api.config.ts → Services
```

**No fallbacks or hardcoded URLs** - everything reads from `.env`

### Updating API URL
1. Get current IP: `ipconfig | Select-String -Pattern "IPv4"`
2. Update `.env`: `API_URL=http://NEW_IP:3000/api`
3. Restart Expo: `npx expo start --clear`

---

## 🏃 Running the App

### Development Mode

**Option 1: Manual Start**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Expo
npx expo start --clear
```

**Option 2: Using Scripts** (Windows)
```bash
# Start backend only
start-backend.bat

# Start Expo only  
npx expo start
```

### Production Build

**Android APK:**
```bash
# Development build
npx expo run:android

# Production build with EAS
eas build --platform android --profile production
```

**iOS:**
```bash
# Development build
npx expo run:ios

# Production build with EAS
eas build --platform ios --profile production
```

---

## 🔍 Troubleshooting

### Network Request Failed

**Symptoms:**
```
ERROR Get available quizzes error: [TypeError: Network request failed]
ERROR Error fetching profile data
```

**Solutions:**

1. **Check IP Address Changed:**
   ```bash
   ipconfig | Select-String -Pattern "IPv4"
   # Update .env with new IP
   ```

2. **Verify Backend Running:**
   ```bash
   netstat -an | Select-String "3000"
   # Should show: LISTENING
   ```

3. **Test API Manually:**
   ```bash
   Invoke-RestMethod -Uri "http://YOUR_IP:3000/api/health"
   # Should return: success: True
   ```

4. **Restart Expo with Clean Cache:**
   ```bash
   npx expo start --clear
   ```

### Backend Not Starting

**Check MySQL:**
```bash
# Windows
net start MySQL80

# macOS/Linux
sudo service mysql start
```

**Check Port 3000 Available:**
```bash
netstat -an | Select-String "3000"
# If in use, kill the process or change PORT in .env
```

### Student Profile Not Loading

1. **Check Console Logs** - Look for API URL being used
2. **Verify Backend APIs:**
   ```bash
   # Test profile endpoint
   Invoke-RestMethod -Uri "http://YOUR_IP:3000/api/student/profile/1"
   
   # Test courses endpoint
   Invoke-RestMethod -Uri "http://YOUR_IP:3000/api/student/courses"
   ```

3. **Check Database Connection** - Verify MySQL credentials in `.env`

### Android Emulator Connection Issues

**Use Special IP for Emulator:**
```env
# For Android Emulator
API_URL=http://10.0.2.2:3000/api
```

**For Physical Device:**
```env
# Use your PC's WiFi IP
API_URL=http://192.168.0.102:3000/api
```

---

## 📁 Project Structure

```
HabitGuard/
├── app/                          # Application screens (Expo Router)
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx             # Dashboard/Home screen
│   │   ├── analytics.tsx         # Analytics screen
│   │   ├── progress.tsx          # Progress tracking
│   │   ├── sleep.tsx             # Sleep schedule
│   │   └── settings.tsx          # Settings
│   ├── student/                  # Student section
│   │   ├── profile.tsx           # Student profile
│   │   ├── courses.tsx           # Course selection
│   │   ├── quiz-list.tsx         # Quiz listing
│   │   └── quiz-screen.tsx       # Quiz taking
│   ├── auth/                     # Authentication
│   │   ├── login.tsx             # Login screen
│   │   └── signup.tsx            # Signup screen
│   └── _layout.tsx               # Root layout
│
├── backend/                      # Node.js/Express backend
│   ├── controllers/              # Request handlers
│   ├── routes/                   # API routes
│   ├── db.js                     # Database connection
│   └── server.js                 # Express server
│
├── components/                   # Reusable UI components
│   ├── ThemedText.tsx            # Themed text component
│   ├── ThemedView.tsx            # Themed view component
│   └── ...
│
├── services/                     # API services
│   ├── AuthService.ts            # Authentication API
│   ├── StudentService.ts         # Student API
│   ├── QuizService.ts            # Quiz API
│   ├── UsageStatsService.ts      # Usage tracking
│   └── NotificationService.ts    # Notifications
│
├── config/                       # Configuration
│   └── api.config.ts             # API configuration
│
├── constants/                    # Constants
│   └── Colors.ts                 # Color scheme
│
├── hooks/                        # Custom React hooks
│   ├── useScreenTimeData.ts      # Screen time data
│   ├── useColorScheme.ts         # Theme detection
│   └── ...
│
├── .env                          # Environment variables
├── app.config.js                 # Expo configuration
├── package.json                  # Dependencies
└── README.md                     # Main readme
```

---

## 🔑 Key Features

### Dashboard
- Real-time screen time tracking
- Daily and weekly usage statistics
- Quick access to all features
- Smart usage alerts

### Analytics
- Detailed usage breakdown by app
- Category-wise analysis
- Weekly and monthly trends
- Peak usage detection

### Progress Tracking
- Daily goals and achievements
- Streak tracking
- Weekly insights
- Progress visualization

### Student Section
- Course management
- Interactive quizzes
- Study recommendations
- Progress tracking

### Sleep Schedule
- AI-powered bedtime suggestions
- Sleep quality tracking
- Wind-down mode
- Sleep debt calculation

---

## 🛠️ Development

### Adding New Features

1. **Create Screen:** Add file in `app/` directory
2. **Add Navigation:** Update `app/_layout.tsx`
3. **Create Service:** Add API service in `services/`
4. **Add Types:** Define TypeScript interfaces

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- ESLint for code quality

### Testing
```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `API_URL` | Backend API endpoint | `http://192.168.0.102:3000/api` |
| `API_TIMEOUT` | API request timeout (ms) | `10000` |
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your-password` |
| `DB_NAME` | Database name | `habitguard` |
| `DB_PORT` | MySQL port | `3306` |

---

## 🐛 Common Issues

### "API_URL not configured"
- Ensure `.env` file exists in root directory
- Verify `API_URL` is set correctly
- Restart Expo: `npx expo start --clear`

### "Cannot connect to backend"
- Check backend is running on correct port
- Verify IP address hasn't changed
- Test API manually with curl/Invoke-RestMethod
- Check firewall isn't blocking port 3000

### "Database connection failed"
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure `habitguard` database exists
- Test connection: `mysql -u root -p habitguard`

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router Guide](https://expo.github.io/router/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For issues or questions:
- Open an issue on GitHub
- Check troubleshooting section above
- Review project documentation

---

**Last Updated:** November 12, 2025

**Version:** 1.0.0
