import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate } from '../date';

describe('formatDate (date.ts) - relative variant', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('powinien zwrócić pusty string dla pustego inputu', () => {
        expect(formatDate('', 'relative')).toBe('');
    });

    it('powinien zwrócić "Now" dla daty sprzed mniej niż minuty', () => {
        const now = new Date('2024-01-01T12:00:00Z');

        vi.setSystemTime(now);
        const dateString = new Date('2024-01-01T12:00:00Z').toISOString();

        expect(formatDate(dateString, 'relative')).toBe('Now');
    });

    it('powinien zwrócić "X min ago" dla daty sprzed mniej niż godziny', () => {
        const now = new Date('2024-01-01T12:30:00Z');

        vi.setSystemTime(now);
        const dateString = new Date('2024-01-01T12:00:00Z').toISOString();

        expect(formatDate(dateString, 'relative')).toBe('30 min ago');
    });

    it('powinien zwrócić "X hrs ago" dla daty sprzed mniej niż dnia', () => {
        const now = new Date('2024-01-01T15:00:00Z');

        vi.setSystemTime(now);
        const dateString = new Date('2024-01-01T12:00:00Z').toISOString();

        expect(formatDate(dateString, 'relative')).toBe('3 hrs ago');
    });

    it('powinien zwrócić sformatowaną datę dla daty starszej niż dzień', () => {
        const now = new Date('2024-01-05T12:00:00Z');

        vi.setSystemTime(now);
        const dateString = new Date('2024-01-01T12:00:00Z').toISOString();
        const result = formatDate(dateString, 'relative');

        expect(result).toMatch(/Jan/);
        expect(result).toMatch(/1/);
    });

    it('powinien zwrócić datę z rokiem jeśli rok jest inny', () => {
        const now = new Date('2024-01-01T12:00:00Z');

        vi.setSystemTime(now);
        const dateString = new Date('2023-01-01T12:00:00Z').toISOString();
        const result = formatDate(dateString, 'relative');

        expect(result).toMatch(/2023/);
    });
});
