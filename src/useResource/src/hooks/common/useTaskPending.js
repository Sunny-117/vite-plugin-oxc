import {useCallback} from 'react';
import {useNumber} from './useNumber';

export const useTaskPending = task => {
    const [pendingCount, {increment, decrement}] = useNumber(0);
    const taskWithPending = useCallback(
        async (...args) => {
            increment();
            const result = await task(...args);
            decrement();
            return result;
        },
        [task, increment, decrement]
    );
    return [taskWithPending, pendingCount > 0];
};
