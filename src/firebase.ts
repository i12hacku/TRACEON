// Firebase setup for TRACEON. Values come from .env.local (git-ignored); see .env.example.
// Add other SDKs as needed: https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'firebase/app';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.warn(`Firebase config missing: ${missing.join(', ')}. Copy .env.example to .env.local.`);
}

export const app = initializeApp(firebaseConfig);
