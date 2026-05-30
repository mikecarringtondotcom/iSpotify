import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Spherical, Vector3 } from 'three'
import { buildAuthUrl, clearTokens, exchangeCodeForToken, playContext, playTracks, setShuffle } from './utils/spotify'
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer'
import { useProgress } from './hooks/useProgress'
import { useToast } from './hooks/useToast'
import { useDocumentPiP } from './hooks/useDocumentPiP'
import { usePomodoro } from './hooks/usePomodoro'
import { IpodShell, IPOD_OUTER_WIDTH, IPOD_OUTER_HEIGHT } from './components/IpodShell'
import { LoginScreen } from './components/LoginScreen'
import { NowPlayingScreen } from './components/NowPlayingScreen'
import { MenuScreen, MENU_ITEMS } from './components/MenuScreen'
import { PlaylistsScreen } from './components/PlaylistsScreen'
import { LikedSongsScreen } from './components/LikedSongsScreen'
import { PhotosScreen } from './components/PhotosScreen'
import { ExtrasScreen, EXTRAS_ITEMS } from './components/ExtrasScreen'
import { PomodoroScreen } from './components/PomodoroScreen'
import { SettingsScreen, SETTINGS_ITEMS } from './components/SettingsScreen'
import { ThemeScreen, THEME_ITEMS } from './components/ThemeScreen'
import { BioScreen } from './components/BioScreen'
import { ClickWheel } from './components/ClickWheel'
import { Toast } from './components/Toast'
import { Particles } from './components/Particles'
import './styles/global.css';

const THEME_CLASSES = THEME_ITEMS.map((t) => `theme-${t.id}`)

const REST_AZIMUTH = 0
const REST_POLAR = Math.PI / 2
const HARD_LIMIT = Math.PI / 15    // 20° — drag can never exceed this
const SPRING = 0.2                // higher = snappier return
const REST_EPSILON = 0.0001       // stop springing when within this many radians

// Default size of the PiP window relative to the iPod's currently rendered
// on-screen size. 1 = same size as the iPod looks now; 0.5 = half-sized.
// The PiP also opens centered on the iPod's current position.
const PIP_DEFAULT_SCALE = 0.7

// Extra pixels added to the PiP window's height (below the iPod) so the
// browser's titlebar/chrome doesn't clip it. The iPod itself stays at
// PIP_DEFAULT_SCALE — only the surrounding window grows.
const PIP_BOTTOM_EXTRA = 0

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
    if (Math.abs(spherical.theta - REST_AZIMUTH) > REST_EPSILON) {
      spherical.theta += (REST_AZIMUTH - spherical.theta) * SPRING
      changed = true
    }
    if (Math.abs(spherical.phi - REST_POLAR) > REST_EPSILON) {
      spherical.phi += (REST_POLAR - spherical.phi) * SPRING
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
  const [menuIndex, setMenuIndex] = useState(0)
  const [playlistIndex, setPlaylistIndex] = useState(0)
  const [playlists, setPlaylists] = useState([])
  const [likedIndex, setLikedIndex] = useState(0)
  const [likedSongs, setLikedSongs] = useState([])
  const [photosIndex, setPhotosIndex] = useState(0)
  const [photos, setPhotos] = useState([])
  const [extrasIndex, setExtrasIndex] = useState(0)
  const [settingsIndex, setSettingsIndex] = useState(0)
  const [themeIndex, setThemeIndex] = useState(0)
  const [shuffleOn, setShuffleOn] = useState(false)
  const pomodoro = usePomodoro()

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ispotify_theme')
    return THEME_ITEMS.some((t) => t.id === saved) ? saved : 'blue'
  })

  // ── Apply theme class to <body> ──────────────────────────────
  useEffect(() => {
    document.body.classList.remove(...THEME_CLASSES)
    document.body.classList.add(`theme-${theme}`)
    localStorage.setItem('ispotify_theme', theme)
  }, [theme])

  // ── Handle OAuth callback & saved token ──────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      window.history.replaceState({}, '', window.location.pathname)
      exchangeCodeForToken(code).then((token) => {
        if (token) setAccessToken(token)
      })
    } else {
      const saved = localStorage.getItem('spotify_token')
      if (saved) setAccessToken(saved)
    }
  }, [])

  // Keep React state in sync when the SDK silently refreshes the token,
  // so subsequent REST calls (playlists, play, shuffle) use the fresh one.
  useEffect(() => {
    const onTokenUpdate = (e) => setAccessToken(e.detail)
    window.addEventListener('spotify:token-updated', onTokenUpdate)
    return () => window.removeEventListener('spotify:token-updated', onTokenUpdate)
  }, [])

  const { playerState, isReady, deviceId, error, controls } = useSpotifyPlayer(accessToken)
  const { progressMs, durationMs, progressPct } = useProgress(playerState)
  const { message: toastMessage, showToast } = useToast()
  const { pipWindow, openPip, closePip, isSupported: pipSupported } = useDocumentPiP()
  const [floating, setFloating] = useState(false)
  const ipodOnScreenRef = useRef(null)

  const isLoggedIn = Boolean(accessToken)

  // ── Surface player errors as toasts ─────────────────────────
  useEffect(() => {
    if (error === 'auth') {
      setAccessToken(null)
      clearTokens()
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

  // ── Reconcile local shuffle state with Spotify ─────────────
  useEffect(() => {
    if (typeof playerState?.shuffle === 'boolean') {
      setShuffleOn(playerState.shuffle)
    }
  }, [playerState?.shuffle])

  // ── Toggle Spotify shuffle (optimistic, reverts on failure) ─
  const toggleShuffle = useCallback(async () => {
    if (!deviceId) {
      showToast('Player not ready yet.')
      return
    }
    const next = !shuffleOn
    setShuffleOn(next)
    try {
      await setShuffle(accessToken, deviceId, next)
    } catch (e) {
      setShuffleOn(!next)
      showToast(e.message ?? 'Could not toggle shuffle')
    }
  }, [accessToken, deviceId, shuffleOn, showToast])

  // ── Activate a menu item ────────────────────────────────────
  const activateMenuItem = useCallback((index) => {
    const item = MENU_ITEMS[index]
    if (!item?.enabled) return
    if (item.id === 'playlists') {
      setPlaylistIndex(0)
      setView('playlists')
    } else if (item.id === 'liked_songs') {
      setLikedIndex(0)
      setView('liked_songs')
    } else if (item.id === 'photos') {
      setPhotosIndex(0)
      setView('photos')
    } else if (item.id === 'extras') {
      setExtrasIndex(0)
      setView('extras')
    } else if (item.id === 'settings') {
      setSettingsIndex(0)
      setView('settings')
    } else if (item.id === 'shuffle') {
      toggleShuffle()
    }
  }, [toggleShuffle])

  // ── Activate an extras item ─────────────────────────────────
  const activateExtrasItem = useCallback((index) => {
    const item = EXTRAS_ITEMS[index]
    if (!item) return
    if (item.id === 'pomodoro') {
      setView('pomodoro')
    }
  }, [])

  // ── Activate a settings item ────────────────────────────────
  const activateSettingsItem = useCallback((index) => {
    const item = SETTINGS_ITEMS[index]
    if (!item) return
    if (item.id === 'theme') {
      const current = THEME_ITEMS.findIndex((t) => t.id === theme)
      setThemeIndex(current >= 0 ? current : 0)
      setView('theme')
    } else if (item.id === 'bio') {
      setView('bio')
    }
  }, [theme])

  // ── Activate a theme item ───────────────────────────────────
  const activateThemeItem = useCallback((index) => {
    const item = THEME_ITEMS[index]
    if (!item) return
    setTheme(item.id)
  }, [])

  // ── Play a playlist by index, then return to Now Playing ───
  const playPlaylistAt = useCallback(async (index) => {
    const playlist = playlists[index]
    if (!playlist) return
    if (!deviceId) {
      showToast('Player not ready yet.')
      return
    }
    try {
      await playContext(accessToken, deviceId, playlist.uri)
      setView('now_playing')
    } catch (e) {
      showToast(e.message ?? 'Could not start playlist')
    }
  }, [playlists, deviceId, accessToken, showToast])

  // ── Play a liked song; queue up to 100 from selection ──────
  const playLikedSongAt = useCallback(async (index) => {
    const track = likedSongs[index]
    if (!track) return
    if (!deviceId) {
      showToast('Player not ready yet.')
      return
    }
    const uris = likedSongs.slice(index, index + 100).map((t) => t.uri)
    try {
      await playTracks(accessToken, deviceId, uris, 0)
      setView('now_playing')
    } catch (e) {
      showToast(e.message ?? 'Could not start playback')
    }
  }, [likedSongs, deviceId, accessToken, showToast])

  // ── Click Wheel Actions ──────────────────────────────────────
  const handleWheelAction = useCallback(
    async (action) => {
      if (!isLoggedIn) {
        showToast('Sign in to Spotify first.')
        return
      }
      switch (action) {
        case 'play_pause':
          if (view === 'menu') {
            activateMenuItem(menuIndex)
          } else if (view === 'playlists') {
            await playPlaylistAt(playlistIndex)
          } else if (view === 'liked_songs') {
            await playLikedSongAt(likedIndex)
          } else if (view === 'photos') {
            if (photos.length > 0) setView('photo_view')
          } else if (view === 'photo_view') {
            // No-op in single photo view; menu button returns to grid.
          } else if (view === 'extras') {
            activateExtrasItem(extrasIndex)
          } else if (view === 'settings') {
            activateSettingsItem(settingsIndex)
          } else if (view === 'theme') {
            activateThemeItem(themeIndex)
          } else if (view === 'pomodoro') {
            pomodoro.toggleRunning()
          } else {
            await controls.togglePlay()
          }
          break
        case 'next':
          if (view === 'menu') {
            setMenuIndex((i) => Math.min(MENU_ITEMS.length - 1, i + 1))
          } else if (view === 'playlists') {
            setPlaylistIndex((i) => Math.min(Math.max(0, playlists.length - 1), i + 1))
          } else if (view === 'liked_songs') {
            setLikedIndex((i) => Math.min(Math.max(0, likedSongs.length - 1), i + 1))
          } else if (view === 'photos' || view === 'photo_view') {
            setPhotosIndex((i) => Math.min(Math.max(0, photos.length - 1), i + 1))
          } else if (view === 'extras') {
            setExtrasIndex((i) => Math.min(EXTRAS_ITEMS.length - 1, i + 1))
          } else if (view === 'settings') {
            setSettingsIndex((i) => Math.min(SETTINGS_ITEMS.length - 1, i + 1))
          } else if (view === 'theme') {
            setThemeIndex((i) => Math.min(THEME_ITEMS.length - 1, i + 1))
          } else if (view === 'pomodoro') {
            pomodoro.skipPhase()
          } else {
            await controls.nextTrack()
          }
          break
        case 'prev':
          if (view === 'menu') {
            setMenuIndex((i) => Math.max(0, i - 1))
          } else if (view === 'playlists') {
            setPlaylistIndex((i) => Math.max(0, i - 1))
          } else if (view === 'liked_songs') {
            setLikedIndex((i) => Math.max(0, i - 1))
          } else if (view === 'photos' || view === 'photo_view') {
            setPhotosIndex((i) => Math.max(0, i - 1))
          } else if (view === 'extras') {
            setExtrasIndex((i) => Math.max(0, i - 1))
          } else if (view === 'settings') {
            setSettingsIndex((i) => Math.max(0, i - 1))
          } else if (view === 'theme') {
            setThemeIndex((i) => Math.max(0, i - 1))
          } else if (view === 'pomodoro') {
            pomodoro.resetPhase()
          } else {
            await controls.previousTrack()
          }
          break
        case 'menu':
          if (view === 'pomodoro') setView('extras')
          else if (view === 'theme' || view === 'bio') setView('settings')
          else if (view === 'photo_view') setView('photos')
          else if (view === 'playlists' || view === 'liked_songs' || view === 'photos' || view === 'extras' || view === 'settings') setView('menu')
          else if (view === 'menu') setView('now_playing')
          else setView('menu')
          break
      }
    },
    [isLoggedIn, controls, showToast, view, menuIndex, playlistIndex, playlists.length, likedIndex, likedSongs.length, photosIndex, photos.length, extrasIndex, settingsIndex, themeIndex, activateMenuItem, activateExtrasItem, activateSettingsItem, activateThemeItem, playPlaylistAt, playLikedSongAt, pomodoro],
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
        ArrowDown:  'next',
        ArrowUp:    'prev',
        Escape:     'menu',
      }
      const action = map[e.code]
      if (action) {
        e.preventDefault()
        handleWheelAction(action)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    pipWindow?.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      pipWindow?.removeEventListener('keydown', onKeyDown)
    }
  }, [handleWheelAction, pipWindow])

  // ── Login ────────────────────────────────────────────────────
  async function handleLogin() {
    window.location.href = await buildAuthUrl()
  }

  function renderScreen() {
    if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />
    if (view === 'menu') {
      return (
        <MenuScreen
          selectedIndex={menuIndex}
          onSelect={setMenuIndex}
          onActivate={(i) => { setMenuIndex(i); activateMenuItem(i) }}
          shuffleOn={shuffleOn}
        />
      )
    }
    if (view === 'playlists') {
      return (
        <PlaylistsScreen
          accessToken={accessToken}
          selectedIndex={playlistIndex}
          onSelect={setPlaylistIndex}
          onActivate={(i) => { setPlaylistIndex(i); playPlaylistAt(i) }}
          onLoaded={setPlaylists}
          onScopeError={(status) => {
            clearTokens()
            setAccessToken(null)
            showToast(
              status === 403
                ? 'Playlist scope missing — please sign in again.'
                : 'Session expired — please sign in again.',
            )
          }}
        />
      )
    }
    if (view === 'liked_songs') {
      return (
        <LikedSongsScreen
          accessToken={accessToken}
          selectedIndex={likedIndex}
          onSelect={setLikedIndex}
          onActivate={(i) => { setLikedIndex(i); playLikedSongAt(i) }}
          onLoaded={setLikedSongs}
          onScopeError={(status) => {
            clearTokens()
            setAccessToken(null)
            showToast(
              status === 403
                ? 'Library scope missing — please sign in again.'
                : 'Session expired — please sign in again.',
            )
          }}
        />
      )
    }
    if (view === 'photos') {
      return (
        <PhotosScreen
          mode="grid"
          selectedIndex={photosIndex}
          onSelect={setPhotosIndex}
          onActivate={(i) => {
            setPhotosIndex(i)
            if (photos.length > 0) setView('photo_view')
          }}
          onLoaded={setPhotos}
        />
      )
    }
    if (view === 'photo_view') {
      return (
        <PhotosScreen
          mode="view"
          selectedIndex={photosIndex}
          onLoaded={setPhotos}
        />
      )
    }
    if (view === 'extras') {
      return (
        <ExtrasScreen
          selectedIndex={extrasIndex}
          onSelect={setExtrasIndex}
          onActivate={(i) => { setExtrasIndex(i); activateExtrasItem(i) }}
        />
      )
    }
    if (view === 'settings') {
      return (
        <SettingsScreen
          selectedIndex={settingsIndex}
          onSelect={setSettingsIndex}
          onActivate={(i) => { setSettingsIndex(i); activateSettingsItem(i) }}
        />
      )
    }
    if (view === 'theme') {
      return (
        <ThemeScreen
          selectedIndex={themeIndex}
          activeTheme={theme}
          onSelect={setThemeIndex}
          onActivate={(i) => { setThemeIndex(i); activateThemeItem(i) }}
        />
      )
    }
    if (view === 'bio') {
      return <BioScreen />
    }
    if (view === 'pomodoro') {
      return (
        <PomodoroScreen
          phase={pomodoro.phase}
          running={pomodoro.running}
          secondsLeft={pomodoro.secondsLeft}
          cycle={pomodoro.cycle}
          progress={pomodoro.progress}
        />
      )
    }
    return (
      <NowPlayingScreen
        playerState={playerState}
        progressMs={progressMs}
        durationMs={durationMs}
        progressPct={progressPct}
        pomodoro={pomodoro}
      />
    )
  }

  const ipodNode = (
    <IpodShell wheel={<ClickWheel onAction={handleWheelAction} />}>
      {renderScreen()}
    </IpodShell>
  )

  const themeColor = THEME_ITEMS.find((t) => t.id === theme)?.swatch ?? '#0E94DD'

  const enterMini = () => {
    if (pipSupported) {
      // Match the Chrome PiP docs example: window opens at the player's
      // exact clientWidth/clientHeight, the player is appended into the PiP
      // body as-is. No scaling, no wrapper divs.
      const node = ipodOnScreenRef.current
      const w = 200
      const h = 400
      const rect = node?.getBoundingClientRect()
      const cx = (rect?.left ?? window.innerWidth / 2) + (rect?.width ?? 0) / 2
      const cy = (rect?.top ?? window.innerHeight / 2) + (rect?.height ?? 0) / 2
      const chromeTop = window.outerHeight - window.innerHeight
      const x = Math.round(window.screenX + cx - w / 2)
      const y = Math.round(window.screenY + chromeTop + cy - h / 2)
      openPip({ width: w, height: h, background: themeColor, x, y })
    } else {
      setFloating(true)
    }
  }

  const exitMini = () => {
    if (pipWindow) closePip()
    else setFloating(false)
  }

  const inMiniMode = Boolean(pipWindow) || floating

  return (
    <>
        {inMiniMode ? (
          <>
            {pipWindow
              ? createPortal(
                  <>
                    <div style={{ zoom: PIP_DEFAULT_SCALE }}>{ipodNode}</div>
                    <Toast message={toastMessage} />
                  </>,
                  pipWindow.document.body
                )
              : (
                <div
                  style={{
                    ...floatingPlayerStyles.wrap,
                    width: IPOD_OUTER_WIDTH * PIP_DEFAULT_SCALE,
                    height: IPOD_OUTER_HEIGHT * PIP_DEFAULT_SCALE,
                    background: themeColor,
                  }}
                >
                  <div
                    style={{
                      width: IPOD_OUTER_WIDTH,
                      height: IPOD_OUTER_HEIGHT,
                      transform: `scale(${PIP_DEFAULT_SCALE})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    {ipodNode}
                  </div>
                </div>
              )}
            <div style={pipPlaceholderStyles.wrap}>
              <div style={pipPlaceholderStyles.card}>
                <div style={pipPlaceholderStyles.title}>You knew what that button did</div>
                <button
                  style={pipPlaceholderStyles.button}
                  onClick={exitMini}
                >
                  Return to main window
                </button>
              </div>
            </div>
            {!pipWindow && <Toast message={toastMessage} />}
          </>
        ) : (
          <>
            {/* <Particles /> */}

            <Canvas
              camera={{ position: [0, 0, 300], fov: 50, near: 1, far: 5000 }}
              style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
              gl={{ alpha: true, antialias: true }}
            >
              <RubberBandControls />
              <Html transform scale={15}>
                <div ref={ipodOnScreenRef}>{ipodNode}</div>
              </Html>
            </Canvas>

            <Toast message={toastMessage} />

            <button
              style={windowedButtonStyles.button}
              onClick={enterMini}
              title={pipSupported
                ? 'Put dat iPod in the corner where it belongs'
                : 'Shrink dat iPod to the corner (your browser doesn’t support PiP windows)'}
            >
              <img
                src="/picture-in-picture-on-icon-lg.png"
                alt={pipSupported ? 'Enable Picture-in-Picture mode' : 'Shrink to corner'}
                style={{ width: '50px', height: '50px' }}
              />
            </button>
          </>
        )}
      </>
  )
}

const windowedButtonStyles = {
  button: {
    position: 'fixed',
    top: '12px',
    right: '12px',
    zIndex: 10000,
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#111',
    border: '1px solid rgba(0,0,0,0.25)',
    borderRadius: '6px',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },
}

const floatingPlayerStyles = {
  wrap: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 10000,
    overflow: 'hidden',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
  },
}

const pipPlaceholderStyles = {
  wrap: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  card: {
    padding: '20px 24px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.9)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    textAlign: 'center',
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
  title: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#111',
    marginBottom: '10px',
  },
  button: {
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
    background: '#1d6cff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
}
