import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

// Firebase configuration - in production, these should come from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "AIzaSyAYVPxNpPxKOS2G0H9bLQCi2V1mDfm95Zs",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "home-automation-esp-d7d8c.firebaseapp.com",
  databaseURL: Constants.expoConfig?.extra?.firebaseDatabaseURL || "https://home-automation-esp-d7d8c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "home-automation-esp-d7d8c",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "home-automation-esp-d7d8c.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "900577873605",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "1:900577873605:web:0969e0a0d35b5fbdacaaac"
};

// Initialize Firebase only once
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const database = getDatabase(app);
export const auth = getAuth(app);
export default app;

// Types for better type safety
export interface RelayState {
  relay1: boolean;
  relay2: boolean;
  relay3: boolean;
  relay4: boolean;
}

export interface Schedule {
  id: string;
  relay: string;
  time: string;
  action: 'ON' | 'OFF';
  createdAt?: number;
  lastRunAt?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  isOnline: boolean;
  lastSeen: number;
}