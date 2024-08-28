import {memo} from 'react'

export const LayoutThrashing = memo(function LayoutThrashing({
  cellRef,
  shouldRenderSlowly,
}: {
  cellRef: React.RefObject<HTMLDivElement>
  shouldRenderSlowly: boolean
}) {
  if (shouldRenderSlowly && cellRef.current) {
    // Start measuring before layout trashing, so the total render time is within reasonable bounds
    const startTime = performance.now()
    console.time('LayoutThrashing...')
    /**
     * By calling getComputedStyle and getBoundingClientRect, we force the browser to recalculate the layout, which is not ideal during render
     */
    console.log(
      window.getComputedStyle(cellRef.current, ':before').content,
      cellRef.current.getBoundingClientRect(),
    )
    /**
     * We also slow down render itself, to make it even worse,
     * as it prolongs the duration of the React render while it's processing a
     * non-blocking state update (triggered by the <Cell /> using useDeferredValue)
     */
    const threshold = Math.random() * 0.0001
    while (performance.now() - startTime < threshold) {
      // Do nothing for 1 ms per item to emulate extremely slow code
    }
    console.timeEnd('LayoutThrashing...')
  }

  return null
})

LayoutThrashing.displayName = 'memo(LayoutThrashing)'
