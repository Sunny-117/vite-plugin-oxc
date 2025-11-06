import { useMemo, useState } from 'react'

export interface CounterOptions {
  min?: number
  max?: number
}

export interface CounterActions {
  inc: (delta?: number) => void
  dec: (delta?: number) => void
  set: (value: number) => void
  reset: () => void
}

/**
 * A hook that manages a numeric counter with optional min/max constraints.
 *
 * @param initialValue - The initial counter value (default: 0)
 * @param options - Configuration object with min/max constraints
 * @returns A tuple containing the current count and actions object
 *
 * @example
 * ```tsx
 * function Component() {
 *   const [count, { inc, dec, set, reset }] = useCounter(5, {
 *     min: 0,
 *     max: 10,
 *   });
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={() => inc()}>+1</button>
 *       <button onClick={() => inc(5)}>+5</button>
 *       <button onClick={() => dec()}>-1</button>
 *       <button onClick={() => set(7)}>Set to 7</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
function useCounter(
  initialValue = 0,
  options: CounterOptions = {},
): [number, CounterActions] {
  const { min = -Infinity, max = Infinity } = options

  const getClampedValue = (value: number) => {
    return Math.min(Math.max(value, min), max)
  }

  const clampedInitialValue = getClampedValue(initialValue)
  const [count, setCount] = useState(clampedInitialValue)

  const actions = useMemo(() => {
    const inc = (delta = 1) => {
      setCount(prev => getClampedValue(prev + delta))
    }

    const dec = (delta = 1) => {
      setCount(prev => getClampedValue(prev - delta))
    }

    const set = (value: number) => {
      setCount(getClampedValue(value))
    }

    const reset = () => {
      setCount(clampedInitialValue)
    }

    return { inc, dec, set, reset }
  }, [clampedInitialValue, min, max])

  return [count, actions]
}

export default useCounter
