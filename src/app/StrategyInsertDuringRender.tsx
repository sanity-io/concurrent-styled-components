import {__PRIVATE__, styled} from 'styled-components'

export function StrategyInsertDuringRender(props: {
  char: string
  layoutTrashing: 'force' | 'avoid'
}) {
  const {char, layoutTrashing} = props
  const fontWeight = Math.round(Math.random() * 8 + 1) * 100
  return layoutTrashing === 'force' ? (
    <CellForceTrashingLayout $char={char} $fontWeight={fontWeight} />
  ) : (
    <CellAvoidTrashingLayout $char={char} />
  )
}

StrategyInsertDuringRender.displayName = 'StrategyInsertDuringRender'

const CellAvoidTrashingLayout = styled.span<{$char: string}>`
  .cell:has(&)::before {
    content: '${(props) => props.$char || ' '}';
  }
`

const CellForceTrashingLayout = styled.span<{
  $char: string
  $fontWeight: number
}>`
  .cell:where(:has(&), [data-char='${(props) => props.$char}'])::before {
    content: '${(props) => props.$char || ' '}';
    font-weight: ${(props) => props.$fontWeight};
  }
`

// Clear out the StyleSheetManager rules and cache, to prevent cached rules to skew the results
export function clearRules() {
  const {mainSheet} = __PRIVATE__
  for (const name of mainSheet.names.keys()) {
    mainSheet.clearRules(name)
  }
}
