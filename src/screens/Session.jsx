import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sunny from '../components/Sunny'
import { uvColor } from '../lib/uv'
import { sound } from '../lib/sound'

// Live session coach.
// minutes  = target length of the chosen session type.
// safeMin  = your personal safe budget (UV × skin). For "fast" sessions the target
//            exceeds this, so everything past safeMin is a flagged burn-risk zone.
// We count in seconds; a demo speed multiplier lets you watch the reminders fire.
export default function Session({ uv, minutes, safeMin, typeName = 'Zon-sessie', onFinish, onCancel }) {
  const limitSec = Math.max(60, minutes * 60)
  const safeSec = Math.min(limitSec, Math.max(30, (safeMin ?? minutes) * 60))
  const canBurn = safeSec < limitSec - 1 // this type pushes past the safe limit
  const [elapsed, setElapsed] = useState(0)
  const [speed, setSpeed] = useState(8) // demo: 8x. Set to 1 for real-time.
  const [side, setSide] = useState('voorkant')
  const [toast, setToast] = useState(null)
  const [paused, setPaused] = useState(false)
  const flipAt = useRef(new Set())
  const screenAt = useRef(false)
  const overAt = useRef(false)

  // schedule flip reminders at 1/3 and 2/3 of the limit
  const flipPoints = [Math.round(limitSec / 3), Math.round((2 * limitSec) / 3)]
  const screenPoint = Math.min(limitSec * 0.66, 2 * 3600) // reapply ~2h or 2/3 in

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      setElapsed((e) => {
        const ne = e + speed
        // flip reminders
        flipPoints.forEach((p) => {
          if (ne >= p && !flipAt.current.has(p)) {
            flipAt.current.add(p)
            setSide((s) => (s === 'voorkant' ? 'rugkant' : 'voorkant'))
            buzz()
            sound.ping()
            showToast({ icon: '🔄', text: 'Draai om! Tijd voor de andere kant.' })
          }
        })
        if (ne >= screenPoint && !screenAt.current) {
          screenAt.current = true
          sound.ping()
          showToast({ icon: '🧴', text: 'Smeer opnieuw in (SPF 30+).' })
        }
        // crossing the safe budget → burn-risk warning
        if (ne >= safeSec && !overAt.current) {
          overAt.current = true
          buzz()
          sound.warn()
          showToast(
            canBurn
              ? { icon: '🔥', text: 'Verbrandingszone! Hou het kort of zoek schaduw.' }
              : { icon: '⛱️', text: 'Veilige limiet bereikt — tijd om te schuilen.' },
          )
        }
        return ne
      })
    }, 1000)
    return () => clearInterval(t)
  }, [paused, speed])

  const pct = Math.min(elapsed / limitSec, 1)
  const remaining = Math.max(0, limitSec - elapsed)
  const pastSafe = elapsed >= safeSec
  const color = pastSafe ? '#FF5E5E' : uvColor(uv)

  function showToast(t) {
    setToast(t)
    setTimeout(() => setToast(null), 3500)
  }

  function finish() {
    sound.success()
    const actualMin = Math.round(Math.min(elapsed, limitSec) / 60)
    const xp = 10 + Math.round(actualMin / 2)
    const burned = elapsed > safeSec + 30 // stayed notably past the safe budget
    onFinish({ minutes: Math.max(1, actualMin), uv, xp, burned })
  }

  return (
    <div className="h-full flex flex-col" style={{ background: pastSafe ? '#3a1410' : '#1f1308' }}>
      {/* top bar */}
      <div className="flex items-center justify-between px-5 pt-5 text-white/90">
        <button
          onClick={() => {
            sound.back()
            onCancel()
          }}
          className="text-2xl active:scale-90 transition"
        >
          ✕
        </button>
        <span className="font-display font-bold truncate max-w-[150px]">{typeName}</span>
        <button
          onClick={() => setSpeed((s) => (s === 1 ? 8 : 1))}
          className="text-xs rounded-full bg-white/15 px-3 py-1 font-semibold"
        >
          {speed}× demo
        </button>
      </div>

      {/* ring */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: 280, height: 280 }}>
          <svg
            width="280"
            height="280"
            viewBox="0 0 320 320"
            className="-rotate-90 overflow-visible"
          >
            <circle cx="160" cy="160" r="124" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="18" />
            <motion.circle
              cx="160"
              cy="160"
              r="124"
              fill="none"
              stroke={color}
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 124}
              animate={{ strokeDashoffset: 2 * Math.PI * 124 * (1 - pct) }}
              transition={{ ease: 'linear', duration: 1 }}
              style={{ filter: `drop-shadow(0 0 12px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Sunny mood={pastSafe ? 'worried' : 'calm'} size={70} />
            <p className="font-display text-5xl font-extrabold mt-2 tabular-nums">
              {fmt(remaining)}
            </p>
            <p className="text-white/60 text-sm font-semibold mt-1">
              {pastSafe ? 'buiten veilige zone' : 'resterend'}
            </p>
            {canBurn && !pastSafe && (
              <p className="text-[11px] font-bold mt-1" style={{ color: '#FFD06B' }}>
                ⚠️ veilig nog {fmt(safeSec - elapsed)}
              </p>
            )}
          </div>
        </div>

        {/* current side */}
        <div className="mt-8 flex items-center gap-2 text-white/90">
          <span className="text-2xl">{side === 'voorkant' ? '🔆' : '🌙'}</span>
          <span className="font-display font-semibold">Nu: {side}</span>
        </div>

        {/* shade warning */}
        <AnimatePresence>
          {pastSafe && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-5 rounded-2xl bg-red-500/90 text-white px-5 py-3 font-display font-bold flex items-center gap-2"
            >
              {canBurn ? '🔥 Verbrandingsrisico — schuilen!' : '⛱️ Zoek nu schaduw!'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* toast reminders */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 inset-x-6 glass rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <span className="text-2xl">{toast.icon}</span>
            <span className="font-display font-bold text-cocoa">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* controls */}
      <div className="px-5 pb-8 flex gap-3">
        <button
          onClick={() => {
            sound.tap()
            setPaused((p) => !p)
          }}
          className="btn-ghost flex-1 bg-white/15 text-white"
        >
          {paused ? '▶ Hervat' : '⏸ Pauze'}
        </button>
        <button onClick={finish} className="btn-primary flex-1">
          Sessie afronden
        </button>
      </div>
    </div>
  )
}

function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function buzz() {
  if (navigator.vibrate) navigator.vibrate(200)
}
