import { useMemo } from 'react'
import useToggle from '../useToggle'

export interface Actions {
  setTrue: () => void
  setFalse: () => void
  set: (value: boolean) => void
  toggle: () => void
}

/**
 * A hook that manages a boolean state with convenient actions.
 *
 * @param defaultValue - The initial boolean value (default: false)
 * @returns A tuple containing the current boolean state and actions object
 *
 * @example
 * ```tsx
 * function Component() {
 *   const [isVisible, { setTrue, setFalse, toggle, set }] = useBoolean(false);
 *
 *   return (
 *     <div>
 *       <p>Visible: {isVisible ? 'Yes' : 'No'}</p>
 *       <button onClick={setTrue}>Show</button>
 *       <button onClick={setFalse}>Hide</button>
 *       <button onClick={toggle}>Toggle</button>
 *       <button onClick={() => set(true)}>Set True</button>
 *     </div>
 *   );
 * }
 * ```
 */
export default function useBoolean(defaultValue = false): [boolean, Actions] {
  const [state, { toggle, set }] = useToggle(defaultValue)

  const actions: Actions = useMemo(() => {
    const setTrue = () => set(true)
    const setFalse = () => set(false)
    return {
      toggle,
      set: (v: boolean) => set(!!v),
      setTrue,
      setFalse,
    }
  }, [set, toggle])

  return [state, actions]
}
