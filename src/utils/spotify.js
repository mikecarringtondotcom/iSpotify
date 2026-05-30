export const CLIENT_ID = '3c981d418ad24a4f977cde7279b37496'
export const REDIRECT_URI =
  window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5173/'
    : 'https://i-spotify-ten.vercel.app/'

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
].join(' ')

// Generate and store a code verifier for PKCE
async function generateCodeVerifier() {
  const array = crypto.getRandomValues(new Uint8Array(64))
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function buildAuthUrl() {
  const verifier = await generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  sessionStorage.setItem('pkce_verifier', verifier)

  const url = new URL('https://accounts.spotify.com/authorize')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', REDIRECT_URI)
  url.searchParams.set('scope', SPOTIFY_SCOPES)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('code_challenge', challenge)
  return url.toString()
}

const TOKEN_KEY = 'spotify_token'
const REFRESH_KEY = 'spotify_refresh_token'
const EXPIRES_KEY = 'spotify_token_expires_at'

function saveTokens({ access_token, refresh_token, expires_in }) {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token)
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)
  if (expires_in) {
    // Refresh 60s before expiry to avoid racing the server clock.
    localStorage.setItem(EXPIRES_KEY, String(Date.now() + (expires_in - 60) * 1000))
  }
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EXPIRES_KEY)
}

export async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem('pkce_verifier')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })
  const data = await res.json()
  if (data.access_token) saveTokens(data)
  return data.access_token
}

let refreshInFlight = null
export async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) return null
  refreshInFlight = (async () => {
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: refresh,
        }),
      })
      if (!res.ok) return null
      const data = await res.json()
      if (!data.access_token) return null
      // Spotify may or may not rotate the refresh token; keep the old one if absent.
      saveTokens({ refresh_token: refresh, ...data })
      window.dispatchEvent(new CustomEvent('spotify:token-updated', { detail: data.access_token }))
      return data.access_token
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

export async function getValidAccessToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) || 0)
  if (token && Date.now() < expiresAt) return token
  return refreshAccessToken()
}

export async function transferPlayback(accessToken, deviceId) {
  const res = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  })

  if (!res.ok) {
    throw new Error('Failed to transfer playback')
  }
}

export async function fetchUserPlaylists(accessToken) {
  const all = []
  let url = 'https://api.spotify.com/v1/me/playlists?limit=50'
  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      const err = new Error(`Failed to fetch playlists (${res.status})`)
      err.status = res.status
      throw err
    }
    const data = await res.json()
    for (const item of data.items ?? []) {
      if (item) all.push(item)
    }
    url = data.next
  }
  return all
}

export async function fetchLikedSongs(accessToken) {
  const LIMIT = 50

  async function fetchPage(offset) {
    const res = await fetch(
      `https://api.spotify.com/v1/me/tracks?limit=${LIMIT}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (!res.ok) {
      const err = new Error(`Failed to fetch liked songs (${res.status})`)
      err.status = res.status
      throw err
    }
    return res.json()
  }

  const first = await fetchPage(0)
  const total = first.total ?? 0

  const restOffsets = []
  for (let o = LIMIT; o < total; o += LIMIT) restOffsets.push(o)
  const restPages = await Promise.all(restOffsets.map(fetchPage))

  const all = []
  for (const page of [first, ...restPages]) {
    for (const item of page.items ?? []) {
      if (item?.track) all.push(item.track)
    }
  }
  return all
}

async function playRequest(accessToken, deviceId, body) {
  const url = `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`
  const init = {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
  let res = await fetch(url, init)
  if (res.status === 404) {
    // Device went idle — reactivate it, then retry once.
    await transferPlayback(accessToken, deviceId)
    res = await fetch(url, init)
  }
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to start playback (${res.status})`)
  }
}

export async function playTracks(accessToken, deviceId, uris, offsetIndex = 0) {
  await playRequest(accessToken, deviceId, { uris, offset: { position: offsetIndex } })
}

export async function setShuffle(accessToken, deviceId, state) {
  const params = new URLSearchParams({ state: String(state) })
  if (deviceId) params.set('device_id', deviceId)
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/shuffle?${params.toString()}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to set shuffle (${res.status})`)
  }
}

export async function playContext(accessToken, deviceId, contextUri) {
  await playRequest(accessToken, deviceId, { context_uri: contextUri, offset: { position: 0 } })
}

export function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}