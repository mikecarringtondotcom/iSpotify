import { useState, useEffect, useRef, useCallback } from 'react'
import { transferPlayback } from '../utils/spotify'

/**
 * Manages the Spotify Web Playback SDK lifecycle.
 * Returns player controls and the current playback state.
 */
export function useSpotifyPlayer(accessToken) {
  const playerRef = useRef(null)
  const [deviceId, setDeviceId] = useState(null)
  const [playerState, setPlayerState] = useState(null)
  const [error, setError] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!accessToken) return

    // The SDK fires this global when it's loaded
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'iSpotify',
        getOAuthToken: (cb) => cb(accessToken),
        volume: 1.0,
      })

      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id)
        setIsReady(true)
        transferPlayback(accessToken, device_id)
      })

      player.addListener('not_ready', () => {
        setDeviceId(null)
        setIsReady(false)
      })

      player.addListener('player_state_changed', (state) => {
        setPlayerState(state ?? null)
      })

      player.addListener('authentication_error', () => {
        setError('auth')
        localStorage.removeItem('spotify_token')
      })

      player.addListener('account_error', () => {
        setError('premium_required')
      })

      player.addListener('initialization_error', ({ message }) => {
        setError(`init: ${message}`)
      })

      player.connect()
      playerRef.current = player
    }

    // If SDK already loaded before this effect ran, call it immediately
    if (window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady()
    }

    return () => {
      playerRef.current?.disconnect()
      playerRef.current = null
    }
  }, [accessToken])

  const togglePlay = useCallback(() => playerRef.current?.togglePlay(), [])
  const nextTrack = useCallback(() => playerRef.current?.nextTrack(), [])
  const previousTrack = useCallback(() => playerRef.current?.previousTrack(), [])

  return {
    playerState,
    isReady,
    deviceId,
    error,
    controls: { togglePlay, nextTrack, previousTrack },
  }
}
