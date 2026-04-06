export function getApiFetchErrorMessage(
    err: unknown,
    fallback: string,
): string {
    if (typeof err === 'object' && err !== null && 'data' in err) {
        const data = (err as { data?: unknown }).data;

        if (data && typeof data === 'object') {
            const d = data as { message?: unknown; statusMessage?: unknown };

            if (
                typeof d.statusMessage === 'string' &&
                d.statusMessage.trim().length > 0
            ) {
                return d.statusMessage.trim();
            }

            if (typeof d.message === 'string' && d.message.trim().length > 0) {
                return d.message.trim();
            }
        }
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return fallback;
}
