# Vibeo-app
Vibeo is a lightweight React Native OTT-style video streaming app that supports video playback, offline downloading, watch progress tracking, and dynamic UI feedback like "Watched" badges and download indicators.

---

# Features

  Video playback with progress tracking
  Offline video download support using `expo-file-system`
  Watch status badge (marked when 95%+ watched)
  Network awareness (online/offline mode)
  Resumes playback from last watched position
  Built using Expo + React Native

---

# Tech Stack

  React Native (Expo)
  AsyncStorage – to store watch progress
  expo-file-system – for downloading and accessing videos offline
  expo-network – to detect internet connectivity
  React Navigation – screen navigation

---

# Project Structure

Vibeo/
├── App.js
├── navigation/
│ └── StackNavigator.js
├── screens/
│ ├── HomeScreen.js
│ ├── VideoPlayerScreen.js
│ └── OfflineScreen.js (optional)
├── utils/
│ └── storage.js
├── assets/
│ └── icons, images, etc.
└── README.md


---

# Installation & Setup

--bash
1. Clone the repo
git clone https://github.com/sonali1022/vibeo-app.git
cd vibeo-app

2. Install dependencies
npm install

3. Run the app (Expo)
npx expo start



