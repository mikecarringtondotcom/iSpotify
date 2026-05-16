// Bump MARGIN if the rounded chassis corners are still clipped.
// It's a px buffer added on every side of the chassis box.
const MARGIN = 20

// Chassis box — the rectangle the iPod body fills.
const CHASSIS = { width: 300, height: 556 }

// % of the chassis box (NOT the outer). Tune here if overlays drift on the photo.
const COORDS = {
  screen: { left: '1.70%',    top: '6.55%',   width: '95.25%',   height: '41.35%' },
  wheel:  { centerLeft: '50%', centerTop: '72%', diameter: '62%' },
}

// Image sized + offset so the chassis fills the chassis box at (0,0).
const IMG = {
  width: '1177px',
  left:  '-447px',
  top:   '-104px',
}

const styles = {
  outer: {
    position: 'relative',
    zIndex: 9999,
    width:  CHASSIS.width  + 2 * MARGIN + 'px',
    height: CHASSIS.height + 2 * MARGIN + 'px',
    overflow: 'hidden',
    animation: 'bootup 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  chassis: {
    position: 'absolute',
    left: MARGIN + 'px',
    top:  MARGIN + 'px',
    width:  CHASSIS.width  + 'px',
    height: CHASSIS.height + 'px',
  },
  ipodImg: {
    position: 'absolute',
    width: IMG.width,
    height: 'auto',
    left: IMG.left,
    top: IMG.top,
    pointerEvents: 'none',
    userSelect: 'none',
    WebkitUserDrag: 'none',
    display: 'block',
  },
  screen: {
    position: 'absolute',
    background: '#fff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '6px',
    ...COORDS.screen,
  },
  wheelArea: {
    position: 'absolute',
    left: COORDS.wheel.centerLeft,
    top: COORDS.wheel.centerTop,
    width: COORDS.wheel.diameter,
    aspectRatio: '1 / 1',
    transform: 'translate(-50%, -50%)',
  },
}

export function IpodShell({ children, wheel }) {
  return (
    <div style={styles.outer}>
      <div style={styles.chassis}>
        <img src="/ipod.png" alt="iPod" style={styles.ipodImg} draggable={false} />
        <div style={styles.screen}>{children}</div>
        <div style={styles.wheelArea}>{wheel}</div>
      </div>
    </div>
  )
}
