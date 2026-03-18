# 🌿 HabitGuard – Digital Wellbeing AppHere’s an improved, **professional and polished README.md** for your GitHub project — rewritten with better structure, formatting, clarity, and presentation (while keeping your full details intact 👇):

*A modern React Native app to help you monitor screen time, improve sleep, and achieve digital balance.*---



[![React Native](https://img.shields.io/badge/React%20Native-0.76-blue.svg)](https://reactnative.dev/)# 🌿 HabitGuard – Digital Wellbeing App 📱⏰

[![Expo](https://img.shields.io/badge/Expo-54.0-black.svg)](https://expo.dev/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)*A modern React Native app to help you monitor screen time, improve sleep, and achieve digital balance.*

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

---

## 🧭 Overview

## 📋 Quick Links

**HabitGuard** is a comprehensive **Digital Wellbeing App** built with **React Native (Expo)**.

- **[Setup Guide](SETUP.md)** - Complete installation and configurationIt empowers users to track their screen time, understand usage patterns, and improve their sleep through **AI-driven recommendations** and **smart notifications** — all while maintaining privacy and control.

- **[Troubleshooting](SETUP.md#troubleshooting)** - Common issues and solutions

- **[Project Structure](SETUP.md#project-structure)** - Code organization---



---## ✨ Key Features



## 🧭 Overview### 📊 **Dashboard**



**HabitGuard** is a comprehensive **Digital Wellbeing App** built with **React Native (Expo)** that helps users:* Real-time screen time tracking (daily & weekly)

- 📊 Track screen time and app usage* Smart usage alerts before reaching limits

- 🌙 Optimize sleep schedules with AI recommendations* Quick access to sleep & analytics tools

- 📈 Visualize usage patterns and trends* Categorized usage insights

- 🎯 Set and achieve digital wellness goals

- 📚 Access educational quizzes and study tools### 📈 **Analytics**



---* Weekly and monthly usage trends

* App category analysis (e.g., social, productivity, entertainment)

## ✨ Key Features* Peak usage detection

* Track progress and digital wellness improvements

### 📊 Dashboard

- Real-time screen time tracking (daily & weekly)### 🌙 **Sleep Schedule**

- Smart usage alerts before reaching limits

- Quick access to analytics and sleep tools* AI-powered bedtime suggestions

- Categorized usage insights* “Wind Down” mode that mutes distractions before bed

* Sleep quality & pattern tracking

### 📈 Analytics* Sleep debt calculator

- Weekly and monthly usage trends

- App category analysis### ⚙️ **Settings & Controls**

- Peak usage detection

- Progress tracking* Set daily and app-specific screen time limits

* Manage notifications and reminders

### 🌙 Sleep Schedule* Full privacy and data control

- AI-powered bedtime suggestions* Take healthy breaks with custom reminders

- "Wind Down" mode

- Sleep quality tracking---

- Sleep debt calculator

## 🧩 Technology Stack

### 📚 Student Section

- Course management| Category                   | Tools                                   |

- Interactive quizzes (20+ subjects)| -------------------------- | --------------------------------------- |

- Study recommendations| **Framework**              | React Native + Expo                     |

- Progress tracking and streaks| **Navigation**             | Expo Router (file-based)                |

| **UI Components**          | Custom components with Light/Dark theme |

### ⚙️ Settings| **Charts & Visualization** | Victory Native                          |

- Daily and app-specific screen time limits| **Icons**                  | SF Symbols                              |

- Notification management| **Notifications**          | Expo Notifications                      |

- Privacy controls| **State Management**       | React Hooks + Custom Hooks              |

- Break reminders

---

---

## ⚡ Installation

## 🚀 Quick Start

```bash

```bash# 1️⃣ Clone the repository

# 1. Clone repositorygit clone <repository-url>

git clone <repository-url>cd HabitGuard

cd HabitGuard

# 2️⃣ Install dependencies

# 2. Install dependenciesnpm install

npm install

# 3️⃣ Start the development server

# 3. Configure environmentnpx expo start

# Get your WiFi IP: ipconfig | Select-String -Pattern "IPv4"```

# Update .env: API_URL=http://YOUR_IP:3000/api

### ▶️ Run the app

# 4. Start backend

cd backend* 📱 Scan the QR code via **Expo Go App** (Android/iOS)

npm start* 🖥 Press `i` → Run on iOS simulator

* 🤖 Press `a` → Run on Android emulator

# 5. Start Expo (in new terminal)* 🌐 Press `w` → Open in web browser

npx expo start --clear

---

# 6. Run on device

# Press 'a' for Android emulator## 📂 Project Structure

# Or scan QR code with Expo Go app

``````

HabitGuard/

**For detailed setup instructions, see [SETUP.md](SETUP.md)**├── app/                    # Main application screens

│   ├── (tabs)/             # Tab-based navigation

---│   │   ├── index.tsx       # Dashboard screen

│   │   ├── analytics.tsx   # Analytics screen

## 🧩 Technology Stack│   │   ├── sleep.tsx       # Sleep schedule screen

│   │   └── settings.tsx    # Settings screen

| Category | Tools |│   └── _layout.tsx         # Root layout file

|----------|-------|├── components/             # Reusable UI components

| **Framework** | React Native + Expo |├── hooks/                  # Custom React hooks

| **Language** | TypeScript |│   └── use-screen-time.ts  # Screen time data management

| **Navigation** | Expo Router |├── services/               # Background and utility services

| **Backend** | Node.js + Express |│   └── NotificationService.ts

| **Database** | MySQL |├── constants/              # App constants, colors, and themes

| **Styling** | NativeWind (Tailwind CSS) |└── assets/                 # Images and static assets

| **Charts** | Victory Native |```

| **Icons** | Ionicons, SF Symbols |

---

---

## 🔍 Core Implementations

## 📂 Project Structure

### 🕒 **Screen Time Tracking**

```

HabitGuard/* Managed via `useScreenTimeData` hook

├── app/                    # Application screens (Expo Router)* Real-time usage tracking with mock API (ready for real integration)

│   ├── (tabs)/             # Main tab navigation* Insights & weekly summaries

│   ├── student/            # Student section (quizzes, courses)

│   └── auth/               # Authentication screens### 🔔 **Smart Notifications**

├── backend/                # Node.js/Express API

│   ├── controllers/        # Request handlers* AI-based contextual alerts

│   ├── routes/             # API routes* Overuse & bedtime reminders

│   └── db.js               # Database connection* Weekly wellness summaries

├── components/             # Reusable UI components* Local-only notification scheduling

├── services/               # API services

│   ├── AuthService.ts### 💤 **Sleep Optimization**

│   ├── StudentService.ts

│   ├── QuizService.ts* Smart bedtime suggestions

│   └── UsageStatsService.ts* Sleep quality scoring

├── config/                 # Configuration* Adjustable sleep schedules

│   └── api.config.ts       # API configuration* Visual sleep analysis

├── hooks/                  # Custom React hooks

├── constants/              # App constants### 📊 **Analytics Dashboard**

├── .env                    # Environment variables

└── SETUP.md                # Setup instructions* Interactive charts (daily/weekly/monthly)

```* Category-wise usage visualization

* Peak and night-time pattern recognition

---* Comparison with previous performance



## 🔧 Configuration---



The app uses a centralized configuration system:## 🧠 Data Management



```| Hook / Service        | Purpose                                    |

.env → app.config.js → config/api.config.ts → Services| --------------------- | ------------------------------------------ |

```| `useScreenTimeData`   | Manages overall screen time metrics        |

| `useAppUsageData`     | Handles per-app usage details              |

**Key Environment Variables:**| `useSleepData`        | Stores sleep information & recommendations |

```env| `NotificationService` | Schedules and manages notifications        |

API_URL=http://192.168.0.102:3000/api  # Your WiFi IP

PORT=3000---

DB_HOST=localhost

DB_USER=root## 🎨 Customization

DB_NAME=habitguard

```### 🖌 Themes



**No hardcoded URLs or fallbacks** - everything reads from `.env`* Automatic Light/Dark mode detection

* Adaptive color schemes

---* Consistent cross-screen styling



## 📱 Features in Detail### 🔕 Notifications



### Screen Time Tracking* Daily screen time alerts

- Android UsageStats API integration* App-specific overuse warnings

- Real-time usage monitoring* Bedtime & break reminders

- Daily and weekly statistics* Weekly progress summaries

- App categorization

---

### Analytics Dashboard

- Interactive charts (daily/weekly/monthly)## 🚀 Future Enhancements

- Category-wise breakdown

- Peak usage patterns* 🔗 **Device API Integration** – Connect to real OS-level usage data

- Progress visualization* 🧠 **Machine Learning** – Predict usage and suggest improvements

* 👨‍👩‍👧‍👦 **Family Sharing** – Parental control & multi-user profiles

### Sleep Optimization* 💪 **Health Integration** – Sync with health/wellness apps

- Smart bedtime calculation* 🚫 **Focus Modes** – Auto-block distracting apps

- Sleep quality scoring* 💬 **Social Features** – Share and compare progress

- Wind-down mode

- Sleep pattern analysis---



### Student Tools## 🧑‍💻 Development

- 20+ subject quizzes

- Course recommendations### 🪄 Adding New Features

- Study session timer

- Progress tracking with streaks1. Add new screen inside `app/(tabs)/`

2. Update navigation in `_layout.tsx`

### Notifications3. Create hooks in `hooks/`

- Smart usage alerts4. Add notification logic in `services/NotificationService.ts`

- Bedtime reminders

- Daily goal tracking### 🧪 Testing

- Weekly summaries

```bash

---# Lint code

npm run lint

## 🛠️ Development

# Type-check

### Prerequisitesnpx tsc --noEmit

- Node.js 18+

- MySQL 8.0+# Platform testing

- Expo CLInpx expo start --ios

- Android Studio (for Android)npx expo start --android

- Xcode (for iOS, macOS only)npx expo start --web

```

### Running in Development

---

**Backend:**

```bash## 🔐 Privacy & Security

cd backend

npm start* 📍 **Local Data Only** — No external tracking

```* 🔒 **Anonymous Analytics (Opt-in)**

* 🧱 **No Personal Data Collection**

**Frontend:*** 📨 **Secure Local Notifications**

```bash

npx expo start --clear---

```

## 🤝 Contributing

### Building for Production

Contributions are always welcome!

**Android APK:**

```bash1. **Fork** the repository

eas build --platform android --profile production2. **Create** a feature branch (`feature/your-feature-name`)

```3. **Commit** your changes

4. **Push** and open a **Pull Request**

**iOS:**

```bash---

eas build --platform ios --profile production

```## 📜 License



---This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for more details.

## 🐛 Troubleshooting

---

### Network Request Failed

1. Check IP address: `ipconfig | Select-String -Pattern "IPv4"`## 💬 Support

2. Update `.env` with new IP

3. Restart Expo: `npx expo start --clear`For help, issues, or feature requests:



### Backend Not Starting* 📩 Open an issue on [GitHub Issues](../../issues)

1. Check MySQL is running* 📚 Check documentation under `/docs`

2. Verify database credentials in `.env`* 🧠 Explore in-app code examples

3. Ensure port 3000 is available

---

**For more troubleshooting, see [SETUP.md](SETUP.md#troubleshooting)**

### 🌱 *HabitGuard — Take control of your digital wellness journey.* 🚀

---

---

## 🔐 Privacy & Security

Would you like me to:

- ✅ Local data only - no external tracking

- ✅ No personal data collection* **Add badges** (e.g., Expo, React Native, License, Platform support) at the top, or

- ✅ Secure local notifications* **Include screenshots / demo GIF section** for a more visual GitHub profile?

- ✅ Full user control over data

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- 📩 [Open an issue](../../issues) on GitHub
- 📚 Check [SETUP.md](SETUP.md) for detailed documentation
- 🔍 Review troubleshooting section above

---

## 🗺️ Roadmap

- [ ] Real-time device usage API integration
- [ ] Machine learning usage predictions
- [ ] Family sharing & parental controls
- [ ] Health app integration
- [ ] Focus modes with app blocking
- [ ] Social features & challenges

---

**Version:** 1.0.0 | **Last Updated:** November 12, 2025

🌱 *HabitGuard — Take control of your digital wellness journey.*
