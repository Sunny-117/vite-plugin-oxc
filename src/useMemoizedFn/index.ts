import { useMemo, useRef } from 'react'
import { isFunction } from '../utils'
import isDev from '../utils/isDev'

type noop = (this: any, ...args: any[]) => any

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>

/**
 * A hook that returns a memoized function with a persistent reference.
 * The returned function will always have the same reference but will call the latest version of the provided function.
 *
 * @param fn - The function to memoize
 * @returns A memoized function with persistent reference
 *
 * @example
 * ```tsx
 * function Component({ onSubmit }) {
 *   const [count, setCount] = useState(0);
 *
 *   // Without useMemoizedFn, this function would be recreated on every render
 *   const handleSubmit = useMemoizedFn((data) => {
 *     onSubmit({ ...data, count }); // Always uses latest count
 *   });
 *
 *   // Child component won't re-render unnecessarily because handleSubmit reference is stable
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={() => setCount(c => c + 1)}>Increment</button>
 *       <ExpensiveChild onSubmit={handleSubmit} />
 *     </div>
 *   );
 * }
 * ```
 */
function useMemoizedFn<T extends noop>(fn: T) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useMemoizedFn expected parameter is a function, got ${typeof fn}`)
    }
  }

  const fnRef = useRef<T>(fn)

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn])

  const memoizedFn = useRef<PickFunction<T>>()
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args)
    }
  }

  return memoizedFn.current as T
}

export default useMemoizedFn
