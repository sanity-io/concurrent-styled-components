# [See the PR in `styled-components` for more context](https://github.com/styled-components/styled-components/pull/4332)

`styled-components`, as of `v6.1.13` or earlier, inserts CSS rules during render. This can lead to problems when React is processing a non-blocking state update (related to `React.lazy`, `Suspense`, `startTransition`, or `useDeferredValue`). React 18 introduced a new hook, `useInsertionEffect`, that ensures CSS rules are inserted after the render phase, but before `refs` are set, `useLayoutEffect` and `useEffect` hooks are called, and the browser paints.

The video below demonstrates the difference in the two approaches when React is processing a very demanding render loop that uses `startTransition` to opt-in to Concurrent Mode rendering. The current, insert CSS during render, approach is on the left hand side. The right hand side uses a fork of `styled-components`, which inserts CSS in `useInsertionEffect` instead ([#4332](https://github.com/styled-components/styled-components/pull/4332)) and is a able to iterate twice as fast and have 10-20% higher average FPS:



https://github.com/user-attachments/assets/201fb187-e6cc-411a-a461-b0e4009b87e2



You can run the [before](https://concurrent-styled-components.sanity.dev/?strategy=insert-during-render&layoutTrashing=force&interval=100&size=72&maxIterations=20) and [after](https://concurrent-styled-components.sanity.dev/?strategy=use-insertion-effect&layoutTrashing=force&interval=100&size=72&maxIterations=20) yourself to verify.
The `useInsertionEffect` variant is tested on a fork of `styled-components`, named `@sanity/styled-components`.
