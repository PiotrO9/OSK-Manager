export interface JwtPayload {
    sub?: string;
    userId?: string;
    userName?: string;
    email?: string;
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');

        if (parts.length !== 3) return null;

        const base64Url = parts[1];
        const base64 = base64Url?.replace(/-/g, '+').replace(/_/g, '/');

        if (!base64) return null;

        let jsonPayload: string;

        try {
            jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(
                        (c) =>
                            `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`,
                    )
                    .join(''),
            );
        } catch {
            return null;
        }

        return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeJwt(token);

    if (!payload?.exp) return false;

    const now = Math.floor(Date.now() / 1000);

    return payload.exp < now;
}
