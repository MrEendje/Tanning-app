import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'

export default function Progress({ profile, tab, setTab }) {
  const last7 = lastNDays(7, profile.sessions)
  const maxMin = Math.max(20, ...last7.map((d) => d.minutes))
  const totalMin = profile.sessions.reduce((a, s) => a + s.minutes, 0)
  const totalSessions = profile.sessions.length

  return (
    <div className="h-full bg-sun-soft flex flex-col">
      <TopBar profile={profile} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28 pt-4">
        <h1 className="font-display text-2xl font-extrabold text-cocoa">Jouw voortgang</h1>

        {/* stat cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Streak" value={profile.streak} unit="dgn" icon="🔥" />
          <Stat label="Sessies" value={totalSessions} unit="" icon="☀️" />
          <Stat label="Zontijd" value={totalMin} unit="min" icon="⏱️" />
        </div>

        {/* weekly bar chart */}
        <div className="glass rounded-[2rem] p-5 mt-4">
          <p className="font-display font-bold text-cocoa mb-4">Zontijd deze week</p>
          <div className="flex items-end justify-between gap-2 h-40">
            {last7.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-xl bg-sun-gradient transition-all"
                    style={{ height: `${(d.minutes / maxMin) * 100}%`, minHeight: d.minutes ? 6 : 2 }}
                  />
                </div>
                <span className="text-[11px] text-taupe font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* XP progress */}
        <div className="glass rounded-[2rem] p-5 mt-4">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-cocoa">Level {profile.level}</p>
            <p className="text-sm text-taupe font-semibold">{profile.xp} XP totaal</p>
          </div>
          <p className="text-sm text-taupe mt-1">
            Nog {100 - (profile.xp % 100)} XP tot level {profile.level + 1}
          </p>
        </div>

        {totalSessions === 0 && (
          <p className="text-center text-taupe text-sm mt-6">
            Nog geen sessies. Start je eerste zon-sessie op het Vandaag-tabblad! ☀️
          </p>
        )}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}

function Stat({ label, value, unit, icon }) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <div className="text-xl">{icon}</div>
      <div className="font-display text-2xl font-extrabold text-cocoa leading-tight">{value}</div>
      <div className="text-[11px] text-taupe font-semibold">{unit || label}</div>
    </div>
  )
}

function lastNDays(n, sessions) {
  const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    const minutes = sessions
      .filter((s) => s.date === key)
      .reduce((a, s) => a + s.minutes, 0)
    out.push({ key, label: days[d.getDay()], minutes })
  }
  return out
}
