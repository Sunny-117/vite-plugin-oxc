import React, { useEffect } from 'react';
import { useCancelableAsyncTaskCallback } from '../../src/useCancelableAsyncTaskCallback';

// A fake async task that resolves after `delay` ms and supports AbortSignal
async function fakeFetch(params: { id?: number } = {}, options?: { signal?: AbortSignal | null, timeout?: number }): Promise<{ id?: number; ts: number }> {
    const { id } = params || {};
    const { signal } = options || {};
    return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            resolve({ id, ts: Date.now() });
        }, 1000);
        if (signal) {
            signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new DOMException('Aborted', 'AbortError'));
            });
        }
    });
}

export default function UseCancelableDemo() {
    const [run, { pending: loading, data, error, cancel }] = useCancelableAsyncTaskCallback<{ id?: number }, { id?: number; ts: number }>(
        fakeFetch,
        undefined,
        { timeout: 2000 }
    );

    useEffect(() => {
        // start a request on mount
        run({ id: 1 }).catch(() => { });

        // cancel after 300ms to demonstrate cancellation
        const t = setTimeout(() => cancel(), 300);
        return () => clearTimeout(t);
    }, [run, cancel]);

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            <h3>useCancelableAsyncTaskCallback Demo</h3>
            <p>Loading: {loading ? 'yes' : 'no'}</p>
            <p>Data: {data ? JSON.stringify(data) : 'none'}</p>
            <p>Error: {error ? String(error) : 'none'}</p>
            <button onClick={() => run({ id: Math.floor(Math.random() * 100) }).catch(() => { })}>Run</button>
            <button onClick={() => cancel()}>Cancel</button>
        </div>
    );
}
