import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PhoneFrame from './components/PhoneFrame'
import BottomNav from './components/BottomNav'
import Onboarding from './screens/Onboarding'
import Login from './screens/Login'
import Home from './screens/Home'
import Forecast from './screens/Forecast'
import SessionSetup from './screens/SessionSetup'
import SelfTan from './screens/SelfTan'
import Session from './screens/Session'
import Progress from './screens/Progress'
import Profile from './screens/Profile'
import Sunny from './components/Sunny'
import { useProfile, completeSession, BADGES } from './lib/store'
import { sound, setSoundEnabled } from './lib/sound'
import { sessionType } from './lib/sessions'
import { useAuth, logout } from './lib/auth'
import { initAnalytics } from './lib/firebase'

// Auth gate: decide between loading / login / the actual app.
export default function App() {
  const user = useAuth()

  useEffect(() => {
    initAnalytics()
  }, [])

  if (user === undefined) {
    return (
      <PhoneFrame>
        <Splash text="Even laden…" />
      </PhoneFrame>
    )
  }
  if (!user) {
    return (
      <PhoneFrame>
        <Login />
      </PhoneFrame>
    )
  }
  return <AuthedApp user={user} />
}

function Splash({ text }) {
  return (
    <div className="h-full bg-sun-soft flex flex-col items-center justify-center gap-4">
      <Sunny mood="calm" size={110} />
      <p className="text-taupe font-semibold">{text}</p>
    </div>
  )
}

function AuthedApp({ user }) {
  const { profile, update, addXp, reset } = useProfile(user.uid)
  const [tab, setTab] = useState('home')
  const [setup, setSetup] = useState(null) // { uv, safeMin } — choosing a session type
  const [session, setSession] = useState(null) // active session
  const [reward, setReward] = useState(null) // celebration overlay
  const [selfTanOpen, setSelfTanOpen] = useState(false)

  // keep the sound engine in sync with the user's preference
  useEffect(() => {
    setSoundEnabled(profile?.sound !== false)
  }, [profile?.sound])

  // celebrate with sound when a reward appears
  useEffect(() => {
    if (reward) sound.reward()
  }, [reward])

  function finishOnboarding({ skinId, goal }) {
    update({ onboarded: true, skinId, goal })
  }

  // Home → pick a session type
  function openSetup({ uv, minutes }) {
    setSetup({ uv, safeMin: minutes })
  }

  // Setup → start the chosen type
  function startSession({ typeId, minutes }) {
    const t = sessionType(typeId)
    setSession({ uv: setup.uv, minutes, safeMin: setup.safeMin, typeName: t.name })
    setSetup(null)
  }

  function handleFinish({ minutes, uv, xp, burned }) {
    const { patch, earned } = completeSession(profile, minutes, uv, burned)
    update(patch)
    addXp(xp)
    setSession(null)
    setTab('home')
    setReward({ xp, minutes, badges: earned, burned, caution: patch.caution })
  }

  if (!profile) {
    return (
      <PhoneFrame>
        <Splash text="Profiel laden…" />
      </PhoneFrame>
    )
  }

  if (!profile.onboarded) {
    return (
      <PhoneFrame>
        <Onboarding onDone={finishOnboarding} />
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      {/* session-type picker */}
      <AnimatePresence>
        {setup && !session && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute inset-0 z-20"
          >
            <SessionSetup
              uv={setup.uv}
              skinId={profile.skinId}
              caution={profile.caution}
              onStart={startSession}
              onCancel={() => setSetup(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* active session takes over the whole frame */}
      <AnimatePresence>
        {session && (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30"
          >
            <Session
              uv={session.uv}
              minutes={session.minutes}
              safeMin={session.safeMin}
              typeName={session.typeName}
              onFinish={handleFinish}
              onCancel={() => setSession(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* main tabs */}
      {!session && !setup && (
        <div className="h-full">
          {tab === 'home' && (
            <>
              <Home
                profile={profile}
                onStartSession={openSetup}
                onOpenSelfTan={() => setSelfTanOpen(true)}
              />
              <BottomNav tab={tab} setTab={setTab} />
            </>
          )}
          {tab === 'forecast' && <Forecast profile={profile} tab={tab} setTab={setTab} />}
          {tab === 'progress' && <Progress profile={profile} tab={tab} setTab={setTab} />}
          {tab === 'profile' && (
            <Profile
              profile={profile}
              email={user.email}
              tab={tab}
              setTab={setTab}
              onToggleSound={() => {
                const next = profile.sound === false
                setSoundEnabled(next)
                if (next) sound.tap()
                update({ sound: next })
              }}
              onReset={() => {
                sound.back()
                reset()
                setTab('home')
              }}
              onLogout={() => {
                sound.back()
                logout()
              }}
            />
          )}
        </div>
      )}

      {/* self-tanner modal */}
      <AnimatePresence>
        {selfTanOpen && (
          <SelfTan profile={profile} update={update} onClose={() => setSelfTanOpen(false)} />
        )}
      </AnimatePresence>

      {/* reward celebration */}
      <AnimatePresence>
        {reward && <Reward reward={reward} onClose={() => setReward(null)} />}
      </AnimatePresence>
    </PhoneFrame>
  )
}

const AFTERCARE = [
  { id: 'aftersun', icon: '🧴', text: 'Aftersun aanbrengen' },
  { id: 'water', icon: '💧', text: 'Een glas water drinken' },
  { id: 'shade', icon: '⛱️', text: 'Even uit de zon blijven' },
]

function Reward({ reward, onClose }) {
  const [done, setDone] = useState([])
  const burned = reward.burned
  const toggle = (id) => {
    sound.tap()
    setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream rounded-[2rem] p-7 w-full max-h-[85%] overflow-y-auto no-scrollbar text-center shadow-2xl"
      >
        <div className="flex justify-center">
          <Sunny mood={burned ? 'worried' : 'happy'} size={104} />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-cocoa mt-3">
          {burned ? 'Pas op met verbranden' : 'Goed gedaan! 🎉'}
        </h2>
        <p className="text-taupe mt-1">{reward.minutes} min getand</p>

        {burned && (
          <p className="text-sm text-sun-action font-semibold mt-2">
            🛡️ Je ging voorbij je veilige limiet. Sunny verlaagt voortaan je veilige tijd een beetje.
          </p>
        )}

        <div className="inline-block mt-4 rounded-full bg-sun-gradient text-white font-display font-bold px-6 py-2 text-lg">
          +{reward.xp} XP
        </div>

        {reward.badges.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-taupe mb-2">Nieuwe badge{reward.badges.length > 1 ? 's' : ''}!</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {reward.badges.map((id) => (
                <motion.div
                  key={id}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="glass rounded-2xl p-3 flex flex-col items-center w-24"
                >
                  <span className="text-3xl">{BADGES[id].icon}</span>
                  <span className="text-[11px] font-bold text-cocoa mt-1 leading-tight">{BADGES[id].name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* aftercare checklist */}
        <div className="mt-6 text-left">
          <p className="font-display font-bold text-cocoa mb-2">🧖 Aftercare</p>
          <div className="flex flex-col gap-2">
            {AFTERCARE.map((a) => {
              const checked = done.includes(a.id)
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition ${
                    checked ? 'border-green-400 bg-green-50' : 'border-white bg-white/70'
                  }`}
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className={`font-semibold text-sm ${checked ? 'text-green-700 line-through' : 'text-cocoa'}`}>
                    {a.text}
                  </span>
                  <span className="ml-auto text-lg">{checked ? '✅' : '⭕'}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => {
            sound.tap()
            onClose()
          }}
          className="btn-primary w-full mt-6"
        >
          {burned ? 'Begrepen' : 'Lekker bezig!'}
        </button>
      </motion.div>
    </motion.div>
  )
}
