const styles = {
  shell: {
    position: 'relative',
    zIndex: 9999,
    width: '300px',
    height: '510px',
    background:
`       repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.03) 0px,
        rgba(255, 255, 255, 0.03) 1px,
        transparent 1px,
        transparent 3px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.02) 0px,
        rgba(0, 0, 0, 0.02) 2px,
        transparent 2px,
        transparent 4px
      ),
      linear-gradient(
        135deg, 
        #ffffff 0%, 
        #dcdcdc 25%, 
        #c8c8c8 50%, 
        #b0b0b0 80%, 
        #959595 100%
      )
    `,
    borderRadius: '34px',
    boxShadow: `
      inset 0 2px 3px rgba(255, 255, 255, 0.8),
      inset 2px 0 3px rgba(255, 255, 255, 0.3),
      inset -2px -2px 5px rgba(149, 149, 149, 0.7),
      inset 0 -5px 15px rgba(149, 149, 149, 0.9),
      0 10px 25px rgba(0, 0, 0, 0.15)
    `,
    border: '1px solid #b5b5b5',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 22px 30px',
    animation: 'bootup 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  // Subtle vertical "brushed aluminum" sheen overlay
  brushed: {
    position: 'absolute',
    inset: 0,
    borderRadius: '34px',
    background:
      'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, rgba(0,0,0,0.02) 1px 2px)',
    pointerEvents: 'none',
    mixBlendMode: 'overlay',
    opacity: 0.6,
  },
  screenBezel: {
    width: '256px',
    height: '192px',
    background: 'linear-gradient(180deg, #1a1a1a, #0a0a0a)',
    borderRadius: '4px',
    padding: '5px',
    boxShadow: `
      0 0 0 1px rgba(0,0,0,0.55),
      inset 0 0 0 1px rgba(255,255,255,0.06),
      inset 0 2px 6px rgba(0,0,0,0.9),
      0 1px 1px rgba(255,255,255,0.7)
    `,
    position: 'relative',
    zIndex: 1,
  },
  screen: {
    width: '100%',
    height: '100%',
    background: '#fff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'inset 0 0 1px rgba(255,255,255,0.2)',
  },
  wheelArea: {
    marginTop: 'auto',
    paddingTop: '22px',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
}

export function IpodShell({ children, wheel }) {
  return (
    <div style={styles.shell}>
      <div style={styles.brushed} />
      <div style={styles.screenBezel}>
        <div style={styles.screen}>{children}</div>
      </div>
      <div style={styles.wheelArea}>{wheel}</div>
    </div>
  )
}
