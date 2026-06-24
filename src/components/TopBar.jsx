import { XP_PER_LEVEL } from '../lib/store'

export default function TopBar({ profile }) {
  const intoLevel = profile.xp % XP_PER_LEVEL
  const pct = (intoLevel / XP_PER_LEVEL) * 100

  return (
    <div className="flex items-center gap-3 px-5 pt-3">
      <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 shadow-sm">
        <span className="text-lg">🔥</span>
        <span className="font-display font-bold text-cocoa">{profile.streak}</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-taupe">Level {profile.level}</span>
          <span className="text-xs font-semibold text-taupe">{intoLevel}/{XP_PER_LEVEL} XP</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full rounded-full bg-sun-gradient transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
