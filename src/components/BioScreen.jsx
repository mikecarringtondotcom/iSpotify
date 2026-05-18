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
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#111',
    letterSpacing: '0.2px',
  },
  subtitle: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#5a5e63',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  paragraph: {
    fontSize: '11px',
    lineHeight: 1.5,
    color: '#222',
  },
  divider: {
    height: '1px',
    background: 'rgba(0,0,0,0.15)',
    margin: '4px 0',
  },
  hint: {
    fontSize: '9px',
    color: '#555',
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: '6px',
  },
}

export function BioScreen() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>INFO</span>
      </div>

      <div style={styles.body}>
        <div style={styles.title}>iSpotify</div>
        <div style={styles.subtitle}>This is a client for Spotify that looks like a iPod cause why wouldnt you want that in the corner of ur screen </div>

        <div style={styles.divider} />

        <div style={styles.paragraph}>
          Drive playback with the click wheel, browse playlists & liked
          songs, and run focus up with the Pomodoro.
        </div>

        <div style={styles.paragraph}>
          Built with React and Spotify Web API. Also used hella pictures of iPods for CSS
        </div>

        <div style={styles.divider} />

        <div style={styles.subtitle}>Controls</div>
        <div style={styles.paragraph}>
          ARROWS scroll · CENTER select · MENU back · Space play/pause

          For: mikeincode 
          By: mikeincode
        </div>

        <div style={styles.hint}>MENU to return</div>
      </div>
    </div>
  )
}
