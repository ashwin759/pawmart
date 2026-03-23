import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [show, setShow] = useState(() => {
    // Only show on first visit per session
    return !sessionStorage.getItem('pawmart_loaded')
  })
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!show) return

    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1400)

    const hideTimer = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('pawmart_loaded', '1')
    }, 1900)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [show])

  if (!show) return null

  return (
    <div className={`splash-screen${fadeOut ? ' fade-out' : ''}`}>
      <div className="splash-logo">🐾</div>
      <div className="splash-title">PawMart</div>
      <div className="splash-tagline">Loading your pet experience...</div>
      <div className="splash-loader" />
      <div className="splash-paws">
        <span>🐾</span>
        <span>🐾</span>
        <span>🐾</span>
      </div>
    </div>
  )
}
