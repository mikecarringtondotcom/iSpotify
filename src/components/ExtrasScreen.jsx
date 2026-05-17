export const EXTRAS_ITEMS = [
  { id: 'pomodoro', label: 'Pomodoro' },
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
  chevron: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1,
  },
}

export function ExtrasScreen({ selectedIndex, onSelect, onActivate }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Extras</span>
      </div>

      <div style={styles.list}>
        {EXTRAS_ITEMS.map((item, i) => {
          const isSelected = i === selectedIndex
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
              <span>{item.label}</span>
              <span style={styles.chevron}>{'>'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
