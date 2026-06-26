/**
 * Tryb lokalny (bez upstream): URL avatara po uploadzie, odczytywany w GET /api/auth/me.
 */
const userIdToAvatarUrl = new Map<string, string>();

export function mockUserAvatarSetUrl(userId: string, url: string): void {
    userIdToAvatarUrl.set(userId, url);
}

export function mockUserAvatarGetUrl(userId: string): string | null {
    return userIdToAvatarUrl.get(userId) ?? null;
}
