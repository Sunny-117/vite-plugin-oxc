import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useToggle from '../index'

describe('useToggle', () => {
  it('should initialize with default boolean false', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current[0]).toBe(false)
  })

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current[0]).toBe(true)
  })

  it('should toggle between boolean values', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[1].toggle()
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1].toggle()
    })
    expect(result.current[0]).toBe(false)
  })

  it('should toggle between custom values', () => {
    const { result } = renderHook(() => useToggle('light', 'dark'))
    expect(result.current[0]).toBe('light')

    act(() => {
      result.current[1].toggle()
    })
    expect(result.current[0]).toBe('dark')

    act(() => {
      result.current[1].toggle()
    })
    expect(result.current[0]).toBe('light')
  })

  it('should set value directly', () => {
    const { result } = renderHook(() => useToggle('a', 'b'))

    act(() => {
      result.current[1].set('b')
    })
    expect(result.current[0]).toBe('b')
  })

  it('should set left value', () => {
    const { result } = renderHook(() => useToggle('left', 'right'))

    act(() => {
      result.current[1].toggle() // switch to right
    })
    expect(result.current[0]).toBe('right')

    act(() => {
      result.current[1].setLeft()
    })
    expect(result.current[0]).toBe('left')
  })

  it('should set right value', () => {
    const { result } = renderHook(() => useToggle('left', 'right'))
    expect(result.current[0]).toBe('left')

    act(() => {
      result.current[1].setRight()
    })
    expect(result.current[0]).toBe('right')
  })
})
