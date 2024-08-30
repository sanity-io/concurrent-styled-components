import {memo, useLayoutEffect, useState} from 'react'

const maxTicks = 10

export const LayoutThrashing = memo(function LayoutThrashing({
  cellRef,
  shouldRenderSlowly,
  startTransition,
}: {
  cellRef: React.RefObject<HTMLDivElement>
  shouldRenderSlowly: boolean
  startTransition: (callback: () => void) => void
}) {
  const [tick, setTick] = useState(1)

  useLayoutEffect(() => {
    if (shouldRenderSlowly && cellRef.current) {
      // Layout trash early
      const cell = cellRef.current
      console.log(window.getComputedStyle(cell, ':before').content, cell.getBoundingClientRect())

      const raf = requestAnimationFrame(() =>
        startTransition(() => setTick((tick) => (tick > maxTicks ? tick : tick + 1))),
      )
      return () => cancelAnimationFrame(raf)
    }
  }, [cellRef, shouldRenderSlowly, startTransition])

  if (shouldRenderSlowly && cellRef.current && tick) {
    const cell = cellRef.current
    console.time('LayoutThrashing...')
    // Start measuring before layout trashing, so the total render time is within reasonable bounds
    const startTime = performance.now()
    /**
     * By calling getComputedStyle and getBoundingClientRect, we force the browser to recalculate the layout, which is not ideal during render
     */
    console.log(window.getComputedStyle(cell, ':before').content, cell.getBoundingClientRect())
    /**
     * We also slow down render itself, to make it even worse,
     * as it prolongs the duration of the React render while it's processing a
     * non-blocking state update (triggered by the <Cell /> using useDeferredValue)
     */
    const threshold = Math.random() * 0.1
    while (performance.now() - startTime < threshold) {
      // Do nothing to emulate extremely slow code
    }
    console.timeEnd('LayoutThrashing...')
  }

  return null
})

LayoutThrashing.displayName = 'memo(LayoutThrashing)'
