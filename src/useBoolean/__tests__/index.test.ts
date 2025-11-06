import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useBoolean from '../index'

describe('useBoolean', () => {
  it('should initialize with default value false', () => {
    const { result } = renderHook(() => useBoolean())
    expect(result.current[0]).toBe(false)
  })

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useBoolean(true))
    expect(result.current[0]).toBe(true)
  })

  it('should set to true with setTrue', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].setTrue()
    })

    expect(result.current[0]).toBe(true)
  })

  it('should set to false with setFalse', () => {
    const { result } = renderHook(() => useBoolean(true))

    act(() => {
      result.current[1].setFalse()
    })

    expect(result.current[0]).toBe(false)
  })

  it('should toggle value', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].toggle()
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1].toggle()
    })
    expect(result.current[0]).toBe(false)
  })

  it('should set value with set function', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].set(true)
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1].set(false)
    })
    expect(result.current[0]).toBe(false)
  })

  it('should convert truthy/falsy values to boolean with set', () => {
    const { result } = renderHook(() => useBoolean(false))

    act(() => {
      result.current[1].set('hello' as any)
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1].set(0 as any)
    })
    expect(result.current[0]).toBe(false)
  })
})
