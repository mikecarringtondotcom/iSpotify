import { useState, useEffect, useCallback } from 'react'
import { buildAuthUrl, exchangeCodeForToken } from './utils/spotify'
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer'
import { useProgress } from './hooks/useProgress'
import { useToast } from './hooks/useToast'
import { IpodShell } from './components/IpodShell'
import { LoginScreen } from './components/LoginScreen'
import { NowPlayingScreen } from './components/NowPlayingScreen'
import { ClickWheel } from './components/ClickWheel'
import { Toast } from './components/Toast'
import { Particles } from './components/Particles'

export default function App() {
  const [accessToken, setAccessToken] = useState(null)

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
          await controls.togglePlay()
          break
        case 'next':
          await controls.nextTrack()
          break
        case 'prev':
          await controls.previousTrack()
          break
        case 'vol': {
          const newVol = await controls.adjustVolume(+0.1)
          if (newVol !== undefined) showToast(`Volume: ${newVol}%`)
          break
        }
        case 'menu': {
          const newVol = await controls.adjustVolume(-0.1)
          if (newVol !== undefined) showToast(`Volume: ${newVol}%`)
          break
        }
      }
    },
    [isLoggedIn, controls, showToast],
  )

  // ── Keyboard Shortcuts ───────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e) {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      const map = {
        Space:      'play_pause',
        ArrowRight: 'next',
        ArrowLeft:  'prev',
        ArrowUp:    'vol',
        ArrowDown:  'menu',
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

  return (
    <>
      <Particles />

      <IpodShell>
        {isLoggedIn ? (
          <NowPlayingScreen
            playerState={playerState}
            progressMs={progressMs}
            durationMs={durationMs}
            progressPct={progressPct}
          />
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
      </IpodShell>

      <ClickWheel onAction={handleWheelAction} />

      <Toast message={toastMessage} />
    </>
  )
}