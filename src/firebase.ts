// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app'
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, setPersistence, indexedDBLocalPersistence } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

// Force rebuild to pick up new environment variables (Nov 22, 2025)

// Sanitize DATABASE_URL - remove trailing slash if present
const rawDatabaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project'}.firebaseio.com`;
const databaseURL = rawDatabaseURL.replace(/\/$/, '');  // Remove trailing slash

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBIHI9VCi3OEgP5mxWotuAJYqJ46MGZgw",
  authDomain: "playokeforyou-dev.firebaseapp.com",
  databaseURL: "https://playokeforyou-dev-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "playokeforyou-dev",
  storageBucket: "playokeforyou-dev.firebasestorage.app",
  messagingSenderId: "513774834580",
  appId: "1:513774834580:web:00c192b705e7c76abe3581"
};

// Initialize Firebase only if config is valid
let app;
let auth;
let database;
let realtimeDb;
let storage;

try {
  // Check if Firebase is already initialized
  if (!getApps().length && firebaseConfig.apiKey !== 'dummy-api-key') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getFirestore(app);
    realtimeDb = getDatabase(app);
    storage = getStorage(app);

    // Enable auth persistence for instant auth checks
    if (typeof window !== 'undefined' && auth) {
      setPersistence(auth, indexedDBLocalPersistence).catch((err) => {
        console.warn('Auth persistence failed:', err);
      });
    }

    // Enable offline persistence for faster loads
    if (typeof window !== 'undefined' && database) {
      enableMultiTabIndexedDbPersistence(database).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Persistence not available in this browser');
        }
      });
    }
  } else if (getApps().length > 0) {
    app = getApps()[0];
    auth = getAuth(app);
    database = getFirestore(app);
    realtimeDb = getDatabase(app);
    storage = getStorage(app);
  } else {
    // Firebase not configured - use mock values
    console.warn('Firebase not configured. Using mock values.');
    app = null;
    auth = null;
    database = null;
    realtimeDb = null;
    storage = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = null;
  auth = null;
  database = null;
  realtimeDb = null;
  storage = null;
}

// Export with common aliases
export { app, auth, database, realtimeDb, storage };
export { database as db }; // Alias for admin pages
