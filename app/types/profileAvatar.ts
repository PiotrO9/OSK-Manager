export function normalizeAvatarUrl(raw: unknown): string | null {
    if (typeof raw !== 'string') {
        return null;
    }

    const trimmed = raw.trim();

    return trimmed.length > 0 ? trimmed : null;
}

export function readAvatarUrlFromRecord(
    record: Record<string, unknown>,
): string | null {
    if (Object.prototype.hasOwnProperty.call(record, 'avatarUrl')) {
        return normalizeAvatarUrl(record.avatarUrl);
    }

    return normalizeAvatarUrl(record.avatar_url);
}
