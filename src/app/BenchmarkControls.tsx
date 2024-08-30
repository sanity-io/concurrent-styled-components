'use client'

import sanityScPkg from '@sanity/styled-components/package.json'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useId, useOptimistic, useTransition} from 'react'
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
import {Slider} from '~/components/ui/slider'

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
  size: 'size',
  maxIterations: 'maxIterations',
}

export default function BenchmarkControls() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)

    return params.toString()
  }

  const pushQueryString = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value), {scroll: false})
  }

  const distribute = validateDistribute(searchParams.get(keys.distribute))
  const maxIterations = validateMaxIterations(searchParams.get(keys.maxIterations))

  const strategyId = useId()
  const intervalId = useId()
  const sizeId = useId()
  const layoutTrashingId = useId()
  const fpsId = useId()

  const [strategy, setPendingStrategy] = useOptimistic<ReturnType<typeof validateStrategy>>(
    validateStrategy(searchParams.get(keys.strategy)),
  )
  const [interval, setPendingInterval] = useOptimistic<ReturnType<typeof validateInterval>>(
    validateInterval(searchParams.get(keys.interval)),
  )
  const [size, setPendingSize] = useOptimistic<ReturnType<typeof validateSize>>(
    validateSize(searchParams.get(keys.size)),
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
      size={size}
      maxIterations={maxIterations}
      pending={pending}
      startTransition={startTransition}
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
                      startTransition(() => {
                        pushQueryString(keys.strategy, value)
                        setPendingStrategy(validateStrategy(value))
                      })
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
                <Label htmlFor={intervalId}>Interval</Label>
                <div className="grid w-full grid-cols-2 gap-2">
                  <Slider
                    onValueChange={([value]) => {
                      if (value) {
                        startTransition(() => {
                          pushQueryString(keys.interval, `${value}`)
                          setPendingInterval(validateInterval(value))
                        })
                      }
                    }}
                    value={[interval]}
                    min={100}
                    max={3000}
                    step={100}
                  />
                  <output htmlFor={intervalId} className="text-sm font-medium leading-none">
                    {interval < 1000 ? (interval / 1000).toFixed(1) : interval / 1000}s
                  </output>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-1.5">
                <Label htmlFor={sizeId}>Tile Size</Label>
                <div className="grid w-full grid-cols-2 gap-2">
                  <Slider
                    onValueChange={([value]) => {
                      if (value) {
                        startTransition(() => {
                          pushQueryString(keys.size, `${value}`)
                          setPendingSize(validateSize(value))
                        })
                      }
                    }}
                    value={[size]}
                    min={32}
                    max={192}
                    step={4}
                  />
                  <output htmlFor={sizeId} className="text-sm font-medium leading-none">
                    {size}x{size}px
                  </output>
                </div>
              </div>
              <div className="flex flex-col items-start space-y-1.5">
                <Label>Debug</Label>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    id={layoutTrashingId}
                    checked={layoutTrashing === 'force'}
                    onCheckedChange={(checked) => {
                      startTransition(() => {
                        const value = checked === true ? 'force' : 'avoid'
                        pushQueryString(keys.layoutTrashing, value)
                        setPendingLayoutTrashing(value)
                      })
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
                      startTransition(() => {
                        const value = checked === true ? 'show' : 'hide'
                        pushQueryString(keys.fps, value)
                        setPendingFps(value)
                      })
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

function validateInterval(interval: string | number | null) {
  const parsed = typeof interval === 'number' ? interval : parseInt(interval || '', 10)
  return isNaN(parsed) ? 1000 : Math.max(parsed, 100)
}

function validateSize(size: string | number | null) {
  const parsed = typeof size === 'number' ? size : parseInt(size || '', 10)
  return isNaN(parsed) ? 32 : Math.max(parsed, 1)
}

function validateMaxIterations(maxIterations: string | null) {
  const parsed = parseInt(maxIterations || '', 10)
  return isNaN(parsed) ? Infinity : Math.max(parsed, 1)
}
