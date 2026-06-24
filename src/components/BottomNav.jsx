import { sound } from '../lib/sound'

const TABS = [
  { id: 'home', label: 'Vandaag', icon: '☀️' },
  { id: 'forecast', label: 'Forecast', icon: '📅' },
  { id: 'progress', label: 'Voortgang', icon: '📈' },
  { id: 'profile', label: 'Profiel', icon: '🏅' },
]

export default function BottomNav({ tab, setTab }) {
  return (
    <div className="absolute bottom-0 inset-x-0 glass border-t px-6 pt-2 pb-5 flex justify-around">
      {TABS.map((t) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            onClick={() => {
              if (t.id !== tab) sound.tap()
              setTab(t.id)
            }}
            className="flex flex-col items-center gap-0.5 w-16 active:scale-95 transition-transform"
          >
            <span className={`text-2xl transition-all ${active ? 'scale-110' : 'opacity-50 grayscale'}`}>
              {t.icon}
            </span>
            <span className={`text-[11px] font-semibold ${active ? 'text-sun-action' : 'text-taupe'}`}>
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
