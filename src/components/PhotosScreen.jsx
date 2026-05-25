import { useEffect, useRef, useState } from 'react'

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
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.2px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '90%',
  },
  grid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridAutoRows: '1fr',
    gap: '2px',
    padding: '3px',
    background: '#fff',
    overflowY: 'auto',
    overflowX: 'hidden',
    alignContent: 'start',
  },
  cell: {
    position: 'relative',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#e6e7ea',
    border: '1px solid rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
  },
  cellSelected: {
    border: '2px solid #2f6bd6',
    boxShadow: '0 0 0 1px #fff inset, 0 0 4px rgba(47,107,214,0.5)',
  },
  thumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    pointerEvents: 'none',
    userSelect: 'none',
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
    lineHeight: 1.4,
  },
  viewStage: {
    flex: 1,
    position: 'relative',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'cover',
    display: 'block',
    userSelect: 'none',
  },
  counter: {
    position: 'absolute',
    top: '4px',
    right: '6px',
    background: 'rgba(0,0,0,0.55)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: '3px',
    letterSpacing: '0.3px',
  },
}

function normalizeEntry(entry, index) {
  if (typeof entry === 'string') {
    return {
      id: `p${index}`,
      src: `/photos/${entry}`,
      title: entry.replace(/\.[^.]+$/, ''),
    }
  }
  const file = entry.file ?? entry.src ?? ''
  const src = entry.src ?? `/photos/${entry.file ?? ''}`
  const title = entry.title ?? file.replace(/^.*\//, '').replace(/\.[^.]+$/, '')
  return { id: entry.id ?? `p${index}`, src, title }
}

export function PhotosScreen({
  mode = 'grid',
  selectedIndex = 0,
  onSelect,
  onActivate,
  onLoaded,
}) {
  const [photos, setPhotos] = useState(null)
  const [error, setError] = useState(null)
  const selectedRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch('/photos/manifest.json', { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(`Manifest not found (${r.status})`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        const raw = Array.isArray(data) ? data : Array.isArray(data?.photos) ? data.photos : []
        const list = raw.map(normalizeEntry)
        setPhotos(list)
        onLoaded?.(list)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message ?? 'Failed to load photos')
        setPhotos([])
        onLoaded?.([])
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (mode !== 'grid') return
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex, mode, photos])

  if (mode === 'view') {
    const photo = photos?.[selectedIndex]
    const title = photo?.title || 'Photo'
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>{title}</span>
        </div>
        <div style={styles.viewStage}>
          {photo && (
            <img
              key={photo.id}
              src={photo.src}
              alt={photo.title}
              style={styles.fullImg}
              draggable={false}
            />
          )}
          {photos?.length > 0 && (
            <div style={styles.counter}>
              {selectedIndex + 1} / {photos.length}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Photos</span>
      </div>

      {photos === null && <div style={styles.status}>Loading photos…</div>}

      {photos?.length === 0 && (
        <div style={styles.status}>
          {error ? error : 'Where did the pictures go brah?'}
        </div>
      )}

      {photos?.length > 0 && (
        <div style={styles.grid}>
          {photos.map((p, i) => {
            const isSelected = i === selectedIndex
            const cellStyle = {
              ...styles.cell,
              ...(isSelected ? styles.cellSelected : null),
            }
            return (
              <div
                key={p.id}
                ref={isSelected ? selectedRef : null}
                style={cellStyle}
                onMouseEnter={() => onSelect?.(i)}
                onClick={() => onActivate?.(i)}
              >
                <img src={p.src} alt={p.title} style={styles.thumb} draggable={false} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
