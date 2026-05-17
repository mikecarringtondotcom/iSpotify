const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    background: 'linear-gradient(180deg, #fdfdfd 0%, #e8eaee 100%)',
    color: '#111',
    fontFamily: 'Helvetica, Arial, sans-serif',
    overflow: 'hidden',
  },
  leftPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(0,0,0,.25)',
    minWidth: 0,
    zIndex: 1,
    // horizontal-offset | vertical-offset | blur | spread | color
    boxShadow: '8px 0px 12px 2px rgba(0, 0, 0, 0.25)',
  },
  header: {
    background: 'linear-gradient(180deg, #f3f4f6 0%, #c8cacd 50%, #b4b6b9 100%)',
    borderBottom: '1px solid rgba(0,0,0,0.35)',
    padding: '0 5px',
    flexShrink: 0,
    height: '16px',
    lineHeight: '16px',
    textAlign: 'left',
  },
  headerTitle: {
    display: 'block',
    color: '#111',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.2px',
    textAlign: 'left',
  },
  menuItem: {
    background: 'linear-gradient(180deg, #4a8eff 0%, #1d5fd0 100%)',
    color: 'white',
    fontSize: '11px',
    fontWeight: 700,
    padding: '5px 3px',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'left',
    fontFamily: 'inherit',
    textShadow: '0 1px 0 rgba(0,0,0,0.25)',
  },
  rightPane: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    minWidth: 0,
    background: 'linear-gradient(135deg, #acb5d0 1%,#8488a2 31%,#605e69 100%)',
  },
  welcome: {
    position: 'absolute',
    color: '#D9DFF9',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
}

const WELCOMES = [
  { text: 'Bienvenue', top: '8%',  left: '10%', size: '20px', weight: 200, fontFamily: 'Times New Roman, Times, serif'},
  { text: '欢迎',       top: '22%', left: '65%', size: '32px', weight: 200, fontFamily: 'LXGW WenKai TC, cursive, serif'},
  { text: 'Welcome',   top: '42%', left: '21%', size: '22px', weight: 700, fontFamily: 'Helvetica, Arial, sans-serif'},
  { text: 'Willkommen', top: '70%', left: '50.5%', size: '20px', weight: 200, fontFamily: 'Times New Roman, Times, serif'},
]

export function LoginScreen({ onLogin }) {
  return (
    <div style={styles.container}>
      <div style={styles.leftPane}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>Language</span>
        </div>
        <button style={styles.menuItem} onClick={onLogin}>
          Sign in with Spotify
        </button>
      </div>

      <div style={styles.rightPane}>
        {WELCOMES.map((w) => (
          <span
            key={w.text}
            style={{
              ...styles.welcome,
              top: w.top,
              left: w.left,
              fontSize: w.size,
              fontWeight: w.weight,
              fontFamily: w.fontFamily, // Override welcome font to support different languages.
            }}
          >
            {w.text}
          </span>
        ))}
      </div>
    </div>
  )
}
