import { useCallback } from 'react'

// Transparent hit-zones laid over the visible click wheel in ipod.png.
//   top    → MENU
//   right  → next track
//   bottom → play / pause
//   left   → previous track
//   center → Select / Play-Pause
const WHEEL_ZONES = [
  { id: 'menu', style: { top: 0,    left: '25%', width: '50%', height: '35%' }, action: 'menu' },
  { id: 'next', style: { right: 0,  top: '25%',  width: '35%', height: '50%' }, action: 'next' },
  { id: 'play', style: { bottom: 0, left: '25%', width: '50%', height: '35%' }, action: 'play_pause' },
  { id: 'prev', style: { left: 0,   top: '25%',  width: '35%', height: '50%' }, action: 'prev' },
]

export function ClickWheel({ onAction, onButtonSound }) {
  const handleZoneClick = useCallback(
    (action) => {
      // The center/select button is silent; the four outer buttons click.
      onButtonSound?.()
      onAction(action)
    },
    [onAction, onButtonSound],
  )

  const handleCenterClick = useCallback(() => {
    onAction('play_pause')
  }, [onAction])

  return (
    <div style={styles.wheel}>
      {WHEEL_ZONES.map(({ id, style, action }) => (
        <div
          key={id}
          style={{ ...styles.zone, ...style }}
          onClick={() => handleZoneClick(action)}
        />
      ))}
      <button
        style={styles.centerBtn}
        onClick={handleCenterClick}
        aria-label="Select"
      />
    </div>
  )
}

const styles = {
  wheel: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    userSelect: 'none',
  },
  zone: {
    position: 'absolute',
    cursor: 'pointer',
    background: 'transparent',
  },
  centerBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '36%',
    height: '36%',
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
}
