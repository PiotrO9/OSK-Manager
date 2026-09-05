export function buildBodyAndHeaders(
    body: unknown,
    headers: Record<string, string>,
): BodyInit | undefined {
    if (body === undefined) return undefined;

    if (body instanceof FormData) {
        return body;
    }

    headers['Content-Type'] ??= 'application/json';

    if (
        typeof body === 'string' ||
        body instanceof Blob ||
        body instanceof ArrayBuffer ||
        body instanceof URLSearchParams
    ) {
        return body as BodyInit;
    }

    return JSON.stringify(body ?? {});
}
