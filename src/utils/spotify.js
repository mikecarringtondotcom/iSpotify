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
  return data.access_token
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

export function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}