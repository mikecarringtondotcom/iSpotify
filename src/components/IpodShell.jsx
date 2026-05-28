// Per-side buffer around the chassis box (px). Lower a value to tighten that
// edge; raise it if the iPod's rounded corners start getting clipped on that
// side. The PiP window auto-sizes to whatever you set here.
const MARGINS = { top: 10, right: 20, bottom: 10, left: 20 }

// Chassis box — the rectangle the iPod body fills.
const CHASSIS = { width: 300, height: 556 }

// Total rendered size of the IpodShell — exported so callers (e.g. the PiP
// window) can size themselves to hug the iPod edge-to-edge.
export const IPOD_OUTER_WIDTH = CHASSIS.width + MARGINS.left + MARGINS.right
export const IPOD_OUTER_HEIGHT = CHASSIS.height + MARGINS.top + MARGINS.bottom

// % of the chassis box (NOT the outer). Tune here if overlays drift on the photo.
const COORDS = {
  screen: { left: '1.70%',    top: '6.70%',   width: '95.25%',   height: '41.35%' },
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
    width:  IPOD_OUTER_WIDTH + 'px',
    height: IPOD_OUTER_HEIGHT + 'px',
    overflow: 'hidden',
    animation: 'bootup 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  chassis: {
    position: 'absolute',
    left: MARGINS.left + 'px',
    top:  MARGINS.top  + 'px',
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
    borderRadius: '2.5px',
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
