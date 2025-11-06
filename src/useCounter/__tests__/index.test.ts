import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useCounter from '../index'

describe('useCounter', () => {
  it('should initialize with default value 0', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current[0]).toBe(0)
  })

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useCounter(5))
    expect(result.current[0]).toBe(5)
  })

  it('should increment by 1 by default', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current[1].inc()
    })

    expect(result.current[0]).toBe(1)
  })

  it('should increment by custom delta', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current[1].inc(5)
    })

    expect(result.current[0]).toBe(5)
  })

  it('should decrement by 1 by default', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current[1].dec()
    })

    expect(result.current[0]).toBe(4)
  })

  it('should decrement by custom delta', () => {
    const { result } = renderHook(() => useCounter(10))

    act(() => {
      result.current[1].dec(3)
    })

    expect(result.current[0]).toBe(7)
  })

  it('should set value directly', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current[1].set(42)
    })

    expect(result.current[0]).toBe(42)
  })

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current[1].inc(10)
    })
    expect(result.current[0]).toBe(15)

    act(() => {
      result.current[1].reset()
    })
    expect(result.current[0]).toBe(5)
  })

  it('should respect min constraint', () => {
    const { result } = renderHook(() => useCounter(5, { min: 0, max: 10 }))

    act(() => {
      result.current[1].set(-5)
    })
    expect(result.current[0]).toBe(0)

    act(() => {
      result.current[1].dec(10)
    })
    expect(result.current[0]).toBe(0)
  })

  it('should respect max constraint', () => {
    const { result } = renderHook(() => useCounter(5, { min: 0, max: 10 }))

    act(() => {
      result.current[1].set(15)
    })
    expect(result.current[0]).toBe(10)

    act(() => {
      result.current[1].inc(10)
    })
    expect(result.current[0]).toBe(10)
  })

  it('should clamp initial value to constraints', () => {
    const { result: result1 } = renderHook(() => useCounter(-5, { min: 0, max: 10 }))
    expect(result1.current[0]).toBe(0)

    const { result: result2 } = renderHook(() => useCounter(15, { min: 0, max: 10 }))
    expect(result2.current[0]).toBe(10)
  })
})
