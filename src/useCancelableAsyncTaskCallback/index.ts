import { useRef, useCallback, useEffect } from 'react'
import { useRequestCallback } from '@huse/request';

export function useCancelableAsyncTaskCallback(task_, params, { timeout, interval }) {
    const controllerRef = useRef();
    const task = useCallback(function task(params) {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        const controller = new AbortController();
        controllerRef.current = controller;
        return task_(params, { signal: controller.signal, timeout, interval });
    }, [task_]);
    const cancel = useCallback(function () {
        const controller = controllerRef.current;
        controller && controller.abort();
    }, []);
    const [callback, result] = useRequestCallback(task, params);
    useEffect(() => cancel, []);
    return [callback, { ...result, cancel }];
}
