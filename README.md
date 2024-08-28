# [See the PR in `styled-components` for more context](https://github.com/styled-components/styled-components/pull/4332)

`styled-components`, as of `v6.1.12` or earlier, inserts CSS rules during render. This can lead to problems when React is processing a non-blocking state update (related to `React.lazy`, `Suspense`, `startTransition`, or `useDeferredValue`). React 18 introduced a new hook, `useInsertionEffect`, that ensures CSS rules are inserted after the render phase, but before `refs` are set, `useLayoutEffect` and `useEffect` hooks are called, and the browser paints.

The video below demonstrates the difference in the two approaches when React is processing a very demanding render loop that uses `useDeferredValue` to opt-in to Concurrent Mode rendering. The current, insert CSS during render, approach is on the right hand side. The left hand side uses a fork of `styled-components`, which inserts CSS in `useInsertionEffect` instead ([#4332](https://github.com/styled-components/styled-components/pull/4332)) and is almost twice as fast:

https://github.com/user-attachments/assets/008c64fe-de67-4922-85b6-14d0da893380

Both tests are setup to run 4 iterations, you can run the [before](https://concurrent-styled-components.sanity.dev/?layoutTrashing=force&strategy=insert-during-render&maxIterations=4) and [after](https://concurrent-styled-components.sanity.dev/?layoutTrashing=force&strategy=use-insertion-effect&maxIterations=4) yourself to verify.
In addition to finishing 4 iterations the fastest, the `useInsertionEffect` approach has a much more stable render and yield loop, where you see flashing tiles most of the time and the jank clock is mostly green. While the `insert during render` often locks up with the jank clock turning red, and large idle periods where the background render is being blocked and so no tiles are flashing as react render haven't completed yet.
The `useInsertionEffect` variant is tested on a fork of `styled-components`, named `@sanity/styled-components`.
