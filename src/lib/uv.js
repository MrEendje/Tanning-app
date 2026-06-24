// --- Fitzpatrick skin types -------------------------------------------------
export const SKIN_TYPES = [
  { id: 1, label: 'Type I', desc: 'Altijd verbrand, nooit bruin', tint: '#FBE3D2', burnFactor: 67 },
  { id: 2, label: 'Type II', desc: 'Verbrandt snel, bruint moeizaam', tint: '#F3CBA8', burnFactor: 100 },
  { id: 3, label: 'Type III', desc: 'Verbrandt soms, wordt mooi bruin', tint: '#E0A56E', burnFactor: 200 },
  { id: 4, label: 'Type IV', desc: 'Verbrandt zelden, wordt snel bruin', tint: '#C77F4A', burnFactor: 300 },
  { id: 5, label: 'Type V', desc: 'Verbrandt heel zelden, donker bruin', tint: '#9C5A2E', burnFactor: 400 },
  { id: 6, label: 'Type VI', desc: 'Verbrandt nooit, diep donker', tint: '#5E3318', burnFactor: 500 },
]

export function skinType(id) {
  return SKIN_TYPES.find((s) => s.id === id) || SKIN_TYPES[2]
}

// --- UV index helpers -------------------------------------------------------
export function uvColor(uv) {
  if (uv < 3) return '#6BCB77'
  if (uv < 6) return '#FFD93D'
  if (uv < 8) return '#FF9E5E'
  if (uv < 11) return '#FF5E5E'
  return '#B05CFF'
}

export function uvLabel(uv) {
  if (uv < 3) return 'Laag'
  if (uv < 6) return 'Matig'
  if (uv < 8) return 'Hoog'
  if (uv < 11) return 'Zeer hoog'
  return 'Extreem'
}

// Safe tanning time (minutes) before you should cover up / reapply.
// Anchored so Type III @ UV 6 ≈ 33 min — fine for a prototype, not medical advice.
// `caution` (0.7–1.1) is a personal factor that adapts to your burn history.
export function safeMinutes(skinId, uv, caution = 1) {
  if (uv < 1) return 0 // no real UV → you can't tan now
  const factor = skinType(skinId).burnFactor
  return Math.max(5, Math.min(180, Math.round((factor / uv) * caution)))
}

// Advice state used to drive Sunny's mood + colours.
export function adviceFor(uv, minutesLeft) {
  if (uv < 1) return { mood: 'calm', title: 'Geen zon nu', text: 'De UV is laag. Geniet, maar tannen lukt nu niet echt.' }
  if (minutesLeft <= 0) return { mood: 'worried', title: 'Tijd om te schuilen!', text: 'Je veilige limiet is bereikt. Zoek schaduw en smeer bij.' }
  if (uv >= 8) return { mood: 'worried', title: 'UV is hoog!', text: 'Smeer goed in (SPF 30+) en blijf niet te lang in de volle zon.' }
  if (uv >= 6) return { mood: 'wink', title: 'Lekker zonnig', text: 'Mooi tan-weer! Smeer in en hou je tijd in de gaten.' }
  return { mood: 'calm', title: 'Perfect om te tannen', text: 'Rustige UV — ideaal om veilig kleur te krijgen.' }
}

// --- Open-Meteo (free, no API key) ------------------------------------------
export async function fetchUV(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=uv_index,temperature_2m,weather_code&hourly=uv_index&timezone=auto&forecast_days=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error('UV fetch failed')
  const data = await res.json()

  const hours = data.hourly?.uv_index || []
  const times = data.hourly?.time || []
  let bestIdx = 0
  hours.forEach((v, i) => {
    if (v > hours[bestIdx]) bestIdx = i
  })
  const bestTime = times[bestIdx] ? times[bestIdx].slice(11, 16) : null

  return {
    uv: Math.round((data.current?.uv_index ?? 0) * 10) / 10,
    temp: Math.round(data.current?.temperature_2m ?? 0),
    bestTime,
    bestUv: Math.round((hours[bestIdx] ?? 0) * 10) / 10,
  }
}

// Hourly UV for today + a 7-day daily max forecast.
export async function fetchForecast(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=uv_index&daily=uv_index_max&timezone=auto&forecast_days=7`
  const res = await fetch(url)
  if (!res.ok) throw new Error('forecast fetch failed')
  const data = await res.json()

  const today = new Date().toISOString().slice(0, 10)
  const times = data.hourly?.time || []
  const uvs = data.hourly?.uv_index || []
  const todayHourly = times
    .map((t, i) => ({ hour: parseInt(t.slice(11, 13), 10), date: t.slice(0, 10), uv: uvs[i] ?? 0 }))
    .filter((h) => h.date === today)

  const dDates = data.daily?.time || []
  const dMax = data.daily?.uv_index_max || []
  const daily = dDates.map((d, i) => ({ date: d, uvMax: Math.round((dMax[i] ?? 0) * 10) / 10 }))

  return { todayHourly, daily }
}

export function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('no geolocation'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { timeout: 8000 },
    )
  })
}

// Search a city by name (Open-Meteo geocoding, free, no key).
export async function geocodeCity(name) {
  const q = name.trim()
  if (q.length < 2) return []
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}` +
    `&count=6&language=nl&format=json`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return (data.results || []).map((r) => ({
    name: r.name,
    admin: r.admin1 || '',
    country: r.country || '',
    lat: r.latitude,
    lon: r.longitude,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
  }))
}

// Resolve coordinates for the user's chosen location setting.
// manual → stored coords; otherwise fall back to device geolocation.
export async function resolveCoords(location) {
  if (location?.mode === 'manual' && location.lat != null && location.lon != null) {
    return { lat: location.lat, lon: location.lon, name: location.name || 'Gekozen locatie', manual: true }
  }
  const { lat, lon } = await getLocation()
  return { lat, lon, name: 'Jouw locatie', manual: false }
}
