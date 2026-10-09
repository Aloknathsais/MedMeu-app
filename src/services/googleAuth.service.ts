import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

let initialization: Promise<void> | undefined;

export async function getGoogleIdToken(): Promise<string> {
  if (Capacitor.getPlatform() !== 'android') {
    throw new Error('Google sign-in is currently available in the Android app only.');
  }

  const webClientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error('Google sign-in is not configured. Set VITE_GOOGLE_WEB_CLIENT_ID in the frontend environment.');
  }

  initialization ??= SocialLogin.initialize({
    google: {
      webClientId,
      mode: 'online',
    },
  });

  try {
    await initialization;
  } catch (error) {
    initialization = undefined;
    throw error;
  }

  const { result } = await SocialLogin.login({
    provider: 'google',
    options: {},
  });

  if (result.responseType !== 'online' || !result.idToken) {
    throw new Error('Google sign-in did not return an ID token. Please try again.');
  }

  return result.idToken;
}
