import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAMADkM6BJazgFbRlezosZDSavKivV-7Ts',
  authDomain: 'tanning-7b6d5.firebaseapp.com',
  projectId: 'tanning-7b6d5',
  storageBucket: 'tanning-7b6d5.firebasestorage.app',
  messagingSenderId: '320630617501',
  appId: '1:320630617501:web:6d118b6cbca9b26948ab74',
  measurementId: 'G-RZB85D2D37',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Analytics only works in supported (https/localhost) environments — load it lazily
// and never let it crash the app.
export async function initAnalytics() {
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics')
    if (await isSupported()) getAnalytics(app)
  } catch {
    /* analytics unavailable — ignore */
  }
}
