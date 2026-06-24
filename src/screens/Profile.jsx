import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import Sunny from '../components/Sunny'
import { BADGES } from '../lib/store'
import { skinType } from '../lib/uv'
import { sound } from '../lib/sound'

const GOALS = {
  glow: 'Mooie glow',
  base: 'Base tan opbouwen',
  maintain: 'Onderhouden',
}

export default function Profile({ profile, email, tab, setTab, onReset, onToggleSound, onLogout }) {
  const soundOn = profile.sound !== false
  const st = skinType(profile.skinId)
  const allBadges = Object.keys(BADGES)
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="h-full bg-sun-soft flex flex-col">
      <TopBar profile={profile} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28 pt-4">
        {/* header card */}
        <div className="glass rounded-[2rem] p-6 flex flex-col items-center text-center">
          <Sunny mood="happy" size={88} />
          <h1 className="font-display text-2xl font-extrabold text-cocoa mt-3">Level {profile.level}</h1>
          <p className="text-taupe text-sm">Zonneschijn-expert in opleiding</p>
          <div className="flex gap-2 mt-4">
            <Pill>🔥 {profile.streak} dagen streak</Pill>
            <Pill>⭐ {profile.xp} XP</Pill>
          </div>
        </div>

        {/* skin profile */}
        <div className="glass rounded-[2rem] p-5 mt-4 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl border-4 border-white shadow"
            style={{ backgroundColor: st.tint }}
          />
          <div>
            <p className="font-display font-bold text-cocoa">Huidtype {st.label}</p>
            <p className="text-sm text-taupe">{st.desc}</p>
          </div>
        </div>

        {/* goal */}
        <div className="glass rounded-2xl p-4 mt-4 flex items-center justify-between">
          <span className="text-taupe font-semibold text-sm">🎯 Doel</span>
          <span className="font-display font-bold text-cocoa">{GOALS[profile.goal] || '—'}</span>
        </div>

        {/* sound toggle */}
        <button
          onClick={onToggleSound}
          className="glass rounded-2xl p-4 mt-3 flex items-center justify-between w-full active:scale-[0.99] transition"
        >
          <span className="text-taupe font-semibold text-sm">
            {soundOn ? '🔊' : '🔇'} Geluidseffecten
          </span>
          <span
            className={`relative w-12 h-7 rounded-full transition-colors ${
              soundOn ? 'bg-sun-action' : 'bg-taupe/40'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                soundOn ? 'left-6' : 'left-1'
              }`}
            />
          </span>
        </button>

        {/* badges */}
        <h2 className="font-display text-lg font-extrabold text-cocoa mt-6 mb-3">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {allBadges.map((id) => {
            const b = BADGES[id]
            const earned = profile.badges.includes(id)
            return (
              <div
                key={id}
                className={`glass rounded-2xl p-3 flex flex-col items-center text-center transition ${
                  earned ? '' : 'opacity-40 grayscale'
                }`}
              >
                <span className="text-3xl">{b.icon}</span>
                <span className="text-[11px] font-bold text-cocoa mt-1 leading-tight">{b.name}</span>
              </div>
            )
          })}
        </div>

        {/* account */}
        <div className="glass rounded-2xl p-4 mt-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-taupe font-semibold">Ingelogd als</p>
            <p className="font-display font-bold text-cocoa truncate">{email || 'Onbekend'}</p>
          </div>
          <button
            onClick={onLogout}
            className="shrink-0 rounded-xl bg-white/80 px-4 py-2 text-sm font-bold text-sun-action active:scale-95 transition"
          >
            Uitloggen
          </button>
        </div>

        <button
          onClick={() => {
            sound.tap()
            setConfirm(true)
          }}
          className="w-full text-center text-taupe text-sm mt-6 font-semibold underline"
        >
          Profiel resetten (opnieuw onboarden)
        </button>
      </div>
      <BottomNav tab={tab} setTab={setTab} />

      {/* reset confirmation */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cream rounded-[2rem] p-7 w-full text-center shadow-2xl"
            >
              <div className="text-5xl">⚠️</div>
              <h2 className="font-display text-xl font-extrabold text-cocoa mt-3">Weet je het zeker?</h2>
              <p className="text-sm text-taupe mt-2">
                Hiermee wis je je hele profiel: huidtype, streak, XP, badges, sessies en zelfbruiner.
                Dit kan niet ongedaan worden gemaakt.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => {
                    setConfirm(false)
                    onReset()
                  }}
                  className="btn-primary w-full bg-[#FF5E5E]"
                >
                  Ja, alles wissen
                </button>
                <button
                  onClick={() => {
                    sound.back()
                    setConfirm(false)
                  }}
                  className="btn-ghost w-full"
                >
                  Annuleren
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Pill({ children }) {
  return (
    <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-cocoa">
      {children}
    </span>
  )
}
