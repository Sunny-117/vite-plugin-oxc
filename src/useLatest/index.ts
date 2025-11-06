import { useRef } from 'react'

/**
 * A hook that returns a ref that always contains the latest value.
 * Useful for accessing the latest value in callbacks without re-creating them.
 *
 * @param value - The value to keep the latest reference to
 * @returns A ref object containing the latest value
 *
 * @example
 * ```tsx
 * function Component() {
 *   const [count, setCount] = useState(0);
 *   const latestCount = useLatest(count);
 *
 *   const handleClick = useCallback(() => {
 *     // Always gets the latest count value
 *     console.log('Latest count:', latestCount.current);
 *   }, []); // No dependencies needed
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={() => setCount(c => c + 1)}>Increment</button>
 *       <button onClick={handleClick}>Log Latest Count</button>
 *     </div>
 *   );
 * }
 * ```
 */
function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

export default useLatest
