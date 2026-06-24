import { motion } from 'framer-motion'
import { uvColor, uvLabel } from '../lib/uv'

// Circular UV gauge. uv 0..14 mapped onto a 270° arc.
export default function UVGauge({ uv = 0, size = 220 }) {
  const stroke = 16
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const arc = 0.75 // 270 degrees
  const pct = Math.min(uv / 12, 1)
  const color = uvColor(uv)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        {/* track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.45"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * arc} ${circ}`}
        />
        {/* value */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * arc} ${circ}`}
          initial={{ strokeDashoffset: circ * arc }}
          animate={{ strokeDashoffset: circ * arc * (1 - pct) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-extrabold text-cocoa leading-none">
          {uv.toFixed(uv % 1 === 0 ? 0 : 1)}
        </span>
        <span className="text-xs font-semibold tracking-wider text-taupe mt-1">UV-INDEX</span>
        <span
          className="mt-2 rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {uvLabel(uv)}
        </span>
      </div>
    </div>
  )
}
