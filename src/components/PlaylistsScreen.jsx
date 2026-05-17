import { useEffect, useRef, useState } from 'react'
import { fetchUserPlaylists } from '../utils/spotify'

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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    fontSize: '14px',
    fontWeight: 700,
    color: '#111',
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: '20px',
  },
  rowSelected: {
    background: 'linear-gradient(180deg, #6aa9ff 0%, #2f6bd6 50%, #1f4fb8 100%)',
    color: '#fff',
    textShadow: '0 1px 0 rgba(0,0,0,0.25)',
  },
  rowLabel: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    flex: 1,
    marginRight: '6px',
  },
  chevron: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1,
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

export function PlaylistsScreen({
  accessToken,
  selectedIndex,
  onSelect,
  onActivate,
  onLoaded,
  onScopeError,
}) {
  const [playlists, setPlaylists] = useState(null)
  const [error, setError] = useState(null)
  const selectedRowRef = useRef(null)

  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    fetchUserPlaylists(accessToken)
      .then((items) => {
        if (cancelled) return
        setPlaylists(items)
        onLoaded?.(items)
      })
      .catch((e) => {
        if (cancelled) return
        if (e.status === 403 || e.status === 401) {
          onScopeError?.(e.status)
          setError('Re-login required to grant playlist access.')
        } else {
          setError(e.message ?? 'Failed to load playlists')
        }
      })
    return () => { cancelled = true }
  }, [accessToken])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Playlists</span>
      </div>

      <div style={styles.list}>
        {error && <div style={styles.status}>{error}</div>}
        {!error && playlists === null && (
          <div style={styles.status}>Loading playlists…</div>
        )}
        {!error && playlists?.length === 0 && (
          <div style={styles.status}>No playlists found.</div>
        )}
        {!error && playlists?.map((p, i) => {
          const isSelected = i === selectedIndex
          const rowStyle = { ...styles.row, ...(isSelected ? styles.rowSelected : null) }
          return (
            <div
              key={p.id}
              ref={isSelected ? selectedRowRef : null}
              style={rowStyle}
              onMouseEnter={() => onSelect?.(i)}
              onClick={() => onActivate?.(i)}
            >
              <span style={styles.rowLabel}>{p.name}</span>
              <span style={styles.chevron}>{'>'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
