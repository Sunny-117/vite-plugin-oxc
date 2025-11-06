import {useCallback} from 'react';
import {useTaskPending} from './useTaskPending';

export const useTaskPendingState = (task, storeResult) => {
    const [taskWithPending, pending] = useTaskPending(task);
    const callAndStore = useCallback(
        async (...args) => {
            const result = await taskWithPending(...args);
            storeResult(result);
        },
        [taskWithPending, storeResult]
    );
    return [callAndStore, pending];
};
