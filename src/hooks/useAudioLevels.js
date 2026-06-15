import { useRef, useEffect } from 'react'

// Number of frequency "bands" the visuals can react to.
// Index 0 ≈ bass (slow, punchy) … last index ≈ treble (fast, shimmery).
// Each value the engine produces is normalized to 0..1.
export const BAND_COUNT = 5

/**
 * Produces a live, smoothed array of audio "band" levels (0..1) that you can
 * drive a visualization from. Read it every frame via `bandsRef.current`.
 *
 * ── Why this is synthesized ──────────────────────────────────────────────────
 * Spotify's Web Playback SDK plays DRM-protected (EME) audio, so the browser
 * won't route that audio into the Web Audio API. The Audio Analysis API (real
 * beats) is also deprecated for apps created after 2024-11-27, which this app
 * is — so it returns 403. Both real-audio routes are off the table, so the
 * bands are driven by a gentle, fake-but-musical pulse while a track is playing
 * and ease back to a still image when paused/stopped.
 *
 * @param {object|null} playerState - Spotify Web Playback SDK state object.
 */
export function useAudioLevels(playerState) {
  const bandsRef = useRef(new Float32Array(BAND_COUNT))
  const energyRef = useRef(0) // 0 = silent/static, 1 = full energy

  const isPlaying = Boolean(playerState && !playerState.paused)
  const playingRef = useRef(isPlaying)
  useEffect(() => {
    playingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    let raf
    let start

    const tick = (now) => {
      if (start === undefined) start = now
      const t = (now - start) / 1000 // seconds since mount

      // Ease overall energy toward 1 while playing, 0 while paused. This is what
      // makes the background settle into a still image when nothing is playing.
      const target = playingRef.current ? 1 : 0
      energyRef.current += (target - energyRef.current) * 0.06

      const bands = bandsRef.current
      for (let i = 0; i < BAND_COUNT; i++) {
        bands[i] = synthBand(i, t) * energyRef.current
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return { bandsRef, isPlaying }
}

// ── Synthetic signal ─────────────────────────────────────────────────────────
// A fake-but-musical pulse per band. Tuned slow & gentle so the circles swell
// softly rather than strobe.
function synthBand(i, t) {
  // Lower bands are slower & punchier; higher bands flutter faster — but the
  // whole set is kept slow so growth reads as a lazy breath, not a beat.
  const tempo = 0.95 + i * 0.5 // "pulses" per second for this band
  const phase = i * 1.7

  // A softly sharpened sine reads as a swell rather than a hard kick.
  const base = Math.sin(t * tempo * Math.PI * 2 + phase)
  const pulse = Math.pow((base + 1) / 2, 2) // 0..1, gently peaky

  // A slow swell so repeated loops don't feel identical.
  const swell = 0.6 + 0.4 * Math.sin(t * 0.3 + i)

  return Math.min(1, pulse * swell)
}
