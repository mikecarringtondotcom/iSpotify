import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { buildAuthUrl, exchangeCodeForToken } from './utils/spotify'
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer'
import { useProgress } from './hooks/useProgress'
import { useToast } from './hooks/useToast'
import { IpodShell } from './components/IpodShell'
import { LoginScreen } from './components/LoginScreen'
import { NowPlayingScreen } from './components/NowPlayingScreen'
import { MenuScreen } from './components/MenuScreen'
import { ClickWheel } from './components/ClickWheel'
import { Toast } from './components/Toast'
import { Particles } from './components/Particles'

export default function App() {
  const [accessToken, setAccessToken] = useState(null)
  const [view, setView] = useState('now_playing')

  // ── Handle OAuth callback & saved token ──────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      window.history.replaceState({}, '', window.location.pathname)
      exchangeCodeForToken(code).then((token) => {
        if (token) {
          localStorage.setItem('spotify_token', token)
          setAccessToken(token)
        }
      })
    } else {
      const saved = localStorage.getItem('spotify_token')
      if (saved) setAccessToken(saved)
    }
  }, [])

  const { playerState, isReady, error, controls } = useSpotifyPlayer(accessToken)
  const { progressMs, durationMs, progressPct } = useProgress(playerState)
  const { message: toastMessage, showToast } = useToast()

  const isLoggedIn = Boolean(accessToken)

  // ── Surface player errors as toasts ─────────────────────────
  useEffect(() => {
    if (error === 'auth') {
      setAccessToken(null)
      localStorage.removeItem('spotify_token')
      showToast('Session expired — please log in again.')
    } else if (error === 'premium_required') {
      showToast('Spotify Premium required for browser playback.')
    } else if (error) {
      showToast(`Error: ${error}`)
    }
  }, [error, showToast])

  useEffect(() => {
    if (isReady) showToast('iSpotify connected!')
  }, [isReady, showToast])

  // ── Click Wheel Actions ──────────────────────────────────────
  const handleWheelAction = useCallback(
    async (action) => {
      if (!isLoggedIn) {
        showToast('Sign in to Spotify first.')
        return
      }
      switch (action) {
        case 'play_pause':
          // Center acts as Select on the menu, Play/Pause on Now Playing.
          if (view === 'menu') {
            setView('now_playing')
          } else {
            await controls.togglePlay()
          }
          break
        case 'next':
          await controls.nextTrack()
          break
        case 'prev':
          await controls.previousTrack()
          break
        case 'menu':
          setView((v) => (v === 'menu' ? 'now_playing' : 'menu'))
          break
      }
    },
    [isLoggedIn, controls, showToast, view],
  )

  // ── Keyboard Shortcuts ───────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      const map = {
        Space:      'play_pause',
        Enter:      'play_pause',
        ArrowRight: 'next',
        ArrowLeft:  'prev',
        ArrowUp:    'menu',
        Escape:     'menu',
      }
      const action = map[e.code]
      if (action) {
        e.preventDefault()
        handleWheelAction(action)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleWheelAction])

  // ── Login ────────────────────────────────────────────────────
  async function handleLogin() {
    window.location.href = await buildAuthUrl()
  }

  function renderScreen() {
    if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />
    if (view === 'menu') return <MenuScreen />
    return (
      <NowPlayingScreen
        playerState={playerState}
        progressMs={progressMs}
        durationMs={durationMs}
        progressPct={progressPct}
      />
    )
  }

  return (
    <>
      <Particles />

      <Canvas
        camera={{ position: [0, 0, 300], fov: 50, near: 1, far: 5000 }}
        style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
        gl={{ alpha: true, antialias: true }}
      >
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.12}
          rotateSpeed={0.6}
        />
        <Html transform scale={15}>
          <IpodShell wheel={<ClickWheel onAction={handleWheelAction} />}>
            {renderScreen()}
          </IpodShell>
        </Html>
      </Canvas>

      <Toast message={toastMessage} />
    </>
  )
}
