'use client'

import {formatHex} from 'culori'
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
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

const BOX_SIZE = 32
const chars = `!§$%/()=?*#<>-_.:,;+0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`

type StrategyType = 'insert-during-render' | 'no-css-in-js' | 'use-insertion-effect'
type LayoutThrashingType = 'force' | 'avoid'

export default function Benchmark(props: {
  children: React.ReactNode
  strategy: StrategyType
  layoutTrashing: LayoutThrashingType
  fps: 'show' | 'hide'
  distribute: boolean
  maxIterations: number
  interval: number
}) {
  const {children, strategy, layoutTrashing, fps, distribute, maxIterations, interval} = props
  const [tick, setTick] = useState(1)
  const [tock, setTock] = useState(0)
  const [cells, setCells] = useState<string[]>([])
  const [renderedCells, setRenderedCells] = useState<Set<string>>(() => new Set())
  const [cols, setCols] = useState(1)
  const [hueShiftPalette, setHueShiftPalette] =
    useState<ReturnType<typeof createHueShiftPalette>>(generateHueShiftPalette)

  const background = formatHex({
    ...hueShiftPalette.at(-1)!,
    l: 5,
    c: 25,
  })

  const handleTick = useEffectEvent(() => {
    setHueShiftPalette(generateHueShiftPalette())
    // Reset rendered cells
    setRenderedCells(new Set([...cells]))

    if (strategy === 'use-insertion-effect') {
      clearUseInsertionEffectRules()
    } else if (strategy === 'insert-during-render') {
      clearInsertDuringRenderRules()
    }
  })
  useEffect(() => {
    if (tick > tock || tock >= maxIterations) {
      return
    }
    const timeout = setTimeout(() => {
      setTick((prev) => ++prev)
      handleTick()
    }, interval)
    return () => clearTimeout(timeout)
  }, [tick, tock, handleTick, maxIterations, interval])

  const registerRenderedCell = (cell: string) => {
    // startTransition(() => setRenderedCells((prev) => new Set(prev).add(cell)))
    setRenderedCells((prev) => {
      // No-op to prevent infinite loop
      if (prev.size === 0) return prev
      prev.delete(cell)
      // Only return a new Set, and thus, schedule a React update, if the Set is now empty
      return prev.size === 0 ? new Set() : prev
    })
  }
  useEffect(() => {
    if (tick === tock || cells.length < 1 || renderedCells.size > 0) {
      return
    }
    const timeout = setTimeout(() => setTock(tick), interval)
    return () => clearTimeout(timeout)
  }, [cells, interval, renderedCells, tick, tock])

  useEffect(() => {
    return () => {
      // Clear out the StyleSheetManager rules and cache, to prevent cached rules to skew the results
      if (strategy === 'use-insertion-effect') {
        clearUseInsertionEffectRules()
      } else if (strategy === 'insert-during-render') {
        clearInsertDuringRenderRules()
      }
    }
  }, [strategy])

  useLayoutEffect(() => {
    const handler = () => {
      const {width} = cellsRef.current!.getBoundingClientRect()
      const cols = Math.floor(width / BOX_SIZE)
      const height = window.innerHeight - 16
      const rows = Math.max(Math.ceil(height / BOX_SIZE) - 1, 1)
      const cells: string[] = []
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          cells.push(`${y}:${x}`)
        }
      }
      startTransition(() => {
        setTick(1)
        setTock(0)
        setCols(cols)
        setCells(cells)
        setRenderedCells(new Set([...cells]))
      })
    }
    window.addEventListener('resize', handler, {passive: true})
    handler()
    return () => window.removeEventListener('resize', handler)
  }, [])

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
      />
      {fps === 'show' && (
        <>
          <Clock tick={tick} tock={tock} />
          <Stats />
        </>
      )}
    </main>
  )
}
Benchmark.displayName = 'Benchmark'

function Cells(props: {
  cells: string[]
  cellsRef: React.RefObject<HTMLDivElement>
  cols: number
  distribute: boolean
  hueShiftPalette: ReturnType<typeof createHueShiftPalette>
  layoutTrashing: LayoutThrashingType
  registerRenderedCell: (cell: string) => void
  strategy: StrategyType
  tick: number
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
  } = props

  const palette = hueShiftPalette.map((color) => formatHex(color))

  return (
    <div
      ref={cellsRef}
      className="grid w-full justify-stretch"
      style={{
        textAlign: 'center',
        grid: `minmax(${BOX_SIZE}px, min-content) / repeat(${cols}, minmax(${BOX_SIZE}px, 1fr))`,
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
}) {
  const {palette, layoutTrashing, strategy, distribute, id, registerRenderedCell} = props
  const tick = useDeferredValue(props.tick)

  const cellRef = useRef<HTMLDivElement>(null)
  const [_cell, setCell] = useState({
    tick: 0,
    char: '',
    fill: palette[Math.floor(Math.random() * palette.length)],
  })
  const cell = useDeferredValue(_cell)

  useEffect(() => {
    if (cellRef.current && cell.tick === tick) {
      registerRenderedCell(id)
      cellRef.current.animate(
        [
          {backgroundColor: cell.fill, color: cell.fill},
          {backgroundColor: 'transparent', color: cell.fill},
        ],
        {duration: 700, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards'},
      )
    }
  }, [cell.fill, cell.tick, id, registerRenderedCell, tick])

  const renderedStrategy =
    cell.tick === tick ? (
      strategy === 'use-insertion-effect' ? (
        <StrategyUseInsertionEffect char={cell.char} layoutTrashing={layoutTrashing} />
      ) : strategy === 'insert-during-render' ? (
        <StrategyInsertDuringRender char={cell.char} layoutTrashing={layoutTrashing} />
      ) : null
    ) : null

  return (
    <div ref={cellRef} className="cell" data-strategy={strategy} data-char={cell.char || ' '}>
      {layoutTrashing === 'force' && (
        <LayoutThrashing cellRef={cellRef} shouldRenderSlowly={tick === cell.tick && !!cell.char} />
      )}
      {renderedStrategy}
      <DistributedCell
        cell={cell}
        distribute={distribute}
        palette={palette}
        setCell={setCell}
        tick={tick}
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
}) {
  const {cell, tick, palette, distribute, setCell} = props

  useEffect(() => {
    if (tick === cell.tick) return
    const fill = palette[Math.floor(Math.random() * palette.length)]
    const setRandomChar = () =>
      setCell({
        char: chars[Math.floor(Math.random() * chars.length)],
        tick,
        fill,
      })
    // It can either execute somewhat later, which distributes load a little
    if (distribute) {
      const timeout = setTimeout(setRandomChar, Math.random() * 1000)
      return () => clearTimeout(timeout)
    }
    // Or execute right away, which effectively creates hundreds of textgeometries at once
    else setRandomChar()
  }, [cell.tick, distribute, palette, setCell, tick])

  return null
}
DistributedCell.displayName = 'DistributedCell'
