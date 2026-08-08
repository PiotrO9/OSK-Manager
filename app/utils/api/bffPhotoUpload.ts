export function normalizeBffPhotoUrl(data: unknown): string | null {
    if (data === null || typeof data !== 'object') {
        return null;
    }

    const photoUrl = (data as { photoUrl?: unknown }).photoUrl;

    if (typeof photoUrl !== 'string') {
        return null;
    }

    const trimmed = photoUrl.trim();

    return trimmed.length > 0 ? trimmed : null;
}
