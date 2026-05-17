import { useRef, useEffect } from 'react'
import { formatMs } from '../utils/spotify'

// Max scroll speed knob — lower = slower. Pixels per second the text travels
// during the scrolling portion of the marquee. Holds at each end stay fixed.
const SCROLL_PX_PER_SECOND = 25
const HOLD_MS = 5000

function useMarqueeScroll(ref, text) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const overflow = el.scrollWidth - el.parentElement.clientWidth
    if (overflow <= 5) return
    const distance = overflow + 10
    const scrollMs = (distance / SCROLL_PX_PER_SECOND) * 1000
    const totalMs = HOLD_MS * 2 + scrollMs
    const holdOffset = HOLD_MS / totalMs
    const animation = el.animate(
      [
        { transform: 'translateX(0)', offset: 0 },
        { transform: 'translateX(0)', offset: holdOffset },
        { transform: `translateX(-${distance}px)`, offset: 1 - holdOffset },
        { transform: `translateX(-${distance}px)`, offset: 1 },
      ],
      { duration: totalMs, iterations: Infinity, easing: 'linear' },
    )
    return () => animation.cancel()
  }, [text])
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, #fdfdfd 0%, #e8eaee 100%)',
    color: '#111',
    fontFamily: 'Helvetica, Arial, sans-serif',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    background: 'linear-gradient(180deg, #f3f4f6 0%, #c8cacd 50%, #b4b6b9 100%)',
    borderBottom: '1px solid rgba(0,0,0,0.35)',
    padding: '2px 5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '24px',
  },
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  headerTitle: {
    color: '#111',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap',
  },
  pomodoroChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 4px',
    height: '14px',
    borderRadius: '7px',
    background: 'rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.25)',
  },
  pomodoroDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.25)',
    flexShrink: 0,
  },
  pomodoroTime: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#111',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTop: '4px solid transparent',
    borderBottom: '4px solid transparent',
    borderLeft: '6px solid #1d6cff',
  },
  body: {
    flex: 1,
    display: 'flex',
    padding: '12px',
    gap: '16px',
    minHeight: 0,
    alignItems: 'center',
  },
  art: {
    width: '115px',
    height: '115px',
    objectFit: 'cover',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    flexShrink: 0,
  },
  artPlaceholder: {
    width: '115px',
    height: '115px',
    background: '#cfd1d4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    color: '#888',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
    paddingTop: '2px',
  },
  trackName: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#111',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  },
  trackArtist: {
    fontSize: '14px',
    color: '#222',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '2px',
    lineHeight: 1.2,
  },
  trackAlbum: {
    fontSize: '14px',
    color: '#222',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '1px',
    lineHeight: 1.2,
  },
  trackNumber: {
    fontSize: '14px',
    color: '#111',
    marginTop: '10px',
    fontVariantNumeric: 'tabular-nums',
  },
  footer: {
    padding: '0 8px 4px',
    flexShrink: 0,
  },
  timesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '3px',
  },
  timeLabel: {
    fontSize: '18px',
    color: '#111',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
  },
  progressTrack: {
    flex: 1,
    height: '18px',
    background: 'linear-gradient(180deg, #d6d8dc, #ecedee)',
    border: '1px solid rgba(0,0,0,0.35)',
    borderRadius: '3px',
    overflow: 'hidden',
    boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.15)',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(180deg, #5aa6ff 0%, #1d6cff 50%, #0d4ec9 100%)',
    transition: 'width 1s linear',
  },
  deviceWarning: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.92)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    zIndex: 10,
    padding: '12px',
  },
  deviceWarningText: {
    color: '#111',
    fontSize: '9px',
    textAlign: 'center',
    lineHeight: 1.5,
  },
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function NowPlayingScreen({ playerState, progressMs, durationMs, progressPct, pomodoro }) {
  const track = playerState?.track_window?.current_track
  const nameScrollRef = useRef(null)
  const artistScrollRef = useRef(null)
  const albumScrollRef = useRef(null)

  const pomodoroActive = !!pomodoro && (pomodoro.running || pomodoro.secondsLeft < pomodoro.phaseTotal)
  const pomodoroDotColor = pomodoro?.phase === 'work'
    ? 'linear-gradient(180deg, #6aa9ff 0%, #2f6bd6 50%, #1f4fb8 100%)'
    : 'linear-gradient(180deg, #6ce06c 0%, #2fa82f 50%, #1f7a1f 100%)'

  const artistText = track?.artists?.map((a) => a.name).join(', ') ?? 'Connect Spotify'
  const albumText = track?.album?.name ?? ''

  useMarqueeScroll(nameScrollRef, track?.name)
  useMarqueeScroll(artistScrollRef, artistText)
  useMarqueeScroll(albumScrollRef, albumText)

  const albumImageUrl = track?.album?.images?.[0]?.url
  const trackNumber = track?.track_number
  const totalTracks = track?.album?.total_tracks
  const remainingMs = Math.max(0, durationMs - progressMs)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerSection}>
          <div style={styles.playIcon} />
        </div>
        <div style={styles.headerSection}>
          <span style={styles.headerTitle}>Now Playing</span>
        </div>
        <div style={styles.headerSection}>
          {pomodoroActive && (
            <span style={styles.pomodoroChip}>
              <span style={{ ...styles.pomodoroDot, background: pomodoroDotColor }} />
              <span style={styles.pomodoroTime}>{formatTimer(pomodoro.secondsLeft)}</span>
            </span>
          )}
          <Battery />
        </div>
      </div>

      <div style={styles.body}>
        {!playerState && (
          <div style={styles.deviceWarning}>
            <p style={styles.deviceWarningText}>
              Press play and resume ur Spotify
            </p>
          </div>
        )}

        {albumImageUrl ? (
          <img src={albumImageUrl} alt="Album art" style={styles.art} />
        ) : (
          <div style={styles.artPlaceholder}>♪</div>
        )}

        <div style={styles.info}>
          <div style={styles.trackName}>
            <span ref={nameScrollRef} style={{ display: 'block', whiteSpace: 'nowrap' }}>
              {track?.name ?? 'No track playing'}
            </span>
          </div>
          <div style={styles.trackArtist}>
            <span ref={artistScrollRef} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {artistText}
            </span>
          </div>
          {track?.album?.name && (
            <div style={styles.trackAlbum}>
              <span ref={albumScrollRef} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                {albumText}
              </span>
            </div>
          )}
          {trackNumber && totalTracks && (
            <div style={styles.trackNumber}>
              {trackNumber} of {totalTracks}
            </div>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>
        <div style={styles.timesRow}>
          <span style={styles.timeLabel}>{formatMs(progressMs)}</span>
          <span style={styles.timeLabel}>-{formatMs(remainingMs)}</span>
        </div>
      </div>
    </div>
  )
}

function Battery() {
  return (
    <div
      style={{
        width: '15px',
        height: '8px',
        border: '1px solid #111',
        borderRadius: '1px',
        position: 'relative',
        background: '#fff',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '1px',
          top: '1px',
          bottom: '1px',
          width: '70%',
          background: 'linear-gradient(180deg, #6ce06c, #2fa82f)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '-3px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '4px',
          background: '#111',
          borderRadius: '0 1px 1px 0',
        }}
      />
    </div>
  )
}
