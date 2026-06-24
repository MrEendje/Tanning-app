import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import Sunny from '../components/Sunny'
import { BADGES } from '../lib/store'
import { skinType } from '../lib/uv'

const GOALS = {
  glow: 'Mooie glow',
  base: 'Base tan opbouwen',
  maintain: 'Onderhouden',
}

export default function Profile({ profile, tab, setTab, onReset, onToggleSound }) {
  const soundOn = profile.sound !== false
  const st = skinType(profile.skinId)
  const allBadges = Object.keys(BADGES)

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

        <button
          onClick={onReset}
          className="w-full text-center text-taupe text-sm mt-8 font-semibold underline"
        >
          Profiel resetten (opnieuw onboarden)
        </button>
      </div>
      <BottomNav tab={tab} setTab={setTab} />
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
