function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 14px',
  },
  phaseBadge: {
    padding: '2px 10px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    color: '#fff',
    textShadow: '0 1px 0 rgba(0,0,0,0.25)',
    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.1)',
  },
  phaseWork: {
    background: 'linear-gradient(180deg, #6aa9ff 0%, #2f6bd6 50%, #1f4fb8 100%)',
  },
  phaseBreak: {
    background: 'linear-gradient(180deg, #6ce06c 0%, #2fa82f 50%, #1f7a1f 100%)',
  },
  time: {
    fontSize: '44px',
    fontWeight: 700,
    color: '#111',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    letterSpacing: '-1px',
    marginTop: '2px',
  },
  timePaused: {
    color: '#5a5e63',
  },
  progressTrack: {
    width: '85%',
    height: '12px',
    background: 'linear-gradient(180deg, #d6d8dc, #ecedee)',
    border: '1px solid rgba(0,0,0,0.35)',
    borderRadius: '3px',
    overflow: 'hidden',
    boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.15)',
    marginTop: '4px',
  },
  progressFillWork: {
    height: '100%',
    background: 'linear-gradient(180deg, #5aa6ff 0%, #1d6cff 50%, #0d4ec9 100%)',
    transition: 'width 0.8s linear',
  },
  progressFillBreak: {
    height: '100%',
    background: 'linear-gradient(180deg, #6ce06c 0%, #2fa82f 50%, #1f7a1f 100%)',
    transition: 'width 0.8s linear',
  },
  cycle: {
    fontSize: '11px',
    color: '#444',
    marginTop: '2px',
    fontVariantNumeric: 'tabular-nums',
  },
  hintRow: {
    fontSize: '9px',
    color: '#555',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    marginTop: '6px',
  },
  hint: {
    lineHeight: 1.3,
    letterSpacing: '0.2px',
  },
}

export function PomodoroScreen({ phase, running, secondsLeft, cycle, progress }) {
  const isWork = phase === 'work'
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Pomodoro</span>
      </div>

      <div style={styles.body}>
        <div
          style={{
            ...styles.phaseBadge,
            ...(isWork ? styles.phaseWork : styles.phaseBreak),
          }}
        >
          {isWork ? 'Work' : 'Break'}
        </div>

        <div style={{ ...styles.time, ...(running ? null : styles.timePaused) }}>
          {formatTimer(secondsLeft)}
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...(isWork ? styles.progressFillWork : styles.progressFillBreak),
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
            }}
          />
        </div>

        <div style={styles.cycle}>Round {cycle}</div>

        <div style={styles.hintRow}>
          <span style={styles.hint}>{running ? 'CENTER pauses' : 'CENTER starts'}</span>
          <span style={styles.hint}>◀ reset   ▶ skip   MENU back</span>
        </div>
      </div>
    </div>
  )
}
