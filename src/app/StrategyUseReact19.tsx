/**
 * Uses an approach similar to https://react.dev/reference/react-dom/components/style#rendering-an-inline-css-stylesheet but compatible with styled-components
 */

import {__PRIVATE__, keyframes, styled} from '../components/styled-components-19'
import type {Keyframes} from '../components/styled-components-19/types'

export function StrategyUseReact19(props: {
  char: string
  layoutTrashing: 'force' | 'avoid'
  fill: string
  duration: number
}) {
  const {char, layoutTrashing, fill, duration} = props
  const fontWeight = Math.round(Math.random() * 8 + 1) * 100
  const animation = keyframes`
  0% {
    background-color: ${fill};
    color: ${fill};
  }
  100% {
    background-color: transparent;
    color: ${fill};
  }
`
  return layoutTrashing === 'force' ? (
    <CellForceTrashingLayout
      $char={char}
      $duration={duration}
      $animation={animation}
      $fontWeight={fontWeight}
    />
  ) : (
    <CellAvoidTrashingLayout $char={char} $duration={duration} $animation={animation} />
  )
}

StrategyUseReact19.displayName = 'StrategyUseReact19'

const StyledCell = styled.span<{
  $char: string
  $animation: Keyframes
  $duration: number
  $fontWeight?: number
}>`
  .cell:has(&) {
    animation: ${(props) => props.$animation} ${(props) => props.$duration}ms
      cubic-bezier(0, 0, 0.2, 1) forwards;
  }
`

const CellAvoidTrashingLayout = styled(StyledCell)`
  .cell:has(&)::before {
    content: '${(props) => props.$char || ' '}';
  }
`

const CellForceTrashingLayout = styled(StyledCell)`
  .cell.cell:where(:has(&), [data-char='${(props) => props.$char}'])::before {
    content: '${(props) => props.$char || ' '}';
    font-weight: ${(props) => props.$fontWeight};
    padding-right: ${(props) => (props.$fontWeight || 100) / 100}px;
  }
  .cell:where(:has(&), [data-char='${(props) => props.$char}'], [data-char])::before {
    padding-left: ${(props) => (props.$fontWeight || 100) / 100}px;
  }
`

// Clear out the StyleSheetManager rules and cache, to prevent cached rules to skew the results
export function clearRules() {
  const {mainSheet} = __PRIVATE__
  for (const name of mainSheet.names.keys()) {
    mainSheet.clearRules(name)
  }

  console.count('clearRules')
  for (const node of document.querySelectorAll('style[data-precedence="sc-scoped]')) {
    document.head.removeChild(node)
  }
}
