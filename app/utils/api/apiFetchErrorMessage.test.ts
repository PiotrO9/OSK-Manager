import { describe, expect, it } from 'vitest';
import { getApiFetchErrorMessage } from './apiFetchErrorMessage';

describe('getApiFetchErrorMessage', () => {
    it.each([
        new Error(
            '[GET] "http://localhost:3000/api/me/payments": <no response> Failed to fetch',
        ),
        { data: { message: '[GET] /api/me/courses: Failed to fetch' } },
        new Error('Failed to fetch'),
    ])('does not expose technical network errors to users', (error) => {
        expect(getApiFetchErrorMessage(error, 'Błąd danych')).toBe(
            'Błąd danych',
        );
    });

    it('keeps an ordinary API message', () => {
        expect(
            getApiFetchErrorMessage(
                { data: { message: 'Brak dostępu do kursów.' } },
                'Błąd danych',
            ),
        ).toBe('Brak dostępu do kursów.');
    });
});
