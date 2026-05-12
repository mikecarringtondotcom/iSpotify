import { useRef, useEffect } from 'react'
import { formatMs } from '../utils/spotify'

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#000',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(180deg, #1c1c1c, #111)',
    padding: '6px 10px 5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.3px',
    textAlign: 'center',
    flex: 1,
  },
  battery: {
    width: '14px',
    height: '7px',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '2px',
    position: 'relative',
  },
  artContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    background: '#0a0a0a',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 0,
  },
  artBg: {
    position: 'absolute',
    inset: '-10px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(20px) saturate(1.5)',
    opacity: 0.25,
    transition: 'background-image 0.5s',
  },
  art: {
    width: '110px',
    height: '110px',
    borderRadius: '8px',
    objectFit: 'cover',
    boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
    position: 'relative',
    zIndex: 1,
  },
  artPlaceholder: {
    width: '110px',
    height: '110px',
    borderRadius: '8px',
    background: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    color: '#444',
    position: 'relative',
    zIndex: 1,
  },
  trackInfo: {
    background: 'linear-gradient(0deg, #111, #0d0d0d)',
    padding: '8px 10px 6px',
    flexShrink: 0,
  },
  trackName: {
    color: '#fff',
    fontSize: '11px',
    fontWeight: 600,
    overflow: 'hidden',
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap',
  },
  trackArtist: {
    color: '#888',
    fontSize: '9px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '1px',
  },
  progressWrap: {
    height: '2px',
    background: '#333',
    borderRadius: '1px',
    marginTop: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #1db954, #21d65b)',
    borderRadius: '1px',
    transition: 'width 1s linear',
  },
  timeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '2px',
  },
  timeLabel: {
    color: '#555',
    fontSize: '7px',
    fontVariantNumeric: 'tabular-nums',
  },
  deviceWarning: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    zIndex: 10,
    padding: '12px',
    borderRadius: '12px',
  },
  deviceWarningText: {
    color: '#fff',
    fontSize: '9px',
    textAlign: 'center',
    lineHeight: 1.5,
  },
}

export function NowPlayingScreen({ playerState, progressMs, durationMs, progressPct }) {
  const track = playerState?.track_window?.current_track
  const isPlaying = playerState && !playerState.paused
  const nameScrollRef = useRef(null)

  // Enable CSS scroll animation if text overflows
  useEffect(() => {
    const el = nameScrollRef.current
    if (!el) return
    const overflow = el.scrollWidth - el.parentElement.clientWidth
    if (overflow > 5) {
      el.style.setProperty('--scroll-dist', `-${overflow + 10}px`)
      el.style.animation = 'scrollText 4s ease-in-out infinite alternate'
    } else {
      el.style.animation = 'none'
    }
  }, [track?.name])

  const albumImageUrl = track?.album?.images?.[0]?.url

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ width: '30px' }} />
        <span style={styles.headerTitle}>Now Playing</span>
        <Battery />
      </div>

      <div style={styles.artContainer}>
        {albumImageUrl && (
          <div
            style={{ ...styles.artBg, backgroundImage: `url(${albumImageUrl})` }}
          />
        )}

        {!playerState && (
          <div style={styles.deviceWarning}>
            <span style={{ fontSize: '20px' }}>📱</span>
            <p style={styles.deviceWarningText}>
              Open Spotify on any device and start playing, then press play here.
            </p>
          </div>
        )}

        {albumImageUrl ? (
          <img
            src={albumImageUrl}
            alt="Album art"
            style={{
              ...styles.art,
              animation: isPlaying ? 'albumPulse 2s ease-in-out infinite' : 'none',
            }}
          />
        ) : (
          <div style={styles.artPlaceholder}>♪</div>
        )}
      </div>

      <div style={styles.trackInfo}>
        <div style={styles.trackName}>
          <span ref={nameScrollRef} style={{ display: 'block', whiteSpace: 'nowrap' }}>
            {track?.name ?? 'No track playing'}
          </span>
        </div>

        <div style={styles.trackArtist}>
          {track?.artists?.map((a) => a.name).join(', ') ?? 'Connect Spotify to begin'}
        </div>

        <div style={styles.progressWrap}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>

        <div style={styles.timeRow}>
          <span style={styles.timeLabel}>{formatMs(progressMs)}</span>
          <span style={styles.timeLabel}>{formatMs(durationMs)}</span>
        </div>
      </div>
    </div>
  )
}

function Battery() {
  return (
    <div style={styles.battery}>
      <div
        style={{
          position: 'absolute',
          left: '1px',
          top: '1px',
          bottom: '1px',
          width: '70%',
          background: '#4cd964',
          borderRadius: '1px',
        }}
      />
      {/* Nub */}
      <div
        style={{
          position: 'absolute',
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2px',
          height: '4px',
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '0 1px 1px 0',
        }}
      />
    </div>
  )
}
