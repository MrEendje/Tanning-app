import { useState } from 'react'
import { motion } from 'framer-motion'
import Sunny from '../components/Sunny'
import { uvLabel, uvColor, skinType } from '../lib/uv'
import { SESSION_TYPES, targetMinutes, RISK_META, recommendation } from '../lib/sessions'
import { sound } from '../lib/sound'

// "Mini-onboarding" to pick a tan-session type, tuned to current UV + skin.
export default function SessionSetup({ uv, skinId, caution = 1, onStart, onCancel }) {
  const { recommended, discourageFast } = recommendation(skinId, uv)
  const [picked, setPicked] = useState(recommended)
  const st = skinType(skinId)

  const chosen = SESSION_TYPES.find((t) => t.id === picked)
  const minutes = targetMinutes(chosen, skinId, uv, caution)
  const risky = chosen.risk === 'hoog'

  function confirm() {
    sound.start()
    onStart({ typeId: chosen.id, minutes })
  }

  return (
    <div className="h-full bg-sun-soft flex flex-col">
      {/* header */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <button
          onClick={() => {
            sound.back()
            onCancel()
          }}
          className="text-2xl text-cocoa active:scale-90 transition"
        >
          ←
        </button>
        <span className="font-display font-bold text-cocoa">Kies je sessie</span>
        <span className="w-6" />
      </div>

      {/* context: current UV + skin */}
      <div className="px-5 mt-3">
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <Sunny mood={uv >= 8 ? 'worried' : 'calm'} size={48} />
          <div className="text-sm">
            <p className="font-display font-bold text-cocoa">
              UV {uv.toFixed(uv % 1 === 0 ? 0 : 1)} · {uvLabel(uv)}
            </p>
            <p className="text-taupe">
              Afgestemd op {st.label} · {st.desc.toLowerCase()}
            </p>
          </div>
          <span
            className="ml-auto w-3 h-3 rounded-full"
            style={{ backgroundColor: uvColor(uv) }}
          />
        </div>
      </div>

      {/* type cards */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 mt-3 pb-4">
        <div className="flex flex-col gap-3">
          {SESSION_TYPES.map((t) => {
            const mins = targetMinutes(t, skinId, uv, caution)
            const active = picked === t.id
            const rec = recommended === t.id
            const meta = RISK_META[t.risk]
            const warnFast = t.risk === 'hoog' && discourageFast
            return (
              <button
                key={t.id}
                onClick={() => {
                  sound.select()
                  setPicked(t.id)
                }}
                className={`relative text-left rounded-3xl p-4 border-2 transition-all ${
                  active
                    ? 'bg-white border-sun-action shadow-soft scale-[1.01]'
                    : 'bg-white/70 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${t.accent}22` }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-cocoa">{t.name}</span>
                      {rec && (
                        <span className="text-[10px] font-bold text-white bg-sun-action rounded-full px-2 py-0.5">
                          AANBEVOLEN
                        </span>
                      )}
                      {t.best && !rec && (
                        <span className="text-[10px] font-bold text-sun-action">★ favoriet</span>
                      )}
                    </div>
                    <p className="text-xs text-taupe leading-snug mt-0.5">{t.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl font-extrabold text-cocoa leading-none">
                      {mins}
                    </p>
                    <p className="text-[10px] text-taupe font-semibold">min</p>
                  </div>
                </div>

                {/* risk row */}
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="text-[11px] font-bold rounded-full px-2 py-0.5"
                    style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  {warnFast && (
                    <span className="text-[11px] text-sun-action font-semibold">
                      ⚠️ Afgeraden bij jouw huid/UV
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* confirm */}
      <div className="px-5 pb-8 pt-1">
        {risky && (
          <p className="text-center text-xs text-sun-action font-semibold mb-2">
            🔥 Je gaat voorbij je veilige limiet — Sunny waarschuwt je tijdens de sessie.
          </p>
        )}
        <motion.button
          key={picked}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          onClick={confirm}
          className="btn-primary w-full bg-sun-gradient flex items-center justify-center gap-2"
        >
          {chosen.icon} Start «{chosen.name}» · {minutes} min
        </motion.button>
      </div>
    </div>
  )
}
