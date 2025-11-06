import { useCallback, useState } from 'react'
import { isFunction } from '../utils'

export type SetState<S extends Record<string, any>> = <K extends keyof S>(
  state: Pick<S, K> | null | ((prevState: Readonly<S>) => Pick<S, K> | S | null),
) => void

/**
 * A hook that manages object state with automatic merging, similar to class component's setState.
 *
 * @param initialState - The initial state object or a function that returns the initial state
 * @returns A tuple containing the current state and a setState function that merges updates
 *
 * @example
 * ```tsx
 * function Component() {
 *   const [state, setState] = useSetState({
 *     name: 'John',
 *     age: 25,
 *     city: 'New York'
 *   });
 *
 *   const updateName = () => {
 *     setState({ name: 'Jane' }); // Only updates name, keeps age and city
 *   };
 *
 *   const updateWithFunction = () => {
 *     setState(prev => ({ age: prev.age + 1 }));
 *   };
 *
 *   return (
 *     <div>
 *       <p>Name: {state.name}</p>
 *       <p>Age: {state.age}</p>
 *       <p>City: {state.city}</p>
 *       <button onClick={updateName}>Update Name</button>
 *       <button onClick={updateWithFunction}>Increment Age</button>
 *     </div>
 *   );
 * }
 * ```
 */
function useSetState<S extends Record<string, any>>(initialState: S | (() => S)): [S, SetState<S>] {
  const [state, setState] = useState<S>(initialState)

  const setMergeState = useCallback((patch: any) => {
    setState((prevState) => {
      const newState = isFunction(patch) ? patch(prevState) : patch
      return newState ? { ...prevState, ...newState } : prevState
    })
  }, [])

  return [state, setMergeState]
}

export default useSetState
