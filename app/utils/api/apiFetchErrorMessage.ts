function toUserMessage(value: unknown, fallback: string): string | null {
    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    const message = value.trim();

    if (
        /(?:https?:\/\/|\/api\/)/i.test(message) ||
        /\b(?:failed to fetch|fetch failed|networkerror)\b/i.test(message)
    ) {
        return fallback;
    }

    return message;
}

export function getApiFetchErrorMessage(
    err: unknown,
    fallback: string,
): string {
    if (typeof err === 'object' && err !== null && 'data' in err) {
        const data = (err as { data?: unknown }).data;

        if (data && typeof data === 'object') {
            const d = data as { message?: unknown; statusMessage?: unknown };

            const statusMessage = toUserMessage(d.statusMessage, fallback);

            if (statusMessage) {
                return statusMessage;
            }

            const message = toUserMessage(d.message, fallback);

            if (message) {
                return message;
            }
        }
    }

    if (err instanceof Error) {
        return toUserMessage(err.message, fallback) ?? fallback;
    }

    return fallback;
}
