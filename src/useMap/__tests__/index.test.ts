import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useMap from '../index'

describe('useMap', () => {
  it('should initialize with empty map', () => {
    const { result } = renderHook(() => useMap<string, number>())
    expect(result.current[0].size).toBe(0)
  })

  it('should initialize with provided entries', () => {
    const initialEntries: [string, number][] = [['key1', 1], ['key2', 2]]
    const { result } = renderHook(() => useMap(initialEntries))

    expect(result.current[0].size).toBe(2)
    expect(result.current[0].get('key1')).toBe(1)
    expect(result.current[0].get('key2')).toBe(2)
  })

  it('should set new entries', () => {
    const { result } = renderHook(() => useMap<string, number>())

    act(() => {
      result.current[1].set('key1', 100)
    })

    expect(result.current[0].get('key1')).toBe(100)
    expect(result.current[0].size).toBe(1)
  })

  it('should update existing entries', () => {
    const { result } = renderHook(() => useMap([['key1', 1]]))

    act(() => {
      result.current[1].set('key1', 999)
    })

    expect(result.current[0].get('key1')).toBe(999)
    expect(result.current[0].size).toBe(1)
  })

  it('should remove entries', () => {
    const { result } = renderHook(() => useMap([['key1', 1], ['key2', 2]]))

    act(() => {
      result.current[1].remove('key1')
    })

    expect(result.current[0].has('key1')).toBe(false)
    expect(result.current[0].get('key2')).toBe(2)
    expect(result.current[0].size).toBe(1)
  })

  it('should set all entries', () => {
    const { result } = renderHook(() => useMap([['key1', 1]]))

    act(() => {
      result.current[1].setAll([['newKey1', 10], ['newKey2', 20]])
    })

    expect(result.current[0].size).toBe(2)
    expect(result.current[0].get('newKey1')).toBe(10)
    expect(result.current[0].get('newKey2')).toBe(20)
    expect(result.current[0].has('key1')).toBe(false)
  })

  it('should reset to initial state', () => {
    const initialEntries: [string, number][] = [['key1', 1]]
    const { result } = renderHook(() => useMap(initialEntries))

    act(() => {
      result.current[1].set('key2', 2)
      result.current[1].remove('key1')
    })

    expect(result.current[0].size).toBe(1)
    expect(result.current[0].has('key1')).toBe(false)

    act(() => {
      result.current[1].reset()
    })

    expect(result.current[0].size).toBe(1)
    expect(result.current[0].get('key1')).toBe(1)
    expect(result.current[0].has('key2')).toBe(false)
  })

  it('should get values', () => {
    const { result } = renderHook(() => useMap([['key1', 'value1']]))

    expect(result.current[1].get('key1')).toBe('value1')
    expect(result.current[1].get('nonexistent')).toBeUndefined()
  })
})
