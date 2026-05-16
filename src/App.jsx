import { useState, useEffect, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Spherical, Vector3 } from 'three'
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

const REST_AZIMUTH = 0
const REST_POLAR = Math.PI / 2
const SOFT_LIMIT = Math.PI / 15   // 15° — past this, spring back on release
const HARD_LIMIT = Math.PI / 5    // 20° — drag can never exceed this
const SPRING = 0.12               // higher = snappier return

function RubberBandControls() {
  const ref = useRef(null)
  const dragging = useRef(false)
  const spherical = useRef(new Spherical()).current
  const offset = useRef(new Vector3()).current

  useFrame(() => {
    const c = ref.current
    if (!c || dragging.current) return

    offset.subVectors(c.object.position, c.target)
    spherical.setFromVector3(offset)

    let changed = false
    if (Math.abs(spherical.theta - REST_AZIMUTH) > SOFT_LIMIT) {
      const goal = REST_AZIMUTH + Math.sign(spherical.theta - REST_AZIMUTH) * SOFT_LIMIT
      spherical.theta += (goal - spherical.theta) * SPRING
      changed = true
    }
    if (Math.abs(spherical.phi - REST_POLAR) > SOFT_LIMIT) {
      const goal = REST_POLAR + Math.sign(spherical.phi - REST_POLAR) * SOFT_LIMIT
      spherical.phi += (goal - spherical.phi) * SPRING
      changed = true
    }
    if (changed) {
      offset.setFromSpherical(spherical)
      c.object.position.copy(c.target).add(offset)
      c.update()
    }
  })

  return (
    <OrbitControls
      ref={ref}
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.12}
      rotateSpeed={0.3}
      minAzimuthAngle={-HARD_LIMIT}
      maxAzimuthAngle={HARD_LIMIT}
      minPolarAngle={REST_POLAR - HARD_LIMIT}
      maxPolarAngle={REST_POLAR + HARD_LIMIT}
      onStart={() => { dragging.current = true }}
      onEnd={() => { dragging.current = false }}
    />
  )
}

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
        <RubberBandControls />
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
