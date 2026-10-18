import { createToastCountdown } from '~/utils/toast/toastCountdown';

export function useToastLifetime(durationMs: number, onExpired: () => void) {
    const isRunning = shallowRef(false);
    const pauseReasons = new Set<'hover' | 'focus' | 'page-hidden'>();
    const countdown = createToastCountdown(durationMs, onExpired);
    let isMounted = false;

    function pause(reason: 'hover' | 'focus' | 'page-hidden') {
        pauseReasons.add(reason);
        countdown.pause();
        isRunning.value = false;
    }

    function resume(reason: 'hover' | 'focus' | 'page-hidden') {
        pauseReasons.delete(reason);

        if (!isMounted || pauseReasons.size > 0 || durationMs <= 0) return;

        countdown.resume();
        isRunning.value = true;
    }

    function handleVisibilityChange() {
        if (document.hidden) pause('page-hidden');
        else resume('page-hidden');
    }

    onMounted(() => {
        isMounted = true;
        document.addEventListener('visibilitychange', handleVisibilityChange);
        handleVisibilityChange();
    });

    onBeforeUnmount(() => {
        isMounted = false;
        document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange,
        );
        countdown.stop();
    });

    return { isRunning, pause, resume };
}
