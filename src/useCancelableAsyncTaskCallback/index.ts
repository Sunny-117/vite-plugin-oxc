import { useCallback, useEffect, useRef } from 'react'
import { useRequestCallback } from '@huse/request'

interface CancelableOptions {
  timeout?: number
  interval?: number
}

type TaskOptions = CancelableOptions & {
  signal?: AbortSignal | null
}

type TaskFn<TParams, TResult> = (params: TParams, options?: TaskOptions) => Promise<TResult> | TResult

interface UseCancelableResult<TResult> {
  pending?: boolean
  error?: any
  data?: TResult
  cancel: () => void
}

export function useCancelableAsyncTaskCallback<TParams = void, TResult = unknown>(
  task_: TaskFn<TParams, TResult>,
  params?: TParams,
  options: CancelableOptions = {},
): [(p?: TParams) => Promise<TResult>, UseCancelableResult<TResult>] {
  const { timeout, interval } = options || {}
  const controllerRef = useRef<AbortController | undefined>()

  const task = useCallback((params?: TParams) => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    const controller = new AbortController()
    controllerRef.current = controller
    return Promise.resolve(task_(params as TParams, { signal: controller.signal, timeout, interval }))
  }, [task_, timeout, interval])

  const cancel = useCallback(() => {
    const controller = controllerRef.current
    if (controller) {
      controller.abort()
    }
  }, [])

  // `useRequestCallback`'s exact types may differ between versions. Treat its raw return as unknown
  // and wrap it to provide a stable, strongly-typed API.
  const [rawCallback, rawResult] = useRequestCallback(task, params) as unknown as [
    (...args: any[]) => any,
    any,
  ]

  const callback = useCallback((p?: TParams): Promise<TResult> => {
    // Ensure the returned value is a Promise<TResult>
    return Promise.resolve(rawCallback(p))
  }, [rawCallback])

  const result = rawResult as Omit<UseCancelableResult<TResult>, 'cancel'>
  useEffect(() => cancel, [])
  return [callback, { ...result, cancel }]
}
