import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useLatest from '../index'

describe('useLatest', () => {
  it('should return a ref with the initial value', () => {
    const { result } = renderHook(() => useLatest('initial'))
    expect(result.current.current).toBe('initial')
  })

  it('should update ref when value changes', () => {
    let value = 'initial'
    const { result, rerender } = renderHook(() => useLatest(value))

    expect(result.current.current).toBe('initial')

    value = 'updated'
    rerender()

    expect(result.current.current).toBe('updated')
  })

  it('should work with different types', () => {
    const { result: numberResult } = renderHook(() => useLatest(42))
    expect(numberResult.current.current).toBe(42)

    const { result: objectResult } = renderHook(() => useLatest({ key: 'value' }))
    expect(objectResult.current.current).toEqual({ key: 'value' })

    const { result: arrayResult } = renderHook(() => useLatest([1, 2, 3]))
    expect(arrayResult.current.current).toEqual([1, 2, 3])
  })

  it('should maintain the same ref object across renders', () => {
    let value = 'initial'
    const { result, rerender } = renderHook(() => useLatest(value))

    const firstRef = result.current

    value = 'updated'
    rerender()

    const secondRef = result.current

    expect(firstRef).toBe(secondRef)
    expect(secondRef.current).toBe('updated')
  })
})
