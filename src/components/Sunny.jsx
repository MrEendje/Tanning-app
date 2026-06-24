import { motion } from 'framer-motion'

// Sunny the mascotte. mood: 'calm' | 'wink' | 'worried' | 'happy'
export default function Sunny({ mood = 'calm', size = 96 }) {
  const moods = {
    calm: '#FFC85E',
    happy: '#FFD06B',
    wink: '#FFB347',
    worried: '#FF7A5E',
  }
  const color = moods[mood] || moods.calm

  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs>
          <radialGradient id="sunnyBody" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFE7A8" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>

        {/* rays */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '60px 60px' }}
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180
            const x1 = 60 + Math.cos(a) * 44
            const y1 = 60 + Math.sin(a) * 44
            const x2 = 60 + Math.cos(a) * 56
            const y2 = 60 + Math.sin(a) * 56
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
        </motion.g>

        {/* body */}
        <circle cx="60" cy="60" r="38" fill="url(#sunnyBody)" />

        {/* cheeks */}
        <circle cx="44" cy="66" r="5" fill="#FF9E8E" opacity="0.6" />
        <circle cx="76" cy="66" r="5" fill="#FF9E8E" opacity="0.6" />

        {/* eyes */}
        {mood === 'wink' ? (
          <>
            <path d="M40 54 q5 -6 10 0" stroke="#3A2A20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="75" cy="54" r="4.5" fill="#3A2A20" />
          </>
        ) : mood === 'worried' ? (
          <>
            <circle cx="46" cy="55" r="4.5" fill="#3A2A20" />
            <circle cx="74" cy="55" r="4.5" fill="#3A2A20" />
            <path d="M38 47 l10 4" stroke="#3A2A20" strokeWidth="3" strokeLinecap="round" />
            <path d="M82 47 l-10 4" stroke="#3A2A20" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="46" cy="54" r="4.5" fill="#3A2A20" />
            <circle cx="74" cy="54" r="4.5" fill="#3A2A20" />
          </>
        )}

        {/* mouth */}
        {mood === 'worried' ? (
          <path d="M50 78 q10 -8 20 0" stroke="#3A2A20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M48 72 q12 12 24 0" stroke="#3A2A20" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </motion.div>
  )
}
