import { useAuthSession } from '~/composables/auth/useAuthSession';
import { showAuthPrivacyCurtain } from '~/utils/auth/authPrivacyCurtain';

const REVALIDATION_INTERVAL_MS = 60_000;

export default defineNuxtPlugin({
    enforce: 'post',
    setup() {
        const {
            session,
            sessionVerifiedAt,
            revalidateSessionInBackground,
            discardSession,
        } = useAuthSession();
        const isLoggingOut = useState<boolean>('auth_logging_out', () => false);
        let lastAttemptAt = 0;
        let inFlight = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        function clearTimer(): void {
            if (timer !== undefined) {
                clearTimeout(timer);
                timer = undefined;
            }
        }

        function schedule(): void {
            clearTimer();

            if (
                document.visibilityState !== 'visible' ||
                inFlight ||
                isLoggingOut.value ||
                !session.value?.userId ||
                session.value.userId === 'demo'
            ) {
                return;
            }

            const nextAttemptAt =
                Math.max(lastAttemptAt, sessionVerifiedAt.value) +
                REVALIDATION_INTERVAL_MS;

            timer = setTimeout(
                () => void revalidate(),
                Math.max(0, nextAttemptAt - Date.now()),
            );
        }

        async function revalidate(): Promise<void> {
            if (inFlight || document.visibilityState !== 'visible') {
                schedule();

                return;
            }

            inFlight = true;
            lastAttemptAt = Date.now();
            clearTimer();

            try {
                const result = await revalidateSessionInBackground();

                if (result === 'invalid' || result === 'changed') {
                    showAuthPrivacyCurtain();
                    discardSession();
                    window.location.replace(
                        result === 'changed' ? '/' : '/login',
                    );
                }
            } catch {
                // Keep the known session on unexpected transport errors.
                // The next check is scheduled below.
            } finally {
                inFlight = false;
                schedule();
            }
        }

        const stopWatching = watch(
            [session, sessionVerifiedAt, isLoggingOut],
            schedule,
            { immediate: true },
        );

        document.addEventListener('visibilitychange', schedule);

        if (import.meta.hot) {
            import.meta.hot.dispose(() => {
                stopWatching();
                clearTimer();
                document.removeEventListener('visibilitychange', schedule);
            });
        }
    },
});
