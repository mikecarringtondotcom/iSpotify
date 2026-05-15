import { useCallback } from 'react'

/**
 * Four arc zones on the click wheel, laid out like a real iPod Classic:
 *   top    → MENU
 *   right  → next track (⏭)
 *   bottom → play / pause (⏯)
 *   left   → previous track (⏮)
 */
const WHEEL_ZONES = [
  { id: 'menu', label: 'MENU', style: { top: 0,    left: '25%', width: '50%', height: '35%' }, action: 'menu'       },
  { id: 'next', label: '⏭', style: { right: 0, top: '25%',  width: '35%', height: '50%' }, action: 'next'       },
  { id: 'play', label: '⏯', style: { bottom: 0, left: '25%', width: '50%', height: '35%' }, action: 'play_pause' },
  { id: 'prev', label: '⏮', style: { left: 0,  top: '25%',  width: '35%', height: '50%' }, action: 'prev'       },
]

const LABEL_POSITIONS = {
  menu: { top: '14px',    left: '50%', transform: 'translateX(-50%)' },
  next: { right: '14px',  top: '50%',  transform: 'translateY(-50%)' },
  play: { bottom: '14px', left: '50%', transform: 'translateX(-50%)' },
  prev: { left: '14px',   top: '50%',  transform: 'translateY(-50%)' },
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
    <div style={styles.wheel}>
      {WHEEL_ZONES.map(({ id, label }) => (
        <span
          key={id}
          style={{
            ...styles.label,
            ...LABEL_POSITIONS[id],
            ...(id === 'menu' ? styles.menuLabel : styles.glyphLabel),
          }}
        >
          {label}
        </span>
      ))}

      {WHEEL_ZONES.map(({ id, style, action }) => (
        <div
          key={id}
          style={{ ...styles.zone, ...style }}
          onClick={(e) => handleZoneClick(action, e)}
        />
      ))}

      <button style={styles.centerBtn} onClick={handleCenterClick}>
        <div style={styles.centerBtnInner} />
      </button>
    </div>
  )
}

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
  wheel: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 42% 38%, #f2f3f5 0%, #e3e4e6 35%, #c8cacc 70%, #b0b2b4 100%)',
    boxShadow: `
      0 0 0 1px rgba(255,255,255,0.85) inset,
      0 0 0 2px rgba(0,0,0,0.12) inset,
      inset 0 2px 4px rgba(0,0,0,0.08),
      inset 0 -1px 2px rgba(255,255,255,0.5),
      0 4px 10px rgba(0,0,0,0.18),
      0 1px 2px rgba(0,0,0,0.1)
    `,
    position: 'relative',
    userSelect: 'none',
    overflow: 'hidden',
    flexShrink: 0,
  },
  label: {
    position: 'absolute',
    color: '#6a6c6e',
    pointerEvents: 'none',
    zIndex: 1,
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
  menuLabel: {
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '1px',
  },
  glyphLabel: {
    fontSize: '13px',
    lineHeight: 1,
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
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 42% 38%, #fafbfc 0%, #e0e2e4 55%, #c0c2c4 100%)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: `
      0 0 0 1px rgba(255,255,255,0.9) inset,
      0 0 0 2px rgba(0,0,0,0.12) inset,
      inset 0 1px 2px rgba(255,255,255,0.7),
      inset 0 -2px 3px rgba(0,0,0,0.08),
      0 2px 5px rgba(0,0,0,0.2)
    `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  centerBtnInner: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 35%, #d0d2d4, #a8aaac)',
    pointerEvents: 'none',
  },
}
