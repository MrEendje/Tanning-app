// Minimalistic UI sound engine — synthesised with the Web Audio API.
// No audio files: every sound is generated, so it stays tiny and crisp.

let ctx = null
let master = null
let enabled = true

function ensureCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 1.0
    master.connect(ctx.destination)
  }
  // browsers suspend audio until a user gesture
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setSoundEnabled(v) {
  enabled = v
}
export function isSoundEnabled() {
  return enabled
}

// One soft sine/triangle blip with a smooth attack + exponential decay.
function tone({ freq = 880, dur = 0.12, type = 'sine', gain = 0.25, delay = 0, glide = 0 }) {
  const c = ensureCtx()
  if (!c) return
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (glide) osc.frequency.exponentialRampToValueAtTime(freq * glide, t0 + dur)

  // gentle envelope — no clicks
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

// Public sound palette ------------------------------------------------------
export const sound = {
  // soft, neutral tap for most buttons
  tap() {
    if (!enabled) return
    tone({ freq: 660, dur: 0.07, type: 'sine', gain: 0.18, glide: 1.4 })
  },
  // selecting an option / toggle on
  select() {
    if (!enabled) return
    tone({ freq: 523.25, dur: 0.09, type: 'triangle', gain: 0.2 })
    tone({ freq: 783.99, dur: 0.1, type: 'triangle', gain: 0.16, delay: 0.05 })
  },
  // moving forward / next step
  swoosh() {
    if (!enabled) return
    tone({ freq: 400, dur: 0.16, type: 'sine', gain: 0.16, glide: 2.2 })
  },
  // back / cancel
  back() {
    if (!enabled) return
    tone({ freq: 500, dur: 0.14, type: 'sine', gain: 0.15, glide: 0.6 })
  },
  // a positive confirmation (session start)
  start() {
    if (!enabled) return
    ;[523.25, 659.25].forEach((f, i) =>
      tone({ freq: f, dur: 0.14, type: 'triangle', gain: 0.18, delay: i * 0.08 }),
    )
  },
  // gentle reminder ping (flip / sunscreen)
  ping() {
    if (!enabled) return
    tone({ freq: 880, dur: 0.18, type: 'sine', gain: 0.22 })
    tone({ freq: 1318.5, dur: 0.16, type: 'sine', gain: 0.12, delay: 0.04 })
  },
  // warning (shade / over limit)
  warn() {
    if (!enabled) return
    tone({ freq: 340, dur: 0.18, type: 'sawtooth', gain: 0.12 })
    tone({ freq: 300, dur: 0.2, type: 'sawtooth', gain: 0.12, delay: 0.16 })
  },
  // success arpeggio (finishing a step)
  success() {
    if (!enabled) return
    ;[523.25, 659.25, 783.99].forEach((f, i) =>
      tone({ freq: f, dur: 0.16, type: 'triangle', gain: 0.18, delay: i * 0.07 }),
    )
  },
  // big celebration (reward / badge)
  reward() {
    if (!enabled) return
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone({ freq: f, dur: 0.22, type: 'triangle', gain: 0.2, delay: i * 0.09 }),
    )
    tone({ freq: 1567.98, dur: 0.3, type: 'sine', gain: 0.1, delay: 0.4 })
  },
}
