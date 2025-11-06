import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useMemoizedFn from '../index'

describe('useMemoizedFn', () => {
  it('should return a function', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useMemoizedFn(fn))

    expect(typeof result.current).toBe('function')
  })

  it('should maintain same reference across renders', () => {
    const fn = vi.fn()
    const { result, rerender } = renderHook(() => useMemoizedFn(fn))

    const firstRef = result.current
    rerender()
    const secondRef = result.current

    expect(firstRef).toBe(secondRef)
  })

  it('should call the latest function', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()

    let currentFn = fn1
    const { result, rerender } = renderHook(() => useMemoizedFn(currentFn))

    result.current()
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).not.toHaveBeenCalled()

    currentFn = fn2
    rerender()

    result.current()
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments correctly', () => {
    const fn = vi.fn()
    const { result } = renderHook(() => useMemoizedFn(fn))

    result.current('arg1', 'arg2', 123)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should return the correct value', () => {
    const fn = vi.fn().mockReturnValue('test-return')
    const { result } = renderHook(() => useMemoizedFn(fn))

    const returnValue = result.current()

    expect(returnValue).toBe('test-return')
  })

  it('should preserve this context', () => {
    const obj = {
      value: 'test',
      method() {
        return this.value
      },
    }

    const { result } = renderHook(() => useMemoizedFn(obj.method))

    const returnValue = result.current.call(obj)
    expect(returnValue).toBe('test')
  })
})
