import { motion } from 'framer-motion'
import { sound } from '../lib/sound'

const DEVELOP_HOURS = 8 // time to fully develop
const LASTS_DAYS = 6 // before it fades / reapply

const TIPS = [
  { icon: '🧽', text: 'Scrub & ontvet je huid vooraf voor een gelijkmatig resultaat' },
  { icon: '🧤', text: 'Breng dun en gelijkmatig aan, was daarna je handen' },
  { icon: '🚿', text: `Niet douchen of zweten de eerste ${DEVELOP_HOURS} uur` },
  { icon: '💧', text: 'Dagelijks insmeren met bodylotion houdt de kleur langer mooi' },
]

export default function SelfTan({ profile, update, onClose }) {
  const last = profile.selfTan?.lastApplied || null
  const hoursAgo = last ? (Date.now() - last) / 3600000 : null
  const developPct = hoursAgo != null ? Math.min(hoursAgo / DEVELOP_HOURS, 1) * 100 : 0
  const developed = hoursAgo != null && hoursAgo >= DEVELOP_HOURS
  const daysLeft = hoursAgo != null ? Math.max(0, LASTS_DAYS - hoursAgo / 24) : null

  function apply() {
    sound.success()
    update({ selfTan: { lastApplied: Date.now() } })
  }
  function clear() {
    sound.back()
    update({ selfTan: { lastApplied: null } })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream rounded-[2rem] p-6 w-full max-h-[88%] overflow-y-auto no-scrollbar shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-cocoa">🧴 Zelfbruiner</h2>
          <button onClick={onClose} className="text-2xl text-taupe active:scale-90 transition">
            ✕
          </button>
        </div>
        <p className="text-sm text-taupe mt-1">
          Geen zon? Krijg toch kleur met tanning spray of zelfbruiner — Sunny houdt het bij.
        </p>

        {/* status */}
        {last ? (
          <div className="glass rounded-[1.5rem] p-5 mt-4">
            <p className="font-display font-bold text-cocoa">
              {developed ? '✨ Volledig ontwikkeld' : '⏳ Aan het intrekken…'}
            </p>
            <p className="text-xs text-taupe mt-0.5">
              Aangebracht {fmtAgo(hoursAgo)}
            </p>
            <div className="h-3 rounded-full bg-white/70 overflow-hidden mt-3">
              <div
                className="h-full rounded-full bg-sun-gradient transition-all"
                style={{ width: `${developPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-taupe font-semibold mt-1">
              <span>net aangebracht</span>
              <span>na {DEVELOP_HOURS}u klaar</span>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-xl">⏰</span>
              <span className="text-sm text-cocoa font-semibold">
                {daysLeft >= 1
                  ? `Vervaagt over ± ${Math.round(daysLeft)} dag${Math.round(daysLeft) === 1 ? '' : 'en'} — dan opnieuw aanbrengen`
                  : 'Tijd om opnieuw aan te brengen voor egale kleur'}
              </span>
            </div>
          </div>
        ) : (
          <div className="glass rounded-[1.5rem] p-5 mt-4 text-center">
            <div className="text-5xl">🧴</div>
            <p className="text-sm text-taupe mt-2">
              Nog niets aangebracht. Tik hieronder zodra je zelfbruiner opdoet.
            </p>
          </div>
        )}

        {/* tips */}
        <p className="font-display font-bold text-cocoa mt-5 mb-2">Tips voor het beste resultaat</p>
        <div className="flex flex-col gap-2">
          {TIPS.map((t) => (
            <div key={t.text} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-xl">{t.icon}</span>
              <span className="text-sm text-cocoa">{t.text}</span>
            </div>
          ))}
        </div>

        <button onClick={apply} className="btn-primary w-full mt-6 bg-sun-gradient">
          {last ? '🔄 Opnieuw aangebracht' : '🧴 Net aangebracht'}
        </button>
        {last && (
          <button onClick={clear} className="w-full text-center text-taupe text-sm mt-3 font-semibold">
            Wissen
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

function fmtAgo(hours) {
  if (hours < 1) return `${Math.round(hours * 60)} min geleden`
  if (hours < 24) return `${Math.round(hours)} uur geleden`
  return `${Math.round(hours / 24)} dag(en) geleden`
}
