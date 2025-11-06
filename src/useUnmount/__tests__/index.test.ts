import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useUnmount from '../index'

describe('useUnmount', () => {
  it('should call function on unmount', () => {
    const fn = vi.fn()
    const { unmount } = renderHook(() => useUnmount(fn))

    expect(fn).not.toHaveBeenCalled()

    unmount()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should call latest function on unmount', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()

    let currentFn = fn1
    const { rerender, unmount } = renderHook(() => useUnmount(currentFn))

    currentFn = fn2
    rerender()

    unmount()

    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should not call function if component does not unmount', () => {
    const fn = vi.fn()
    renderHook(() => useUnmount(fn))

    expect(fn).not.toHaveBeenCalled()
  })

  it('should handle multiple rerenders before unmount', () => {
    const fn = vi.fn()
    const { rerender, unmount } = renderHook(() => useUnmount(fn))

    rerender()
    rerender()
    rerender()

    expect(fn).not.toHaveBeenCalled()

    unmount()

    expect(fn).toHaveBeenCalledTimes(1)
  })
})
