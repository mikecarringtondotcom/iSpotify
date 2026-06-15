import { useEffect, useRef } from 'react'
import { useAudioLevels } from '../hooks/useAudioLevels'
import { BackgroundFlourish } from './BackgroundFlourish'

/**
 * Frutiger Metro–style background: glossy glass bubbles that scale to the music.
 * The audio engine lives in `useAudioLevels`; this file is purely the look,
 * so design away — edit CIRCLES, the gradients, and the per-frame mapping.
 */

// ── Design surface — tweak me! ───────────────────────────────────────────────
// Each ring:
//   x, y       position as % of the viewport
//   size       base outer diameter in px (its size when the music is static)
//   thickness  stroke width of the ring in px
//   band       which audio band drives it (0 = bass … 4 = treble)
//   grow       how much it scales at full level (0.6 = up to +60%)
//   color      ring color        glow: the rgba halo
const CIRCLES = [
  { x: 20 , y: 55, size: 300, thickness: 46, band: 2, grow: 0.55, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 92, y: 38, size: 200, thickness: 20, band: 1, grow: 0.40, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 15, y: 15, size: 380, thickness: 60, band: 0, grow: 0.40, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 78, y: 16, size: 160, thickness: 18, band: 2, grow: 0.90, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 36, y: 8, size: 130, thickness: 24, band: 3, grow: 1.10, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 8, y: 42, size: 65,  thickness: 10, band: 4, grow: 1.30, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 8,  y: 42, size: 120, thickness: 14, band: 2, grow: 1.00, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 28, y: 34, size: 80,  thickness: 45,  band: 4, grow: 1.40, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 15, y: 15, size: 245,  thickness: 10,  band: 4, grow: 0.55, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 92, y: 38, size: 245,  thickness: 10,  band: 2, grow: 0.70, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
  { x: 1, y: 98, size: 650,  thickness: 45,  band: 0, grow: 0.20, color: '#000000', glow: 'rgba(0,0,0,0.45)' },
]
// ─────────────────────────────────────────────────────────────────────────────

// Rings that share a position are concentric (circles inside circles) and must
// drift as one object — so we derive a float "group" per unique x,y and key the
// floating motion off the group instead of the ring index.
const FLOAT_GROUPS = (() => {
  const keyToId = new Map()
  return CIRCLES.map((c) => {
    const key = `${c.x},${c.y}`
    if (!keyToId.has(key)) keyToId.set(key, keyToId.size)
    return keyToId.get(key)
  })
})()

// How much of each ring's `grow` actually gets applied. Lower = gentler swell.
const GROW_STRENGTH = 0.55
// How fast the displayed level chases the synth — small = slow, lazy growth.
const LEVEL_EASE = 0.05
// Gentle "floating in place" drift, in px. Each ring bobs on its own slow path.
const FLOAT_AMP = 9
const FLOAT_SPEED = 1.2

export function AudioBackground({ playerState }) {
  const { bandsRef } = useAudioLevels(playerState)
  const nodeRefs = useRef([])
  // Per-ring eased level so growth glides slowly instead of tracking the synth
  // pulse instantly.
  const levelsRef = useRef(CIRCLES.map(() => 0))

  // One render loop reads the live band levels and maps them onto the circles.
  // This is the bridge between "audio" and "look" — adjust the mapping freely.
  useEffect(() => {
    let raf
    let start
    const render = (now) => {
      if (start === undefined) start = now
      const t = (now - start) / 1000 // seconds, for the floating drift
      const bands = bandsRef.current
      for (let i = 0; i < CIRCLES.length; i++) {
        const node = nodeRefs.current[i]
        if (!node) continue
        const c = CIRCLES[i]
        const target = bands[c.band] || 0 // 0..1

        // Ease toward the target so the swell is slow and soft.
        const level = (levelsRef.current[i] += (target - levelsRef.current[i]) * LEVEL_EASE)

        // Gentle, always-on float — independent of audio. Keyed off the float
        // group so concentric rings drift together as one, while separate
        // clusters still bob on their own phase.
        const g = FLOAT_GROUPS[i]
        const fx = Math.sin(t * FLOAT_SPEED + g * 1.3) * FLOAT_AMP
        const fy = Math.cos(t * FLOAT_SPEED * 0.85 + g * 2.1) * FLOAT_AMP

        const scale = 1 + level * c.grow * GROW_STRENGTH
        node.style.transform = `translate(calc(-50% + ${fx.toFixed(2)}px), calc(-50% + ${fy.toFixed(2)}px)) scale(${scale.toFixed(4)})`
        node.style.opacity = (0.05 + level * 0.95).toFixed(3)
        node.style.boxShadow = `0 0 ${(24 + level * 55).toFixed(1)}px ${c.glow}`
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [bandsRef])

  return (
    <div style={styles.wrap} aria-hidden>
      {CIRCLES.map((c, i) => (
        <div
          key={i}
          ref={(el) => (nodeRefs.current[i] = el)}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            borderRadius: '50%',
            // Hollow ring: transparent center, colored stroke of `thickness` px.
            background: 'transparent',
            border: `${c.thickness}px solid ${c.color}`,
            willChange: 'transform, opacity',
            // transform/opacity/shadow are set every frame in the render loop.
          }}
        />
      ))}
      <BackgroundFlourish playerState={playerState} />
    </div>
  )
}

const styles = {
  wrap: {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
}
