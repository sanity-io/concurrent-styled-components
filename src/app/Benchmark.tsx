'use client'

import {formatHex} from 'culori'
import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {useEffectEvent} from 'use-effect-event'

import {createHueShiftPalette, generateHueShiftPalette} from '~/lib/palette'

import Clock from './Clock'
import {LayoutThrashing} from './LayoutThrashing'
import Stats from './Stats'
import {
  clearRules as clearInsertDuringRenderRules,
  StrategyInsertDuringRender,
} from './StrategyInsertDuringRender'
import {
  clearRules as clearUseInsertionEffectRules,
  StrategyUseInsertionEffect,
} from './StrategyUseInsertionEffect'
import {clearRules as clearUseReact18Rules, StrategyUseReact18} from './StrategyUseReact18'

const chars = `!§$%/()=?*#<>-_.:,;+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`

type StrategyType =
  | 'insert-during-render'
  | 'no-css-in-js'
  | 'use-insertion-effect'
  | 'use-react-18'
  | 'use-react-19'
type LayoutThrashingType = 'force' | 'avoid'

export default function Benchmark(props: {
  children: React.ReactNode
  strategy: StrategyType
  layoutTrashing: LayoutThrashingType
  fps: 'show' | 'hide'
  distribute: boolean
  maxIterations: number
  interval: number
  pending: boolean
  size: number
  startTransition: (callback: () => void) => void
}) {
  const {
    children,
    strategy,
    layoutTrashing,
    fps,
    distribute,
    maxIterations,
    interval,
    pending,
    size,
    startTransition,
  } = props
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const cols = Math.floor(width / size)
  const rows = Math.max(Math.ceil(height / size) - 1, 1)
  const cells: string[] = []
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      cells.push(`${y}:${x}`)
    }
  }

  const [tick, setTick] = useState(1)
  const [renderedCells] = useState(() => new Set<string>())
  const [hueShiftPalette, setHueShiftPalette] =
    useState<ReturnType<typeof createHueShiftPalette>>(generateHueShiftPalette)

  const background = formatHex({
    ...hueShiftPalette.at(-1)!,
    l: 5,
    c: 25,
  })

  const handleTick = useEffectEvent(() => {
    if (tick >= maxIterations) {
      console.log('maxIterations reached, stopping ')
      return
    }

    if (renderedCells.size >= cells.length) {
      startTransition(() => {
        setHueShiftPalette(generateHueShiftPalette())
        console.log('rendered cells', renderedCells.size, cells.length)
        // Reset rendered cells
        renderedCells.clear()
        setTick((prev) => ++prev)
      })

      if (strategy === 'use-react-18') {
        clearUseReact18Rules()
      } else if (strategy === 'use-insertion-effect') {
        clearUseInsertionEffectRules()
      } else if (strategy === 'insert-during-render') {
        clearInsertDuringRenderRules()
      }
    }
  })
  const stopInterval = tick >= maxIterations
  useEffect(() => {
    if (stopInterval) {
      console.log('maxIterations reached, stopping interval')
      return
    }
    const id = setInterval(() => handleTick(), interval)
    // Schedule an eager first tick, so that dragging the interval slider feels faster
    const timeout = requestIdleCallback(() => handleTick(), {timeout: interval / 2})
    return () => {
      clearInterval(id)
      cancelIdleCallback(timeout)
    }
  }, [handleTick, interval, stopInterval])

  const registerRenderedCell = (cell: string) => renderedCells.add(cell)

  useEffect(() => {
    return () => {
      // Clear out the StyleSheetManager rules and cache, to prevent cached rules to skew the results
      if (strategy === 'use-react-18') {
        clearUseReact18Rules()
      } else if (strategy === 'use-insertion-effect') {
        clearUseInsertionEffectRules()
      } else if (strategy === 'insert-during-render') {
        clearInsertDuringRenderRules()
      }
    }
  }, [strategy])

  useLayoutEffect(() => {
    const handler = () => {
      startTransition(() => {
        setWidth(cellsRef.current!.getBoundingClientRect().width || window.innerWidth - 16)
        setHeight(window.innerHeight - 16)
      })
    }
    window.addEventListener('resize', handler, {passive: true})
    handler()
    return () => window.removeEventListener('resize', handler)
  }, [startTransition])

  const cellsRef = useRef<HTMLDivElement>(null)

  return (
    <main
      className="flex h-full min-h-[350px] w-full flex-col items-center gap-2 overflow-auto overscroll-contain p-2 transition-colors duration-700 ease-out"
      style={{backgroundColor: background}}
    >
      <div
        className="fixed right-2 top-2 w-96 overflow-auto rounded-xl shadow"
        style={{maxHeight: 'calc(100vh - 1rem)', maxWidth: '60vw'}}
      >
        {children}
      </div>
      <Cells
        key={strategy}
        cells={cells}
        cellsRef={cellsRef}
        cols={cols}
        distribute={distribute}
        hueShiftPalette={hueShiftPalette}
        layoutTrashing={layoutTrashing}
        registerRenderedCell={registerRenderedCell}
        strategy={strategy}
        tick={tick}
        size={size}
        startTransition={startTransition}
        interval={interval}
      />
      {fps === 'show' && (
        <>
          <Clock tick={tick} pending={pending} />
          <Stats />
        </>
      )}
    </main>
  )
}
Benchmark.displayName = 'Benchmark'

function Cells(props: {
  cells: string[]
  cellsRef: React.RefObject<HTMLDivElement | null>
  cols: number
  distribute: boolean
  hueShiftPalette: ReturnType<typeof createHueShiftPalette>
  layoutTrashing: LayoutThrashingType
  registerRenderedCell: (cell: string) => void
  strategy: StrategyType
  tick: number
  size: number
  startTransition: (callback: () => void) => void
  interval: number
}) {
  const {
    cells,
    cellsRef,
    cols,
    distribute,
    hueShiftPalette,
    layoutTrashing,
    registerRenderedCell,
    strategy,
    tick,
    startTransition,
    size,
    interval,
  } = props

  const palette = hueShiftPalette.map((color) => formatHex(color))

  return (
    <div
      ref={cellsRef}
      className="grid w-full justify-stretch"
      style={{
        textAlign: 'center',
        grid: `minmax(${size}px, min-content) / repeat(${cols}, minmax(${size}px, 1fr))`,
      }}
    >
      {cells.map((cell) => (
        <Cell
          key={cell}
          id={cell}
          distribute={distribute}
          palette={palette}
          layoutTrashing={layoutTrashing}
          strategy={strategy}
          tick={tick}
          registerRenderedCell={registerRenderedCell}
          startTransition={startTransition}
          interval={interval}
          size={size}
        />
      ))}
    </div>
  )
}
Cells.displayName = 'Cells'

function Cell(props: {
  palette: string[]
  id: string
  layoutTrashing: 'force' | 'avoid'
  strategy: StrategyType
  distribute: boolean
  registerRenderedCell: (cell: string) => void
  tick: number
  size: number
  startTransition: (callback: () => void) => void
  interval: number
}) {
  const {
    palette,
    layoutTrashing,
    strategy,
    distribute,
    id,
    registerRenderedCell,
    tick,
    size,
    startTransition,
  } = props
  const duration = 700

  const cellRef = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState({
    tick: 0,
    char: '',
    fill: palette[Math.floor(Math.random() * palette.length)],
  })

  useLayoutEffect(() => {
    if (cell.tick === tick) {
      if (strategy === 'no-css-in-js') {
        cellRef.current?.animate(
          [
            {backgroundColor: cell.fill, color: cell.fill},
            {backgroundColor: 'transparent', color: cell.fill},
          ],
          {duration, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards'},
        )
      }

      const timeout = setTimeout(() => registerRenderedCell(id), duration)
      return () => clearTimeout(timeout)
    }
  }, [cell.fill, cell.tick, id, registerRenderedCell, strategy, tick])

  const renderedStrategy =
    cell.tick === tick ? (
      strategy === 'use-react-18' ? (
        <StrategyUseReact18
          char={cell.char}
          layoutTrashing={layoutTrashing}
          duration={duration}
          fill={cell.fill}
        />
      ) : strategy === 'use-insertion-effect' ? (
        <StrategyUseInsertionEffect
          char={cell.char}
          layoutTrashing={layoutTrashing}
          duration={duration}
          fill={cell.fill}
        />
      ) : strategy === 'insert-during-render' ? (
        <StrategyInsertDuringRender
          char={cell.char}
          layoutTrashing={layoutTrashing}
          duration={duration}
          fill={cell.fill}
        />
      ) : null
    ) : null

  return (
    <div
      ref={cellRef}
      className="cell"
      data-strategy={strategy}
      data-char={cell.char || ' '}
      style={{fontSize: `${size / 2}px`}}
    >
      {layoutTrashing === 'force' && (
        <LayoutThrashing
          cellRef={cellRef}
          shouldRenderSlowly={tick === cell.tick && !!cell.char}
          startTransition={startTransition}
        />
      )}
      {renderedStrategy}
      <DistributedCell
        cell={cell}
        distribute={distribute}
        palette={palette}
        setCell={setCell}
        tick={tick}
        startTransition={startTransition}
      />
    </div>
  )
}
Cell.displayName = 'Cell'

function DistributedCell(props: {
  cell: {
    tick: number
    char: string
    fill: string
  }
  distribute: boolean
  palette: string[]
  tick: number
  setCell: React.Dispatch<
    React.SetStateAction<{
      tick: number
      char: string
      fill: string
    }>
  >
  startTransition: (callback: () => void) => void
}) {
  const {cell, tick, palette, distribute, setCell, startTransition} = props

  useEffect(() => {
    if (tick === cell.tick) return
    const fill = palette[Math.floor(Math.random() * palette.length)]
    const setRandomChar = () =>
      startTransition(() =>
        setCell({
          char: chars[Math.floor(Math.random() * chars.length)],
          tick,
          fill,
        }),
      )
    // It can either execute somewhat later, which distributes load a little
    if (distribute) {
      const timeout = setTimeout(setRandomChar, Math.random() * 1000)
      return () => clearTimeout(timeout)
    }
    // Or execute right away, which effectively creates hundreds of textgeometries at once
    else setRandomChar()
  }, [cell.tick, distribute, palette, setCell, startTransition, tick])

  return null
}
DistributedCell.displayName = 'DistributedCell'
