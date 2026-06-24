import { useState } from 'react'
import { motion } from 'framer-motion'
import { SKIN_TYPES, skinType, geocodeCity } from '../lib/uv'
import { sound } from '../lib/sound'

const GOALS = [
  { id: 'glow', icon: '🌞', t: 'Mooie glow', d: 'Rustig en gelijkmatig kleur krijgen' },
  { id: 'base', icon: '🏖️', t: 'Base tan opbouwen', d: 'Voorbereiden op vakantie' },
  { id: 'maintain', icon: '✨', t: 'Onderhouden', d: 'Mijn kleur vasthouden' },
]

export default function Settings({ profile, update, onClose }) {
  const loc = profile.location || { mode: 'auto' }
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  async function search(e) {
    e.preventDefault()
    if (query.trim().length < 2) return
    setSearching(true)
    try {
      setResults(await geocodeCity(query))
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  function pickCity(r) {
    sound.select()
    update({ location: { mode: 'manual', lat: r.lat, lon: r.lon, name: r.label } })
    setResults([])
    setQuery('')
  }

  function useAuto() {
    sound.select()
    update({ location: { mode: 'auto', lat: null, lon: null, name: '' } })
    setResults([])
    setQuery('')
  }

  const st = skinType(profile.skinId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream rounded-[2rem] p-6 w-full max-h-[90%] overflow-y-auto no-scrollbar shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-cocoa">⚙️ Instellingen</h2>
          <button onClick={onClose} className="text-2xl text-taupe active:scale-90 transition">
            ✕
          </button>
        </div>

        {/* skin type */}
        <p className="font-display font-bold text-cocoa mt-5 mb-2">Huidtype</p>
        <div className="grid grid-cols-6 gap-2">
          {SKIN_TYPES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sound.select()
                update({ skinId: s.id })
              }}
              className={`aspect-square rounded-xl border-4 transition-all ${
                profile.skinId === s.id ? 'border-sun-action scale-105' : 'border-white/60'
              }`}
              style={{ backgroundColor: s.tint }}
            />
          ))}
        </div>
        <p className="text-xs text-taupe mt-2">
          {st.label} · {st.desc.toLowerCase()}
        </p>

        {/* goal */}
        <p className="font-display font-bold text-cocoa mt-5 mb-2">Doel</p>
        <div className="flex flex-col gap-2">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                sound.select()
                update({ goal: g.id })
              }}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left border-2 transition ${
                profile.goal === g.id ? 'border-sun-action bg-white' : 'border-transparent bg-white/70'
              }`}
            >
              <span className="text-2xl">{g.icon}</span>
              <span>
                <span className="block font-display font-bold text-cocoa text-sm">{g.t}</span>
                <span className="block text-xs text-taupe">{g.d}</span>
              </span>
            </button>
          ))}
        </div>

        {/* location */}
        <p className="font-display font-bold text-cocoa mt-5 mb-2">Locatie</p>
        <div className="flex gap-2">
          <button
            onClick={useAuto}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold border-2 transition ${
              loc.mode === 'auto' ? 'border-sun-action bg-white text-cocoa' : 'border-transparent bg-white/70 text-taupe'
            }`}
          >
            📍 Automatisch (GPS)
          </button>
          <button
            onClick={() => {
              sound.tap()
              update({ location: { ...loc, mode: 'manual' } })
            }}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold border-2 transition ${
              loc.mode === 'manual' ? 'border-sun-action bg-white text-cocoa' : 'border-transparent bg-white/70 text-taupe'
            }`}
          >
            ✏️ Handmatig
          </button>
        </div>

        {loc.mode === 'manual' && (
          <div className="mt-3">
            {loc.name && (
              <p className="text-sm text-cocoa font-semibold mb-2">
                Gekozen: <span className="text-sun-action">{loc.name}</span>
              </p>
            )}
            <form onSubmit={search} className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek een stad…"
                className="flex-1 rounded-2xl bg-white/80 border border-white px-4 py-3 text-cocoa
                  font-semibold outline-none focus:border-sun-action transition text-sm"
              />
              <button type="submit" className="rounded-2xl bg-sun-action text-white font-bold px-4 active:scale-95 transition">
                Zoek
              </button>
            </form>
            {searching && <p className="text-xs text-taupe mt-2">Zoeken…</p>}
            <div className="flex flex-col gap-1 mt-2">
              {results.map((r) => (
                <button
                  key={`${r.lat},${r.lon}`}
                  onClick={() => pickCity(r)}
                  className="text-left rounded-xl bg-white/70 px-4 py-2.5 text-sm text-cocoa font-semibold
                    active:scale-[0.99] transition"
                >
                  📍 {r.label}
                </button>
              ))}
            </div>
            {loc.mode === 'manual' && !loc.name && results.length === 0 && !searching && (
              <p className="text-xs text-taupe mt-2">
                Zoek je stad en kies 'm — handig als je je locatie niet wilt delen.
              </p>
            )}
          </div>
        )}

        <button onClick={onClose} className="btn-primary w-full mt-6">
          Klaar
        </button>
      </motion.div>
    </motion.div>
  )
}
