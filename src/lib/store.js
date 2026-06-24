import { useState, useEffect, useCallback } from 'react'

const KEY = 'sunny.profile.v1'

export const defaultProfile = {
  onboarded: false,
  sound: true,
  skinId: 3,
  goal: 'glow',
  caution: 1, // adapts to burn history: <1 = more careful
  xp: 0,
  level: 1,
  streak: 0,
  burns: 0, // how often the user pushed into the burn zone
  lastSessionDate: null,
  lastSessionEnd: null, // timestamp (ms) — drives the aftercare reminder
  selfTan: { lastApplied: null }, // self-tanner / tanning spray log (ms timestamp)
  sessions: [], // { date, minutes, uv, burned }
  badges: [], // ids
}

// Adapt the personal caution factor after a session.
// Burning makes Sunny more careful; clean sessions slowly relax it back toward 1.
export function nextCaution(profile, burned) {
  const c = profile.caution ?? 1
  if (burned) return Math.max(0.7, Math.round((c - 0.06) * 100) / 100)
  return Math.min(1, Math.round((c + 0.02) * 100) / 100)
}

export const XP_PER_LEVEL = 100

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultProfile }
    return { ...defaultProfile, ...JSON.parse(raw) }
  } catch {
    return { ...defaultProfile }
  }
}

export function useProfile() {
  const [profile, setProfile] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(profile))
  }, [profile])

  const update = useCallback((patch) => {
    setProfile((p) => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) }))
  }, [])

  const addXp = useCallback((amount) => {
    setProfile((p) => {
      const xp = p.xp + amount
      const level = Math.floor(xp / XP_PER_LEVEL) + 1
      return { ...p, xp, level }
    })
  }, [])

  const reset = useCallback(() => setProfile({ ...defaultProfile }), [])

  return { profile, update, addXp, reset }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// Record a finished session: streak, sessions log, badges, adaptive caution.
// `burned` = the user went past their safe budget. Returns earned badge ids.
export function completeSession(profile, minutes, uv, burned = false) {
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let streak = profile.streak
  if (profile.lastSessionDate === today) {
    // already tanned today, keep streak
  } else if (profile.lastSessionDate === yesterday) {
    streak += 1
  } else {
    streak = 1
  }

  const sessions = [...profile.sessions, { date: today, minutes, uv, burned }].slice(-60)
  const caution = nextCaution(profile, burned)

  const earned = []
  const has = (id) => profile.badges.includes(id) || earned.includes(id)
  if (sessions.length >= 1 && !has('first')) earned.push('first')
  if (streak >= 3 && !has('streak3')) earned.push('streak3')
  if (streak >= 7 && !has('streak7')) earned.push('streak7')
  if (sessions.length >= 10 && !has('ten')) earned.push('ten')
  // "Altijd ingesmeerd" — 5 sessions in a row without burning
  const recentClean = sessions.slice(-5)
  if (recentClean.length >= 5 && recentClean.every((s) => !s.burned) && !has('smart'))
    earned.push('smart')

  return {
    patch: {
      streak,
      caution,
      burns: (profile.burns || 0) + (burned ? 1 : 0),
      lastSessionDate: today,
      lastSessionEnd: Date.now(),
      sessions,
      badges: [...profile.badges, ...earned],
    },
    earned,
  }
}

export const BADGES = {
  first: { icon: '🌱', name: 'Eerste sessie', desc: 'Je allereerste zon-sessie voltooid' },
  streak3: { icon: '🔥', name: '3-dagen streak', desc: '3 dagen op rij veilig getand' },
  streak7: { icon: '⭐', name: '7-dagen streak', desc: 'Een hele week volgehouden' },
  ten: { icon: '🏆', name: '10 sessies', desc: '10 zon-sessies voltooid' },
  smart: { icon: '🧴', name: 'Altijd ingesmeerd', desc: 'Nooit je smeer-reminder gemist' },
  even: { icon: '🔄', name: 'Gelijkmatig bruin', desc: 'Netjes omgedraaid elke sessie' },
}
