import {
    onScopeDispose,
    readonly,
    shallowRef,
    toValue,
    watch,
    type MaybeRefOrGetter,
} from 'vue';

export type DebouncedRequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseDebouncedAbortableRequestOptions<TCandidate, TResult> {
    candidate: MaybeRefOrGetter<TCandidate | null>;
    fetcher: (candidate: TCandidate, signal: AbortSignal) => Promise<TResult>;
    debounceMs: number;
    auto?: boolean;
}

export function useDebouncedAbortableRequest<TCandidate, TResult>(
    options: UseDebouncedAbortableRequestOptions<TCandidate, TResult>,
) {
    const status = shallowRef<DebouncedRequestStatus>('idle');
    const result = shallowRef<TResult | null>(null);
    let controller: AbortController | null = null;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let sequence = 0;

    function cancelPending(): void {
        if (timeoutId !== null) {
            globalThis.clearTimeout(timeoutId);
            timeoutId = null;
        }

        controller?.abort();
        controller = null;
        sequence += 1;
    }

    async function execute(): Promise<DebouncedRequestStatus> {
        const candidate = toValue(options.candidate);

        cancelPending();

        if (!candidate) {
            result.value = null;
            status.value = 'idle';

            return status.value;
        }

        const requestSequence = sequence;
        const nextController = new AbortController();

        controller = nextController;
        result.value = null;
        status.value = 'loading';

        try {
            const next = await options.fetcher(
                candidate,
                nextController.signal,
            );

            if (requestSequence !== sequence || nextController.signal.aborted) {
                return status.value;
            }

            result.value = next;
            status.value = 'success';
        } catch {
            if (requestSequence !== sequence || nextController.signal.aborted) {
                return status.value;
            }

            result.value = null;
            status.value = 'error';
        } finally {
            if (controller === nextController) controller = null;
        }

        return status.value;
    }

    watch(
        () => toValue(options.candidate),
        (candidate, _previous, onCleanup) => {
            cancelPending();
            result.value = null;

            if (!candidate || options.auto === false) {
                status.value = 'idle';

                return;
            }

            status.value = 'loading';

            const nextTimeoutId = globalThis.setTimeout(
                () => void execute(),
                options.debounceMs,
            );

            timeoutId = nextTimeoutId;
            onCleanup(() => {
                globalThis.clearTimeout(nextTimeoutId);

                if (timeoutId === nextTimeoutId) timeoutId = null;
            });
        },
        { immediate: true, deep: true },
    );

    onScopeDispose(cancelPending);

    return {
        status: readonly(status),
        result: readonly(result),
        execute,
    };
}
