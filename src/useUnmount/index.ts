import { useEffect } from 'react'
import useLatest from '../useLatest'
import { isFunction } from '../utils'
import isDev from '../utils/isDev'

/**
 * A hook that executes a function when the component unmounts.
 *
 * @param fn - The function to execute on component unmount
 *
 * @example
 * ```tsx
 * function Component() {
 *   useUnmount(() => {
 *     console.log('Component is unmounting');
 *     // Cleanup logic here
 *   });
 *
 *   return <div>Component content</div>;
 * }
 *
 * // With cleanup
 * function TimerComponent() {
 *   const [count, setCount] = useState(0);
 *
 *   useEffect(() => {
 *     const timer = setInterval(() => {
 *       setCount(c => c + 1);
 *     }, 1000);
 *
 *     return () => clearInterval(timer);
 *   }, []);
 *
 *   useUnmount(() => {
 *     console.log('Timer component unmounted with count:', count);
 *   });
 *
 *   return <div>Count: {count}</div>;
 * }
 * ```
 */
function useUnmount(fn: () => void) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useUnmount expected parameter is a function, got ${typeof fn}`)
    }
  }

  const fnRef = useLatest(fn)

  useEffect(
    () => () => {
      fnRef.current()
    },
    [],
  )
}

export default useUnmount
