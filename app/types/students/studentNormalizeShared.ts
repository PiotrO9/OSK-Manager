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

    const trimmedValue = String(raw).trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
}

export function clampInt(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
        return min;
    }

    const integerValue = Math.trunc(value);

    if (integerValue < min) {
        return min;
    }

    if (integerValue > max) {
        return max;
    }

    return integerValue;
}
