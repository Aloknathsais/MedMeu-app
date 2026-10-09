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

## Google Sign-In (Android)

1. In Google Cloud Console, configure the OAuth consent screen and create:
   - A **Web application** OAuth client. Its client ID is the backend audience.
   - An **Android** OAuth client with package name `com.medmeu.app` and the
     SHA-1 signing certificate fingerprint for the build. For local debug builds,
     run `.\gradlew signingReport` from the `android` directory and use the
     `SHA1` value under the `debug` variant. Add a separate Android client for
     the release signing certificate before publishing.
2. If the consent screen is in testing mode, add the Google accounts used for
   testing as test users.
3. Put the **Web application client ID** in the frontend project's `.env`:
   ```env
   VITE_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```
4. Put the same Web application client ID in the backend's `.env`:
   ```env
   GOOGLE_OAUTH_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
   ```
5. Restart the backend, then rebuild/sync and reinstall the Android app:
   ```bash
   npm run build
   npx cap sync android
   ```

The Android app sends Google's ID token to `POST /api/auth/google`. The backend
verifies the token and its audience before issuing the app JWT. A verified Google
email matching an existing WooCommerce customer signs into that account; otherwise
a WooCommerce customer account is created automatically. No Google password is
requested or stored.

## Build APK for Testing
In Android Studio: Build → Build Bundle(s)/APK(s) → Build APK(s)
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Install APK directly on phone
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```
