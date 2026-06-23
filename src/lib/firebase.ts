import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrzToshpWB1A9t174xqm99l0E95qB53PY",
  authDomain: "etribe-huevito-prod.firebaseapp.com",
  projectId: "etribe-huevito-prod",
  storageBucket: "etribe-huevito-prod.firebasestorage.app",
  messagingSenderId: "665270481829",
  appId: "1:665270481829:web:b8457b650ec83e0690ae4c",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Get the current Firebase ID token.
 * Pass `forceRefresh = true` to force token refresh (used on 401 retries).
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

export { onAuthStateChanged };
export type { User };
