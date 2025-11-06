import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useSetState from '../index'

describe('useSetState', () => {
  it('should initialize with provided state', () => {
    const initialState = { name: 'John', age: 25 }
    const { result } = renderHook(() => useSetState(initialState))
    expect(result.current[0]).toEqual(initialState)
  })

  it('should initialize with function', () => {
    const initialState = { count: 0 }
    const { result } = renderHook(() => useSetState(() => initialState))
    expect(result.current[0]).toEqual(initialState)
  })

  it('should merge partial updates', () => {
    const { result } = renderHook(() => useSetState({ name: 'John', age: 25, city: 'NYC' }))

    act(() => {
      result.current[1]({ age: 26 })
    })

    expect(result.current[0]).toEqual({ name: 'John', age: 26, city: 'NYC' })
  })

  it('should handle function updates', () => {
    const { result } = renderHook(() => useSetState({ count: 0, name: 'John' }))

    act(() => {
      result.current[1](prev => ({ count: prev.count + 1 }))
    })

    expect(result.current[0]).toEqual({ count: 1, name: 'John' })
  })

  it('should handle null updates', () => {
    const initialState = { name: 'John', age: 25 }
    const { result } = renderHook(() => useSetState(initialState))

    act(() => {
      result.current[1](null)
    })

    expect(result.current[0]).toEqual(initialState)
  })

  it('should handle function returning null', () => {
    const initialState = { name: 'John', age: 25 }
    const { result } = renderHook(() => useSetState(initialState))

    act(() => {
      result.current[1](() => null)
    })

    expect(result.current[0]).toEqual(initialState)
  })
})
