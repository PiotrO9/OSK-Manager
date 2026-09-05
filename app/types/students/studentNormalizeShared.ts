export function parseBooleanLike(raw: unknown, defaultValue: boolean): boolean {
    if (typeof raw === 'boolean') {
        return raw;
    }

    return defaultValue;
}

export function readStringOrNull(raw: unknown): string | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    const s = String(raw).trim();

    return s.length > 0 ? s : null;
}

export function clampInt(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
        return min;
    }

    const n = Math.trunc(value);

    if (n < min) {
        return min;
    }

    if (n > max) {
        return max;
    }

    return n;
}
