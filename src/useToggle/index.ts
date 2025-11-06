import { useMemo, useState } from 'react'

export interface Actions<T> {
  setLeft: () => void
  setRight: () => void
  set: (value: T) => void
  toggle: () => void
}

function useToggle<T = boolean>(): [boolean, Actions<T>]
function useToggle<T>(defaultValue: T): [T, Actions<T>]
function useToggle<T, U>(defaultValue: T, reverseValue: U): [T | U, Actions<T | U>]

/**
 * A hook that manages state with two possible values and provides toggle functionality.
 *
 * @param defaultValue - The initial value (default: false for boolean toggle)
 * @param reverseValue - The alternative value to toggle to (default: !defaultValue for boolean)
 * @returns A tuple containing the current state and actions object
 *
 * @example
 * ```tsx
 * // Boolean toggle
 * function BooleanExample() {
 *   const [isOn, { toggle, setLeft, setRight }] = useToggle();
 *   return <button onClick={toggle}>{isOn ? 'ON' : 'OFF'}</button>;
 * }
 *
 * // Custom values toggle
 * function CustomExample() {
 *   const [theme, { toggle }] = useToggle('light', 'dark');
 *   return <button onClick={toggle}>Theme: {theme}</button>;
 * }
 * ```
 */
function useToggle<D, R>(defaultValue: D = false as unknown as D, reverseValue?: R) {
  const [state, setState] = useState<D | R>(defaultValue)

  const actions = useMemo(() => {
    const reverseValueOrigin = (reverseValue === undefined ? !defaultValue : reverseValue) as D | R

    const toggle = () => setState(s => (s === defaultValue ? reverseValueOrigin : defaultValue))
    const set = (value: D | R) => setState(value)
    const setLeft = () => setState(defaultValue)
    const setRight = () => setState(reverseValueOrigin)

    return {
      toggle,
      set,
      setLeft,
      setRight,
    }
  }, [defaultValue, reverseValue])

  return [state, actions]
}

export default useToggle
