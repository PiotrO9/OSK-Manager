import { describe, it, expect } from 'vitest';
import { formatDate } from '../date';

describe('formatDate (format.ts)', () => {
    it('powinien zwrócić pusty string dla pustego inputu', () => {
        expect(formatDate('')).toBe('');
        expect(formatDate(null as unknown as Date)).toBe('');
        expect(formatDate(undefined as unknown as Date)).toBe('');
    });

    it('powinien zwrócić pusty string dla nieprawidłowej daty', () => {
        expect(formatDate('invalid-date')).toBe('');
        expect(formatDate('not-a-date')).toBe('');
    });

    it('powinien sformatować datę w formacie short (domyślnie)', () => {
        const date = new Date('2024-01-15T10:30:00Z');
        const result = formatDate(date);

        expect(result).toMatch(/01/);
        expect(result).toMatch(/15/);
        expect(result).toMatch(/2024/);
    });

    it('powinien sformatować datę z wariantem short', () => {
        const date = new Date('2024-12-25T10:30:00Z');
        const result = formatDate(date, 'short');

        expect(result).toMatch(/12/);
        expect(result).toMatch(/25/);
        expect(result).toMatch(/2024/);
    });

    it('powinien sformatować datę z wariantem long', () => {
        const date = new Date('2024-01-15T10:30:00Z');
        const result = formatDate(date, 'long');

        expect(result).toMatch(/January/);
        expect(result).toMatch(/15/);
        expect(result).toMatch(/2024/);
        expect(result).toMatch(/\d{1,2}/); // godzina (1-2 cyfry)
        expect(result).toMatch(/30/); // minuty
        expect(result).toMatch(/(AM|PM)/); // format 12-godzinny
    });

    it('powinien obsłużyć string jako input', () => {
        const dateString = '2024-01-15T10:30:00Z';
        const result = formatDate(dateString);

        expect(result).toBeTruthy();
        expect(result).not.toBe('');
    });

    it('powinien obsłużyć timestamp jako input', () => {
        const timestamp = new Date('2024-01-15T10:30:00Z').getTime();
        const result = formatDate(timestamp);

        expect(result).toBeTruthy();
        expect(result).not.toBe('');
    });
});
