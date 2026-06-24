import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { authErrorMessage } from '../lib/auth'
import Sunny from '../components/Sunny'
import { sound } from '../lib/sound'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      sound.tap()
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
      sound.success()
    } catch (err) {
      setError(authErrorMessage(err.code))
    } finally {
      setBusy(false)
    }
  }

  async function google() {
    setError('')
    setBusy(true)
    try {
      sound.tap()
      await signInWithPopup(auth, new GoogleAuthProvider())
      sound.success()
    } catch (err) {
      setError(authErrorMessage(err.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full bg-sun-soft flex flex-col px-6 py-8 overflow-y-auto no-scrollbar">
      {/* hero */}
      <div className="flex flex-col items-center text-center mt-4">
        <Sunny mood="happy" size={120} />
        <h1 className="font-display text-3xl font-extrabold text-cocoa mt-4">Welkom bij Sunny</h1>
        <p className="text-taupe mt-2 text-sm max-w-xs">
          {mode === 'signin'
            ? 'Log in en straal verder je voortgang staat veilig in de cloud.'
            : 'Maak een account en begin veilig te tannen met Sunny. ☀️'}
        </p>
      </div>

      {/* form */}
      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mailadres"
          autoComplete="email"
          className="rounded-2xl bg-white/80 border border-white px-5 py-4 text-cocoa font-semibold
            outline-none focus:border-sun-action transition"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wachtwoord"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          className="rounded-2xl bg-white/80 border border-white px-5 py-4 text-cocoa font-semibold
            outline-none focus:border-sun-action transition"
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[#FF5E5E] font-semibold text-center"
          >
            {error}
          </motion.p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full mt-1 disabled:opacity-60">
          {busy ? 'Bezig…' : mode === 'signin' ? 'Inloggen' : 'Account aanmaken'}
        </button>
      </form>

      {/* divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-taupe/30" />
        <span className="text-xs text-taupe font-semibold">of</span>
        <div className="h-px flex-1 bg-taupe/30" />
      </div>

      {/* google */}
      <button
        onClick={google}
        disabled={busy}
        className="btn-ghost w-full flex items-center justify-center gap-3 disabled:opacity-60"
      >
        <GoogleIcon /> Verder met Google
      </button>

      {/* toggle */}
      <button
        onClick={() => {
          sound.tap()
          setError('')
          setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
        }}
        className="text-center text-sm text-taupe mt-6 font-semibold"
      >
        {mode === 'signin' ? (
          <>Nog geen account? <span className="text-sun-action">Maak er een aan</span></>
        ) : (
          <>Heb je al een account? <span className="text-sun-action">Log in</span></>
        )}
      </button>

      <p className="text-center text-[11px] text-taupe mt-6 leading-snug">
        Door verder te gaan ga je akkoord met veilig en bewust zongebruik.
        Sunny geeft geen medisch advies.
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.9 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.1 42.3 16 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.6 35.5 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  )
}
