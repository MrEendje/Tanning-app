import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'

// Returns: undefined while loading, null when logged out, or the User object.
export function useAuth() {
  const [user, setUser] = useState(undefined)
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), [])
  return user
}

export function logout() {
  return signOut(auth)
}

// Friendly Dutch messages for the common Firebase auth error codes.
export function authErrorMessage(code) {
  const map = {
    'auth/invalid-email': 'Dit e-mailadres is ongeldig.',
    'auth/user-not-found': 'Geen account gevonden met dit e-mailadres.',
    'auth/wrong-password': 'Onjuist wachtwoord.',
    'auth/invalid-credential': 'E-mail of wachtwoord klopt niet.',
    'auth/email-already-in-use': 'Er bestaat al een account met dit e-mailadres.',
    'auth/weak-password': 'Kies een wachtwoord van minstens 6 tekens.',
    'auth/popup-closed-by-user': 'Inloggen geannuleerd.',
    'auth/too-many-requests': 'Te veel pogingen. Probeer het later opnieuw.',
    'auth/network-request-failed': 'Geen verbinding. Check je internet.',
  }
  return map[code] || 'Er ging iets mis. Probeer het opnieuw.'
}
