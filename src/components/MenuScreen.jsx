const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, #fdfdfd 0%, #e8eaee 100%)',
    color: '#111',
    fontFamily: 'Helvetica, Arial, sans-serif',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(180deg, #f3f4f6 0%, #c8cacd 50%, #b4b6b9 100%)',
    borderBottom: '1px solid rgba(0,0,0,0.35)',
    padding: '2px 5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    height: '16px',
  },
  headerTitle: {
    color: '#111',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.2px',
  },
  body: {
    flex: 1,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  name: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#111',
    lineHeight: 1.2,
  },
  role: {
    fontSize: '10px',
    color: '#444',
    marginTop: '2px',
    fontStyle: 'italic',
  },
  divider: {
    height: '1px',
    background: 'rgba(0,0,0,0.15)',
    margin: '8px 0',
  },
  bio: {
    fontSize: '10px',
    color: '#222',
    lineHeight: 1.4,
  },
  hint: {
    marginTop: 'auto',
    fontSize: '8px',
    color: '#666',
    textAlign: 'center',
    paddingTop: '6px',
  },
}

export function MenuScreen() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>About</span>
      </div>

      <div style={styles.body}>
        <div style={styles.name}>iSpotify</div>
        <div style={styles.role}>for mikeincode by mikeincode</div>

        <div style={styles.divider} />

        <p style={styles.bio}>
          Yeh bro yk i wanted to have the menu button but making a menu isnt prioriy rn so onto the next thing, Don't forget abt this though.
        </p>

        <div style={styles.hint}>Press MENU to go back</div>
      </div>
    </div>
  )
}
