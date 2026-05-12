import { useCallback } from 'react'

/**
 * The four arc zones of the click wheel, each mapped to an action.
 * Positions are defined as absolute insets so they don't overlap
 * the center button hit area.
 */
const WHEEL_ZONES = [
  { id: 'menu', label: 'Menu', style: { top: 0,    left: '25%', width: '50%', height: '35%' }, action: 'menu' },
  { id: 'next', label: '▶▶',  style: { bottom: 0,  left: '25%', width: '50%', height: '35%' }, action: 'next' },
  { id: 'prev', label: '◀◀',  style: { left: 0,    top: '25%',  width: '35%', height: '50%' }, action: 'prev' },
  { id: 'vol',  label: '♫',   style: { right: 0,   top: '25%',  width: '35%', height: '50%' }, action: 'vol'  },
]

const LABEL_POSITIONS = {
  menu: { top: '12px',    left: '50%', transform: 'translateX(-50%)' },
  next: { bottom: '12px', left: '50%', transform: 'translateX(-50%)' },
  prev: { left: '12px',   top: '50%',  transform: 'translateY(-50%)' },
  vol:  { right: '12px',  top: '50%',  transform: 'translateY(-50%)' },
}

export function ClickWheel({ onAction }) {
  const handleZoneClick = useCallback(
    (action, e) => {
      spawnRipple(e.currentTarget.parentElement, e)
      onAction(action)
    },
    [onAction],
  )

  const handleCenterClick = useCallback(() => {
    onAction('play_pause')
  }, [onAction])

  return (
    <div style={styles.wrap}>
      <div style={styles.wheel}>
        {/* Arc zone labels */}
        {WHEEL_ZONES.map(({ id, label }) => (
          <span key={id} style={{ ...styles.label, ...LABEL_POSITIONS[id] }}>
            {label}
          </span>
        ))}

        {/* Clickable arc zones */}
        {WHEEL_ZONES.map(({ id, style, action }) => (
          <div
            key={id}
            style={{ ...styles.zone, ...style }}
            onClick={(e) => handleZoneClick(action, e)}
          />
        ))}

        {/* Center button */}
        <button style={styles.centerBtn} onClick={handleCenterClick}>
          <div style={styles.centerBtnInner} />
        </button>
      </div>
    </div>
  )
}

/** Creates a short radial ripple at the click position on the wheel */
function spawnRipple(wheelEl, e) {
  const rect = wheelEl.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const ripple = document.createElement('div')
  ripple.style.cssText = `
    position: absolute;
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(0,0,0,0.15);
    pointer-events: none;
    left: ${x}px; top: ${y}px;
    animation: ripple 0.3s ease-out forwards;
  `
  wheelEl.appendChild(ripple)
  setTimeout(() => ripple.remove(), 350)
}

const styles = {
  wrap: {
    position: 'relative',
    width: '180px',
    height: '180px',
    flexShrink: 0,
  },
  wheel: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 35%, #e8eaec, #c0c2c4 40%, #a8aaac 80%, #909294)',
    boxShadow: `
      0 0 0 2px rgba(255,255,255,0.5) inset,
      0 0 0 3px rgba(0,0,0,0.15) inset,
      0 6px 20px rgba(0,0,0,0.4),
      0 2px 4px rgba(255,255,255,0.3)
    `,
    position: 'relative',
    userSelect: 'none',
    overflow: 'hidden',
  },
  label: {
    position: 'absolute',
    color: 'rgba(50,50,50,0.7)',
    fontSize: '7px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    pointerEvents: 'none',
    zIndex: 1,
  },
  zone: {
    position: 'absolute',
    cursor: 'pointer',
    zIndex: 2,
  },
  centerBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '62px',
    height: '62px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 35%, #f0f2f4, #c8cacc)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: `
      0 0 0 1px rgba(255,255,255,0.6) inset,
      0 0 0 2px rgba(0,0,0,0.1) inset,
      0 3px 8px rgba(0,0,0,0.3)
    `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  centerBtnInner: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 35%, #e0e2e4, #b0b2b4)',
    pointerEvents: 'none',
  },
}
