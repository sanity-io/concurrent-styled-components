'use client'

import sanityScPkg from '@sanity/styled-components/package.json'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useId, useOptimistic} from 'react'
import scPkg from 'styled-components/package.json'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/components/ui/card'
import {Checkbox} from '~/components/ui/checkbox'
import {Label} from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

import Benchmark from './Benchmark'

const {version: scVersion} = scPkg
const {version: sanityScVersion} = sanityScPkg

const keys = {
  strategy: 'strategy',
  layoutTrashing: 'layoutTrashing',
  fps: 'fps',
  mode: 'mode',
  distribute: 'distribute',
  interval: 'interval',
  maxIterations: 'maxIterations',
}

export default function BenchmarkControls() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)

    return params.toString()
  }

  const pushQueryString = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value), {scroll: false})
  }

  const distribute = validateDistribute(searchParams.get(keys.distribute))
  const interval = validateInterval(searchParams.get(keys.interval))
  const maxIterations = validateMaxIterations(searchParams.get(keys.maxIterations))

  const strategyId = useId()
  const layoutTrashingId = useId()
  const fpsId = useId()
  const [strategy, setPendingStrategy] = useOptimistic<ReturnType<typeof validateStrategy>>(
    validateStrategy(searchParams.get(keys.strategy)),
  )
  const [layoutTrashing, setPendingLayoutTrashing] = useOptimistic<
    ReturnType<typeof validateLayoutTrashing>
  >(validateLayoutTrashing(searchParams.get(keys.layoutTrashing)))
  const [fps, setPendingFps] = useOptimistic<ReturnType<typeof validateFps>>(
    validateFps(searchParams.get(keys.fps)),
  )

  return (
    <Benchmark
      strategy={strategy}
      layoutTrashing={layoutTrashing}
      fps={fps}
      distribute={distribute}
      interval={interval}
      maxIterations={maxIterations}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Styled Components & Concurrent Rendering</CardTitle>
          <CardDescription className="text-pretty">
            Compare inserting CSS during render vs insertion effects.
            <br />
            <a
              className="text-sky-600 hover:underline focus-visible:underline"
              href="https://github.com/sanity-io/concurrent-styled-components#readme"
            >
              More information.
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col items-start space-y-1.5">
                <Label htmlFor={strategyId}>Strategy</Label>
                <Select
                  onValueChange={(value) => {
                    if (value) {
                      pushQueryString(keys.strategy, value)
                      setPendingStrategy(validateStrategy(value))
                    }
                  }}
                  value={strategy}
                >
                  <SelectTrigger id={strategyId}>
                    <SelectValue placeholder="Select a CSS strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-css-in-js">no CSS-in-JS</SelectItem>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>styled-components v{scVersion}</SelectLabel>
                      <SelectItem value="insert-during-render">insert CSS during render</SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>@sanity/styled-components v{sanityScVersion}</SelectLabel>
                      <SelectItem value="use-insertion-effect">
                        insert CSS with useInsertionEffect
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-start space-y-1.5">
                <Label>Debug</Label>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    id={layoutTrashingId}
                    checked={layoutTrashing === 'force'}
                    onCheckedChange={(checked) => {
                      const value = checked === true ? 'force' : 'avoid'
                      pushQueryString(keys.layoutTrashing, value)
                      setPendingLayoutTrashing(value)
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={layoutTrashingId}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Force style recalculation
                    </label>
                    {strategy === 'no-css-in-js' ? (
                      <label htmlFor={layoutTrashingId} className="text-sm text-muted-foreground">
                        Delays React rendering with slow components reading offsetWidth.
                      </label>
                    ) : (
                      <label
                        htmlFor={layoutTrashingId}
                        className="text-pretty text-sm text-muted-foreground"
                      >
                        Changes CSS to force layout thrashing and delays React rendering with slow
                        components reading offsetWidth.
                      </label>
                    )}
                  </div>
                </div>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    id={fpsId}
                    checked={fps === 'show'}
                    onCheckedChange={(checked) => {
                      const value = checked === true ? 'show' : 'hide'
                      pushQueryString(keys.fps, value)
                      setPendingFps(value)
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={fpsId}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show FPS stats
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </Benchmark>
  )
}

function validateStrategy(strategy: string | null) {
  switch (strategy) {
    case 'insert-during-render':
    case 'no-css-in-js':
    case 'use-insertion-effect':
      return strategy
    default:
      return 'no-css-in-js'
  }
}

function validateLayoutTrashing(layout: string | null) {
  switch (layout) {
    case 'force':
    case 'avoid':
      return layout
    default:
      return 'avoid'
  }
}

function validateFps(layout: string | null) {
  switch (layout) {
    case 'show':
    case 'hide':
      return layout
    default:
      return 'show'
  }
}

function validateDistribute(distribute: string | null) {
  switch (distribute) {
    case 'false':
      return false
    default:
      return true
  }
}

function validateInterval(interval: string | null) {
  const parsed = parseInt(interval || '', 10)
  return isNaN(parsed) ? 700 : Math.max(parsed, 0)
}

function validateMaxIterations(maxIterations: string | null) {
  const parsed = parseInt(maxIterations || '', 10)
  return isNaN(parsed) ? Infinity : Math.max(parsed, 1)
}
