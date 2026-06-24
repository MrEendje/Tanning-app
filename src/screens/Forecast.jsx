import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { fetchForecast, getLocation, uvColor, uvLabel } from '../lib/uv'

const DAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

export default function Forecast({ profile, tab, setTab }) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    async function go() {
      try {
        const { lat, lon } = await getLocation()
        const f = await fetchForecast(lat, lon)
        if (!cancelled) {
          setData(f)
          setStatus('ok')
        }
      } catch {
        if (!cancelled) {
          setData(mockForecast())
          setStatus('fallback')
        }
      }
    }
    go()
    return () => {
      cancelled = true
    }
  }, [])

  const hourly = (data?.todayHourly || []).filter((h) => h.hour >= 6 && h.hour <= 21)
  const peak = hourly.reduce((a, h) => (h.uv > (a?.uv ?? -1) ? h : a), null)
  const maxUv = Math.max(6, ...hourly.map((h) => h.uv))
  const window = tanWindow(hourly)

  return (
    <div className="h-full bg-sun-soft flex flex-col">
      <TopBar profile={profile} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28 pt-4">
        <h1 className="font-display text-2xl font-extrabold text-cocoa">Voorspelling</h1>

        {status === 'loading' ? (
          <p className="text-taupe text-sm mt-4">UV-voorspelling laden… ☀️</p>
        ) : (
          <>
            {/* best tan window today */}
            <div className="glass rounded-[2rem] p-5 mt-4">
              <p className="font-display font-bold text-cocoa">🌞 Beste tan-momenten vandaag</p>
              <p className="text-sm text-taupe mt-1">
                {window
                  ? `Tussen ${window.start}:00 en ${window.end}:00 is er genoeg UV om te tannen.`
                  : 'Vandaag is er weinig UV om te tannen.'}
                {peak && peak.uv >= 1 && ` Piek om ${peak.hour}:00 (UV ${peak.uv.toFixed(0)}).`}
              </p>
            </div>

            {/* hourly bar chart */}
            <div className="glass rounded-[2rem] p-5 mt-4">
              <p className="font-display font-bold text-cocoa mb-4">UV per uur — vandaag</p>
              <div className="flex items-end justify-between gap-1 h-40">
                {hourly.map((h) => {
                  const isPeak = peak && h.hour === peak.hour
                  return (
                    <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex-1 flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(h.uv / maxUv) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="w-full rounded-md"
                          style={{
                            backgroundColor: uvColor(h.uv),
                            minHeight: 3,
                            outline: isPeak ? '2px solid #FF6B35' : 'none',
                          }}
                        />
                      </div>
                      {h.hour % 3 === 0 && (
                        <span className="text-[9px] text-taupe font-semibold">{h.hour}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 7-day forecast */}
            <div className="glass rounded-[2rem] p-5 mt-4">
              <p className="font-display font-bold text-cocoa mb-3">Komende 7 dagen</p>
              <div className="flex flex-col gap-2">
                {(data?.daily || []).map((d, i) => {
                  const dt = new Date(d.date + 'T12:00')
                  const pct = Math.min(d.uvMax / 12, 1) * 100
                  return (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="w-10 text-sm font-bold text-cocoa">
                        {i === 0 ? 'nu' : DAYS[dt.getDay()]}
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-white/60 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: uvColor(d.uvMax) }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-semibold text-taupe">
                        UV {d.uvMax.toFixed(0)} · {uvLabel(d.uvMax)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {status === 'fallback' && (
              <p className="text-center text-xs text-taupe mt-4">
                Locatie uit — voorbeeld-voorspelling. Zet locatie aan voor echte data.
              </p>
            )}
          </>
        )}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}

// first..last daytime hour where UV >= 3 (decent tanning)
function tanWindow(hourly) {
  const good = hourly.filter((h) => h.uv >= 3)
  if (!good.length) return null
  return { start: good[0].hour, end: good[good.length - 1].hour }
}

function mockForecast() {
  const todayHourly = []
  for (let h = 0; h < 24; h++) {
    const s = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI))
    todayHourly.push({ hour: h, date: 'mock', uv: Math.round(7.5 * s * 10) / 10 })
  }
  const daily = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() + i * 86400000)
    daily.push({ date: d.toISOString().slice(0, 10), uvMax: 4 + ((i * 3) % 5) })
  }
  // ensure mock hourly passes the today filter in the screen
  return { todayHourly: todayHourly.map((h) => ({ ...h, date: undefined })), daily }
}
