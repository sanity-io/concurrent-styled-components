'use client'

import {useEffect, useRef} from 'react'

const SPEED = 0.003 / Math.PI
const FRAMES = 10

export default function Clock(props: {tick: number; pending: boolean}) {
  const {tick, pending} = props
  const faceRef = useRef<SVGCircleElement | null>(null)
  const arcGroupRef = useRef<SVGGElement | null>(null)
  const clockHandRef = useRef<SVGPathElement | null>(null)
  const hitCounterRef = useRef(0)
  const rotationRef = useRef(0)
  const t0Ref = useRef(Date.now())
  const arcsRef = useRef<{rotation: number; td: number}[]>([])

  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const td = now - t0Ref.current
      rotationRef.current = (rotationRef.current + SPEED * td) % (2 * Math.PI)
      t0Ref.current = now

      arcsRef.current.push({rotation: rotationRef.current, td})

      let lx: number, ly: number, tx: number, ty: number
      if (arcsRef.current.length > FRAMES) {
        arcsRef.current.forEach(({rotation, td}, i) => {
          lx = tx
          ly = ty
          const r = 145
          tx = 155 + r * Math.cos(rotation)
          ty = 155 + r * Math.sin(rotation)
          const bigArc = SPEED * td < Math.PI ? '0' : '1'
          const path = `M${tx} ${ty}A${r} ${r} 0 ${bigArc} 0 ${lx} ${ly}L155 155`
          const hue = 120 - Math.min(120, td / 4)
          const colour = `hsl(${hue}, 100%, ${60 - i * (30 / FRAMES)}%)`
          if (i !== 0) {
            const arcEl = arcGroupRef.current?.children[i - 1]
            arcEl?.setAttribute('d', path)
            arcEl?.setAttribute('fill', colour)
          }
        })
        clockHandRef.current?.setAttribute('d', `M155 155L${tx!} ${ty!}`)
        arcsRef.current.shift()
      }

      if (hitCounterRef.current > 0) {
        faceRef.current?.setAttribute('fill', `hsla(0, 0%, ${hitCounterRef.current}%, 0.95)`)
        hitCounterRef.current -= 1
      } else {
        hitCounterRef.current = 0
        faceRef.current?.setAttribute('fill', 'hsla(0, 0%, 5%, 0.95)')
      }

      frameRef = requestAnimationFrame(animate)
    }

    let frameRef = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameRef)
  }, [])

  const paths = new Array(FRAMES)
  for (let i = 0; i < FRAMES; i++) {
    paths.push(<path key={i} />)
  }

  return (
    <div className="fixed left-2.5 top-14 size-[310px] origin-top-left scale-[0.2] rounded-[200px] shadow-[0_0_10px_10px_rgba(0,0,0,0.2)]">
      <svg height="310" width="310">
        <defs>
          <filter id="blackOutlineEffect" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" result="MORPH" operator="dilate" radius="10" />
            <feColorMatrix
              in="MORPH"
              result="BLACKENED"
              type="matrix"
              values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 1 0"
            />
            <feMerge>
              <feMergeNode in="BLACKENED" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          className="fill-black stroke-white [stroke-width:10px]"
          cx={155}
          cy={155}
          r={150}
          ref={faceRef}
        />
        <g ref={arcGroupRef}>{paths}</g>
        <path
          className="stroke-white [stroke-linecap:round] [stroke-width:10px]"
          ref={clockHandRef}
        />
        <text
          className={`transition-colors ${pending ? 'fill-teal-400 duration-0' : 'fill-white'}`}
          x="155"
          y="160"
          fill="white"
          fontSize="70"
          filter="url(#blackOutlineEffect)"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {tick}
        </text>
      </svg>
    </div>
  )
}
