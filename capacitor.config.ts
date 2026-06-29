import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medmeu.app',
  appName: 'Medmeu',
  webDir: 'dist',
  server: {
    androidScheme: 'https',                 // prod
    // url: 'http://192.168.29.230:5173',   // dev
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#2171a8',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#2171a8',
      overlaysWebView: true,      // ← this makes content go under status bar
    },
    EdgeToEdge: {
      enabled: true,              // ← full edge to edge screen
    },
  },
};

export default config;
