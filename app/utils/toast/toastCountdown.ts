export function createToastCountdown(
    durationMs: number,
    onExpired: () => void,
) {
    let remainingMs = durationMs;
    let startedAt = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let isRunning = false;
    let isStopped = false;

    function pause() {
        if (!isRunning) return;

        remainingMs = Math.max(
            0,
            remainingMs - (performance.now() - startedAt),
        );
        clearTimeout(timeoutId);
        timeoutId = undefined;
        isRunning = false;
    }

    function resume() {
        if (isStopped || isRunning || durationMs <= 0) return;

        if (remainingMs <= 0) {
            isStopped = true;
            onExpired();

            return;
        }

        startedAt = performance.now();
        isRunning = true;
        timeoutId = setTimeout(() => {
            remainingMs = 0;
            timeoutId = undefined;
            isRunning = false;
            isStopped = true;
            onExpired();
        }, remainingMs);
    }

    function stop() {
        pause();
        isStopped = true;
    }

    return { pause, resume, stop };
}
