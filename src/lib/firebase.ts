/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

export const config = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId
};

if (!config.apiKey || !config.projectId) {
  throw new Error("Firebase konfigürasyonu bulunamadı veya eksik! Lütfen Firebase kurulumunu kontrol edin.");
}

// 1. Ensure initializeApp is executed only once
const app = getApps().length === 0 ? initializeApp(config) : getApp();

export const auth = getAuth(app);
try {
  if (!auth.currentUser) {
    signInAnonymously(auth).catch((err) => {
      console.warn('Firebase anonim giriş uyarısı:', err?.message || err);
    });
  }
} catch (e) {}

export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// 2 & 3. Ensure storageBucket is environment-aware and getStorage uses the app instance
const bucketName = config.storageBucket || `${config.projectId}.firebasestorage.app`;
const bucketUrl = bucketName.startsWith('gs://') ? bucketName : `gs://${bucketName}`;

export const storage = getStorage(app, bucketUrl);
export default app;
