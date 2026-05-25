export const MENU_ITEMS = [
  { id: 'playlists',   label: 'Playlists',     enabled: true,  showChevron: true  },
  { id: 'liked_songs', label: 'Liked Songs',   enabled: true,  showChevron: true  },
  { id: 'photos',      label: 'Photos',        enabled: true,  showChevron: true  },
  { id: 'extras',      label: 'Extras',        enabled: true,  showChevron: true  },
  { id: 'settings',    label: 'Settings',      enabled: true, showChevron: true  },
  { id: 'shuffle',     label: 'Shuffle Songs', enabled: true,  showChevron: false },
]

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
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 10px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#111',
    cursor: 'pointer',
    userSelect: 'none',
  },
  rowSelected: {
    background: 'linear-gradient(180deg, #6aa9ff 0%, #2f6bd6 50%, #1f4fb8 100%)',
    color: '#fff',
    textShadow: '0 1px 0 rgba(0,0,0,0.25)',
  },
  rowDisabled: {
    color: '#9aa0a6',
    cursor: 'default',
  },
  chevron: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1,
  },
}

export function MenuScreen({ selectedIndex, onSelect, onActivate, shuffleOn = false }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>iPod</span>
      </div>

      <div style={styles.list}>
        {MENU_ITEMS.map((item, i) => {
          const isSelected = i === selectedIndex
          const looksActive = item.id === 'shuffle' ? shuffleOn : item.enabled
          const rowStyle = {
            ...styles.row,
            ...(isSelected ? styles.rowSelected : null),
            ...(!looksActive && !isSelected ? styles.rowDisabled : null),
          }
          return (
            <div
              key={item.id}
              style={rowStyle}
              onMouseEnter={() => onSelect?.(i)}
              onClick={() => onActivate?.(i)}
            >
              <span>{item.label}</span>
              {item.showChevron && <span style={styles.chevron}>{'>'}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
