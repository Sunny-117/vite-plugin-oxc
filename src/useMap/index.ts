import { useState } from 'react'

export interface MapActions<K, T> {
  set: (key: K, value: T) => void
  setAll: (newMap: Iterable<readonly [K, T]>) => void
  remove: (key: K) => void
  reset: () => void
  get: (key: K) => T | undefined
}

/**
 * A hook that manages a Map state with convenient actions.
 *
 * @param initialValue - Initial Map entries or undefined for empty Map
 * @returns A tuple containing the current Map and actions object
 *
 * @example
 * ```tsx
 * function Component() {
 *   const [map, { set, get, remove, reset, setAll }] = useMap<string, number>([
 *     ['key1', 1],
 *     ['key2', 2],
 *   ]);
 *
 *   return (
 *     <div>
 *       <p>Map size: {map.size}</p>
 *       <button onClick={() => set('key3', 3)}>Add key3</button>
 *       <button onClick={() => remove('key1')}>Remove key1</button>
 *       <button onClick={reset}>Reset</button>
 *       <p>key1 value: {get('key1')}</p>
 *     </div>
 *   );
 * }
 * ```
 */
function useMap<K, T>(initialValue?: Iterable<readonly [K, T]>): [Map<K, T>, MapActions<K, T>] {
  const getInitValue = () => {
    return initialValue === undefined ? new Map<K, T>() : new Map(initialValue)
  }

  const [map, setMap] = useState<Map<K, T>>(() => getInitValue())

  const set = (key: K, value: T) => {
    setMap((prev) => {
      const temp = new Map(prev)
      temp.set(key, value)
      return temp
    })
  }

  const setAll = (newMap: Iterable<readonly [K, T]>) => {
    setMap(new Map(newMap))
  }

  const remove = (key: K) => {
    setMap((prev) => {
      const temp = new Map(prev)
      temp.delete(key)
      return temp
    })
  }

  const reset = () => setMap(getInitValue())

  const get = (key: K) => map.get(key)

  return [
    map,
    {
      set,
      setAll,
      remove,
      reset,
      get,
    },
  ] as const
}

export default useMap
