# 🏥 Medmeu - Setup & Run on Android

## Prerequisites
Install these on your computer:
1. **Node.js 18+** → https://nodejs.org
2. **Android Studio** → https://developer.android.com/studio
3. **JDK 17** → https://adoptium.net

## Step 1: Install Dependencies
```bash
cd medmeu
npm install --legacy-peer-deps
```

## Step 2: Build the Web App
```bash
npm run build
```

## Step 3: Add Android Platform
```bash
npx cap add android
npx cap sync android
```

## Step 4: Open in Android Studio
```bash
npx cap open android
```
This opens Android Studio. Then:
- Wait for Gradle sync to complete
- Connect your Android phone via USB
- Enable **Developer Mode** on phone: Settings → About Phone → tap Build Number 7 times
- Enable **USB Debugging**: Settings → Developer Options → USB Debugging ✓
- Click ▶️ **Run** button in Android Studio

## Step 5: Run on Device (Alternative - command line)
```bash
# Make sure adb sees your device
adb devices

# Build + install
npx cap run android
```

## Hot Reload During Development
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Update capacitor with local server
# Edit capacitor.config.ts → add: server: { url: 'http://YOUR_IP:5173', cleartext: true }
npx cap sync
npx cap open android
```

## App Features
- 🔐 Login / Register (Email + OTP)
- 🏠 Home: Banners, Categories, Products
- 🛍️ Products: Filter, Sort, Search
- 📦 Product Detail: Images, Specs, Cart
- 🛒 Cart: Manage items, Checkout
- 📋 Orders: History, Tracking
- 👤 Profile: Settings, Wishlist, Logout

## API Integration
Edit `src/services/api.ts` → change BASE_URL to your backend:
```ts
const BASE_URL = 'https://your-api.medmeu.com/v1';
```

## Build APK for Testing
In Android Studio: Build → Build Bundle(s)/APK(s) → Build APK(s)
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Install APK directly on phone
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```
