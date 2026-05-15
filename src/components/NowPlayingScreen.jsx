import { useRef, useEffect } from 'react'
import { formatMs } from '../utils/spotify'

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
    flexShrink: 0,
    height: '16px',
  },
  headerTitle: {
    color: '#111',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.2px',
  },
  headerIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
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
    padding: '8px',
    gap: '8px',
    minHeight: 0,
    alignItems: 'flex-start',
  },
  art: {
    width: '72px',
    height: '72px',
    objectFit: 'cover',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    flexShrink: 0,
  },
  artPlaceholder: {
    width: '72px',
    height: '72px',
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
    fontSize: '11px',
    fontWeight: 700,
    color: '#111',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  },
  trackArtist: {
    fontSize: '10px',
    color: '#222',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '2px',
    lineHeight: 1.2,
  },
  trackAlbum: {
    fontSize: '10px',
    color: '#222',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '1px',
    lineHeight: 1.2,
  },
  trackNumber: {
    fontSize: '10px',
    color: '#111',
    marginTop: '10px',
    fontVariantNumeric: 'tabular-nums',
  },
  footer: {
    padding: '4px 8px 8px',
    flexShrink: 0,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  timeLabel: {
    fontSize: '9px',
    color: '#111',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    minWidth: '24px',
  },
  timeRight: {
    textAlign: 'right',
  },
  progressTrack: {
    flex: 1,
    height: '5px',
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

export function NowPlayingScreen({ playerState, progressMs, durationMs, progressPct }) {
  const track = playerState?.track_window?.current_track
  const nameScrollRef = useRef(null)

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
  const trackNumber = track?.track_number
  const totalTracks = track?.album?.total_tracks
  const remainingMs = Math.max(0, durationMs - progressMs)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Now Playing</span>
        <div style={styles.headerIcons}>
          <div style={styles.playIcon} />
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
            {track?.artists?.map((a) => a.name).join(', ') ?? 'Connect Spotify'}
          </div>
          {track?.album?.name && <div style={styles.trackAlbum}>{track.album.name}</div>}
          {trackNumber && totalTracks && (
            <div style={styles.trackNumber}>
              {trackNumber} of {totalTracks}
            </div>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.progressRow}>
          <span style={styles.timeLabel}>{formatMs(progressMs)}</span>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
          </div>
          <span style={{ ...styles.timeLabel, ...styles.timeRight }}>
            -{formatMs(remainingMs)}
          </span>
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
