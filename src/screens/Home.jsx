import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import UVGauge from '../components/UVGauge'
import Sunny from '../components/Sunny'
import TopBar from '../components/TopBar'
import { fetchUV, getLocation, safeMinutes, adviceFor, skinType } from '../lib/uv'
import { sound } from '../lib/sound'

export default function Home({ profile, onStartSession, onOpenSelfTan }) {
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ok | fallback
  const [place, setPlace] = useState('Jouw locatie')

  useEffect(() => {
    let cancelled = false
    async function go() {
      try {
        const { lat, lon } = await getLocation()
        const w = await fetchUV(lat, lon)
        if (!cancelled) {
          setWeather(w)
          setStatus('ok')
        }
      } catch {
        // graceful fallback with a believable sunny value
        if (!cancelled) {
          setWeather({ uv: 6.2, temp: 24, bestTime: '13:00', bestUv: 7 })
          setStatus('fallback')
          setPlace('Schatting')
        }
      }
    }
    go()
    return () => {
      cancelled = true
    }
  }, [])

  const uv = weather?.uv ?? 0
  const minutes = safeMinutes(profile.skinId, uv, profile.caution)
  const canTan = minutes > 0
  const advice = adviceFor(uv, minutes)
  const st = skinType(profile.skinId)
  const adapted = (profile.caution ?? 1) < 1
  const recent = profile.lastSessionEnd && Date.now() - profile.lastSessionEnd < 3 * 3600 * 1000

  return (
    <div className="h-full bg-sun-soft flex flex-col">
      <TopBar profile={profile} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-44">
        {/* greeting */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-taupe text-sm font-semibold">{greeting()}</p>
            <h1 className="font-display text-2xl font-extrabold text-cocoa flex items-center gap-2">
              📍 {place}
            </h1>
          </div>
          {weather && (
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-cocoa">{weather.temp}°</p>
              <p className="text-xs text-taupe">{st.label}</p>
            </div>
          )}
        </div>

        {/* hero gauge card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[2rem] mt-5 p-6 flex flex-col items-center"
        >
          {status === 'loading' ? (
            <div className="h-[220px] flex items-center justify-center text-taupe">
              <Sunny mood="calm" size={90} />
            </div>
          ) : (
            <UVGauge uv={uv} />
          )}

          <div className="mt-4 text-center">
            {canTan ? (
              <>
                <p className="text-taupe text-sm font-semibold">Veilig in de zon vandaag</p>
                <p className="font-display text-4xl font-extrabold text-sun-action">
                  {minutes} <span className="text-2xl">min</span>
                </p>
                {adapted && (
                  <p className="text-xs text-taupe mt-1">🛡️ Aangepast aan jouw historie</p>
                )}
              </>
            ) : (
              <>
                <p className="font-display text-2xl font-extrabold text-cocoa">Geen zon om te tannen</p>
                <p className="text-sm text-taupe mt-1">
                  De UV is te laag{status === 'fallback' ? ' (locatie uit)' : ''}. Kom overdag terug. 🌙
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* aftercare reminder after a recent session */}
        {recent && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] mt-4 p-4 flex items-center gap-3 bg-[#E8F6EE] border border-[#bfe6cf]"
          >
            <span className="text-2xl">🧴</span>
            <div>
              <p className="font-display font-bold text-cocoa text-sm">Aftercare</p>
              <p className="text-xs text-taupe leading-snug">
                Net getand? Smeer aftersun, drink water en blijf even uit de zon.
              </p>
            </div>
          </motion.div>
        )}

        {/* Sunny advice */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[2rem] mt-4 p-5 flex items-center gap-4"
        >
          <Sunny mood={advice.mood} size={72} />
          <div>
            <p className="font-display font-bold text-cocoa">{advice.title}</p>
            <p className="text-sm text-taupe leading-snug mt-0.5">{advice.text}</p>
          </div>
        </motion.div>

        {/* best moment */}
        {status !== 'loading' && (
          <div className="mt-4 flex gap-3">
            <InfoChip icon="⏰" label="Beste zon-moment" value={weather?.bestTime || '—'} />
            <InfoChip icon="📈" label="Piek-UV" value={weather?.bestUv ?? '—'} />
          </div>
        )}

        {/* self-tanner shortcut */}
        <button
          onClick={() => {
            sound.tap()
            onOpenSelfTan()
          }}
          className="glass rounded-[2rem] mt-4 p-4 w-full flex items-center gap-3 active:scale-[0.99] transition"
        >
          <span className="text-2xl">🧴</span>
          <div className="text-left flex-1">
            <p className="font-display font-bold text-cocoa text-sm">Zelfbruiner / tanning spray</p>
            <p className="text-xs text-taupe leading-snug">
              {profile.selfTan?.lastApplied
                ? 'Bekijk je kleur-status en wanneer je moet bijwerken'
                : 'Toch kleur zonder zon — log je zelfbruiner'}
            </p>
          </div>
          <span className="text-taupe">›</span>
        </button>

        {status === 'fallback' && canTan && (
          <p className="text-center text-xs text-taupe mt-4">
            Locatie uit — dit is een schatting. Zet locatie aan voor echte UV-data.
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="absolute bottom-[88px] inset-x-0 px-5">
        <button
          disabled={!canTan}
          onClick={() => {
            sound.start()
            onStartSession({ uv, minutes })
          }}
          className={`btn-primary w-full bg-sun-gradient flex items-center justify-center gap-2 ${
            canTan ? '' : 'opacity-50 grayscale pointer-events-none'
          }`}
        >
          {canTan ? '☀️ Start zon-sessie' : '🌙 Nu te weinig zon'}
        </button>
      </div>
    </div>
  )
}

function InfoChip({ icon, label, value }) {
  return (
    <div className="flex-1 glass rounded-2xl px-4 py-3">
      <p className="text-xs text-taupe font-semibold flex items-center gap-1">
        <span>{icon}</span> {label}
      </p>
      <p className="font-display text-xl font-bold text-cocoa mt-0.5">{value}</p>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Goedenacht ✨'
  if (h < 12) return 'Goedemorgen ☀️'
  if (h < 18) return 'Goedemiddag 🌤️'
  return 'Goedenavond 🌅'
}
