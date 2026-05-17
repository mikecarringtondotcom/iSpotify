import { useEffect, useRef, useState } from 'react'
import { fetchLikedSongs } from '../utils/spotify'

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    color: '#111',
    fontFamily: 'Helvetica, Arial, sans-serif',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(180deg, #f3f4f6 0%, #c8cacd 50%, #b4b6b9 100%)',
    borderBottom: '1px solid rgba(0,0,0,0.35)',
    padding: '2px 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    height: '24px',
  },
  headerTitle: {
    color: '#111',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.2px',
  },
  list: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    padding: '3px 10px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  rowSelected: {
    background: 'linear-gradient(180deg, #6aa9ff 0%, #2f6bd6 50%, #1f4fb8 100%)',
    color: '#fff',
    textShadow: '0 1px 0 rgba(0,0,0,0.25)',
  },
  trackName: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'inherit',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    lineHeight: 1.1,
  },
  trackArtist: {
    fontSize: '10px',
    color: 'inherit',
    opacity: 0.75,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    lineHeight: 1.1,
  },
  status: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#444',
    padding: '12px',
    textAlign: 'center',
  },
}

export function LikedSongsScreen({
  accessToken,
  selectedIndex,
  onSelect,
  onActivate,
  onLoaded,
  onScopeError,
}) {
  const [tracks, setTracks] = useState(null)
  const [error, setError] = useState(null)
  const selectedRowRef = useRef(null)

  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    fetchLikedSongs(accessToken)
      .then((items) => {
        if (cancelled) return
        setTracks(items)
        onLoaded?.(items)
      })
      .catch((e) => {
        if (cancelled) return
        if (e.status === 403 || e.status === 401) {
          onScopeError?.(e.status)
          setError('Re-login required to grant library access.')
        } else {
          setError(e.message ?? 'Failed to load liked songs')
        }
      })
    return () => { cancelled = true }
  }, [accessToken])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Liked Songs</span>
      </div>

      <div style={styles.list}>
        {error && <div style={styles.status}>{error}</div>}
        {!error && tracks === null && (
          <div style={styles.status}>Loading liked songs…</div>
        )}
        {!error && tracks?.length === 0 && (
          <div style={styles.status}>No liked songs found.</div>
        )}
        {!error && tracks?.map((t, i) => {
          const isSelected = i === selectedIndex
          const rowStyle = { ...styles.row, ...(isSelected ? styles.rowSelected : null) }
          const artistText = t.artists?.map((a) => a.name).join(', ') ?? ''
          return (
            <div
              key={`${t.id}-${i}`}
              ref={isSelected ? selectedRowRef : null}
              style={rowStyle}
              onMouseEnter={() => onSelect?.(i)}
              onClick={() => onActivate?.(i)}
            >
              <span style={styles.trackName}>{t.name}</span>
              {artistText && <span style={styles.trackArtist}>{artistText}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
