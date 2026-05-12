const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: 'linear-gradient(160deg, #1db954 0%, #158a3e 50%, #0a5c28 100%)',
    padding: '12px',
  },
  logoWrap: {
    width: '48px',
    height: '48px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  title: {
    color: 'white',
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '9px',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  button: {
    background: 'white',
    color: '#1db954',
    border: 'none',
    borderRadius: '20px',
    padding: '7px 22px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    marginTop: '4px',
    fontFamily: 'inherit',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
}

export function LoginScreen({ onLogin }) {
  return (
    <div style={styles.container}>
      <div style={styles.logoWrap}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#1db954">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.779.779 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.519-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.793c3.563-1.08 9.484-.87 13.22 1.37a.937.937 0 01-.345 1.28z" />
        </svg>
      </div>
      <h2 style={styles.title}>Spotify</h2>
      <p style={styles.subtitle}>Your music, in classic style.</p>
      <button
        style={styles.button}
        onClick={onLogin}
        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.04)' }}
        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)' }}
        onMouseDown={(e) => { e.target.style.transform = 'scale(0.97)' }}
        onMouseUp={(e) => { e.target.style.transform = 'scale(1.04)' }}
      >
        Sign in with Spotify
      </button>
    </div>
  )
}
