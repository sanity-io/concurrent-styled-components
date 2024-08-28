'use client'

import Stats from '@trillionhq/stats.js'
import {useEffect} from 'react'

export default function StatsComponent() {
  useEffect(() => {
    const stats = Stats()
    stats.showPanel(0)
    document.body.appendChild(stats.dom)

    stats.begin()

    const animate = () => {
      stats.update()
      raf = requestAnimationFrame(animate)
    }

    let raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      stats.end()
      document.body.removeChild(stats.dom)
    }
  }, [])

  return null
}
