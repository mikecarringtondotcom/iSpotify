const styles = {
  toast: {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    background: 'rgba(30,30,30,0.95)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '24px',
    fontSize: '13px',
    zIndex: 300,
    border: '1px solid rgba(255,255,255,0.1)',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    pointerEvents: 'none',
  },
}

export function Toast({ message }) {
  if (!message) return null

  return (
    <div
      style={{
        ...styles.toast,
        transform: 'translateX(-50%) translateY(0)',
        animation: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}
    >
      {message}
    </div>
  )
}
