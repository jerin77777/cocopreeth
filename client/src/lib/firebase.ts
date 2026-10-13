import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ── Instance 1: WebForge ───────────────────────────────────────────────────────
// Connects to WebForge's Firestore to fetch your page schemas at runtime.
// These credentials are managed by WebForge — do not change them.
const webforgeFirebaseConfig = {
  apiKey: import.meta.env.VITE_WEBFORGE_FIREBASE_API_KEY || "AIzaSyD8GwpnmBK8PXUG6jMYbtMI12pvzJlfAJI",
  authDomain: import.meta.env.VITE_WEBFORGE_FIREBASE_AUTH_DOMAIN || "webforge-studios.firebaseapp.com",
  projectId: import.meta.env.VITE_WEBFORGE_FIREBASE_PROJECT_ID || "webforge-studios",
};

const webforgeApp = getApps().some((a) => a.name === 'webforge')
  ? getApp('webforge')
  : initializeApp(webforgeFirebaseConfig, 'webforge');

/** Use this to read page schemas from WebForge. */
export const webforgeDb = getFirestore(webforgeApp);

// ── Instance 2: Your Project Firebase ─────────────────────────────────────────
// Your own Firebase project for website-specific data (products, orders, users, etc.)
const projectFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
};

const hasProjectFirebase = Boolean(
  projectFirebaseConfig.apiKey &&
  projectFirebaseConfig.authDomain &&
  projectFirebaseConfig.projectId
);

/** Use this for all your website's own data (products, orders, users, etc.) */
export const db: import('firebase/firestore').Firestore | null = hasProjectFirebase
  ? getFirestore(
      getApps().some((a) => a.name === 'project')
        ? getApp('project')
        : initializeApp(projectFirebaseConfig, 'project')
    )
  : null;
