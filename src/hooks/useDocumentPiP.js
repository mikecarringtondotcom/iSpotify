import { useCallback, useState } from 'react'

const PIP_SUPPORTED =
  typeof window !== 'undefined' && 'documentPictureInPicture' in window

export function useDocumentPiP() {
  const [pipWindow, setPipWindow] = useState(null)

  const openPip = useCallback(
    async ({ width, height, background = '#fff', x, y } = {}) => {
      if (!PIP_SUPPORTED || pipWindow) return pipWindow

      const win = await window.documentPictureInPicture.requestWindow({ width, height })

      if (typeof x === 'number' && typeof y === 'number') {
        try { win.moveTo(x, y) } catch { /* browser refused */ }
      }

      document
        .querySelectorAll('style, link[rel="stylesheet"]')
        .forEach((el) => win.document.head.appendChild(el.cloneNode(true)))

      Object.assign(win.document.body.style, {
        margin: '0',
        padding: '0',
        background,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })

      win.addEventListener('pagehide', () => setPipWindow(null), { once: true })

      setPipWindow(win)
      return win
    },
    [pipWindow],
  )

  const closePip = useCallback(() => {
    pipWindow?.close()
  }, [pipWindow])

  return { pipWindow, openPip, closePip, isSupported: PIP_SUPPORTED }
}
