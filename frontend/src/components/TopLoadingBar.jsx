import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function TopLoadingBar() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(false)
  const location = useLocation()
  const timerRef = useRef(null)
  const prevPath = useRef(location.pathname + location.search)

  useEffect(() => {
    const currentPath = location.pathname + location.search
    if (currentPath === prevPath.current) return
    prevPath.current = currentPath

    // Start loading
    setVisible(true)
    setDone(false)
    setProgress(20)

    // Slowly progress to ~80%
    let p = 20
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      p += Math.random() * 10 + 3
      if (p >= 80) {
        p = 80 + Math.random() * 5
        clearInterval(timerRef.current)
      }
      setProgress(Math.min(p, 90))
    }, 300)

    // Complete after short delay (content should be loading)
    const completeTimer = setTimeout(() => {
      clearInterval(timerRef.current)
      setProgress(100)
      setDone(true)
      setTimeout(() => {
        setVisible(false)
        setProgress(0)
        setDone(false)
      }, 500)
    }, 600)

    return () => {
      clearInterval(timerRef.current)
      clearTimeout(completeTimer)
    }
  }, [location])

  if (!visible) return null

  return (
    <div
      className={`top-loading-bar${done ? ' done' : ''}`}
      style={{ width: `${progress}%` }}
    />
  )
}
