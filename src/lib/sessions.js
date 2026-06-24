import { safeMinutes } from './uv'

// Session presets. `mult` scales your personal safe-time (which already depends on
// UV + skin type). Types with mult > 1 deliberately push past the safe limit —
// faster colour, but real burn risk.
export const SESSION_TYPES = [
  {
    id: 'maintain',
    name: 'Onderhoud',
    icon: '✨',
    desc: 'Heel kort, alleen je kleur bijhouden',
    mult: 0.35,
    risk: 'laag',
    accent: '#6BCB77',
  },
  {
    id: 'quick',
    name: 'Kort & veilig',
    icon: '⏱️',
    desc: 'Snelle glow, ruim binnen je limiet',
    mult: 0.6,
    risk: 'laag',
    accent: '#6BCB77',
  },
  {
    id: 'balanced',
    name: 'Beste resultaat',
    icon: '☀️',
    desc: 'Optimaal en gelijkmatig bruin, veilig',
    mult: 0.85,
    risk: 'laag',
    accent: '#FF9E5E',
    best: true,
  },
  {
    id: 'deep',
    name: 'Lang & diep',
    icon: '🌅',
    desc: 'Je volledige veilige limiet benutten',
    mult: 1.0,
    risk: 'middel',
    accent: '#FFB347',
  },
  {
    id: 'fast',
    name: 'Snelste resultaat',
    icon: '🔥',
    desc: 'Meer kleur per sessie — voorbij je limiet, risico op verbranden',
    mult: 1.35,
    risk: 'hoog',
    accent: '#FF5E5E',
  },
]

export function sessionType(id) {
  return SESSION_TYPES.find((t) => t.id === id) || SESSION_TYPES[2]
}

// Target minutes for a type, given current UV + skin (rounded, sensible floor).
// Returns 0 when there's no real UV to tan in.
export function targetMinutes(type, skinId, uv, caution = 1) {
  const safe = safeMinutes(skinId, uv, caution)
  if (safe <= 0) return 0
  return Math.max(3, Math.round(safe * type.mult))
}

export const RISK_META = {
  laag: { label: 'Laag risico', color: '#6BCB77' },
  middel: { label: 'Let op', color: '#FFB347' },
  hoog: { label: 'Verbrandingsrisico', color: '#FF5E5E' },
}

// Which preset we recommend for this user right now, and which to discourage.
export function recommendation(skinId, uv) {
  const sensitive = skinId <= 2
  let recommended = 'balanced'
  if (uv >= 9 || (sensitive && uv >= 6)) recommended = 'quick'
  else if (uv < 3) recommended = 'deep'

  // discourage pushing past the limit when UV is high or skin is sensitive
  const discourageFast = uv >= 7 || sensitive
  return { recommended, discourageFast }
}
