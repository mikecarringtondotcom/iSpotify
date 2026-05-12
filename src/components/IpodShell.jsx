const styles = {
  shell: {
    position: 'relative',
    zIndex: 1,
    width: '320px',
    background: 'linear-gradient(145deg, #f0f2f4, #c0c2c4, #e8eaec, #b0b2b4)',
    borderRadius: '36px',
    boxShadow: `
      0 0 0 1px rgba(255,255,255,0.6) inset,
      0 0 0 2px rgba(0,0,0,0.2) inset,
      0 30px 80px rgba(0,0,0,0.8),
      0 10px 30px rgba(0,0,0,0.5),
      0 2px 6px rgba(255,255,255,0.3)
    `,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '22px 20px 18px',
    gap: '16px',
    animation: 'bootup 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  topNotch: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '-8px',
  },
  camera: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #3a3a3a, #111)',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
  },
  speakerGrille: {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
  },
  speakerDot: {
    width: '2px',
    height: '6px',
    borderRadius: '1px',
    background: 'rgba(0,0,0,0.35)',
  },
  screenBezel: {
    width: '280px',
    height: '220px',
    background: '#111',
    borderRadius: '16px',
    padding: '4px',
    boxShadow: `
      0 0 0 1px rgba(0,0,0,0.8),
      inset 0 0 0 1px rgba(255,255,255,0.08),
      0 4px 12px rgba(0,0,0,0.5)
    `,
    overflow: 'hidden',
  },
  screen: {
    width: '100%',
    height: '100%',
    borderRadius: '12px',
    background: '#000',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  bottomPort: {
    width: '50px',
    height: '6px',
    background: 'linear-gradient(180deg, #888, #aaa, #888)',
    borderRadius: '3px',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px rgba(255,255,255,0.4)',
  },
}

const SPEAKER_DOTS = Array.from({ length: 5 })

export function IpodShell({ children }) {
  return (
    <div style={styles.shell}>
      {/* Top notch: camera + speaker */}
      <div style={styles.topNotch}>
        <div style={styles.camera} />
        <div style={styles.speakerGrille}>
          {SPEAKER_DOTS.map((_, i) => (
            <div key={i} style={styles.speakerDot} />
          ))}
        </div>
      </div>

      {/* Screen bezel */}
      <div style={styles.screenBezel}>
        <div style={styles.screen}>{children}</div>
      </div>

      {/* Connector port at bottom */}
      <div style={styles.bottomPort} />
    </div>
  )
}
