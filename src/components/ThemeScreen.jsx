export const THEME_ITEMS = [
  { id: 'blue',   label: 'Blue',   swatch: '#0E94DD' },
  { id: 'orange', label: 'Orange', swatch: '#F9B51B' },
  { id: 'pink',   label: 'Pink',   swatch: '#E85297' },
  { id: 'green',  label: 'Green',  swatch: '#9FCB3D' },
  { id: 'gray',   label: 'Gray',   swatch: '#c0c2c4' },

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
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  swatch: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '1px solid rgba(0,0,0,0.35)',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5)',
    flexShrink: 0,
  },
  check: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1,
  },
}

export function ThemeScreen({ selectedIndex, activeTheme, onSelect, onActivate }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Theme</span>
      </div>

      <div style={styles.list}>
        {THEME_ITEMS.map((item, i) => {
          const isSelected = i === selectedIndex
          const isActive = item.id === activeTheme
          const rowStyle = {
            ...styles.row,
            ...(isSelected ? styles.rowSelected : null),
          }
          return (
            <div
              key={item.id}
              style={rowStyle}
              onMouseEnter={() => onSelect?.(i)}
              onClick={() => onActivate?.(i)}
            >
              <span style={styles.left}>
                <span style={{ ...styles.swatch, background: item.swatch }} />
                <span>{item.label}</span>
              </span>
              {isActive && <span style={styles.check}>{'✓'}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
