import { describe, expect, it } from 'vitest';
import {
    isUuid,
    readQueryTruthyFlag,
    readUuidQueryValue,
    resolveAssignToCourseError,
    resolveStudentsListError,
} from './managerStudentsPage';

describe('manager students page helpers', () => {
    it('reads truthy query flags from supported string values', () => {
        expect(readQueryTruthyFlag('1')).toBe(true);
        expect(readQueryTruthyFlag(' true ')).toBe(true);
        expect(readQueryTruthyFlag('YES')).toBe(true);
        expect(readQueryTruthyFlag(['yes'])).toBe(true);
        expect(readQueryTruthyFlag('0')).toBe(false);
        expect(readQueryTruthyFlag(true)).toBe(false);
        expect(readQueryTruthyFlag(null)).toBe(false);
    });

    it('validates and reads uuid query values', () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';

        expect(isUuid(` ${id} `)).toBe(true);
        expect(isUuid('not-a-uuid')).toBe(false);
        expect(readUuidQueryValue(id)).toBe(id);
        expect(readUuidQueryValue([` ${id} `])).toBe(id);
        expect(readUuidQueryValue('not-a-uuid')).toBeNull();
        expect(readUuidQueryValue(null)).toBeNull();
    });

    it('maps assign-to-course API status errors to user messages', () => {
        expect(resolveAssignToCourseError({ statusCode: 409 })).toBe(
            'Ten kursant jest już zapisany na wybrany kurs.',
        );
        expect(resolveAssignToCourseError({ statusCode: 403 })).toBe(
            'Brak uprawnień do przypisania w tej szkole.',
        );
        expect(resolveAssignToCourseError({ statusCode: 404 })).toBe(
            'Nie znaleziono kursu lub kursanta.',
        );
        expect(
            resolveAssignToCourseError({
                statusCode: 400,
                data: { message: 'Niepoprawny kurs' },
            }),
        ).toBe('Niepoprawny kurs');
        expect(resolveAssignToCourseError({ statusCode: 500 })).toBe(
            'Serwer jest chwilowo niedostępny. Spróbuj ponownie.',
        );
    });

    it('maps students list API status errors to user messages', () => {
        expect(resolveStudentsListError({ statusCode: 403 })).toBe(
            'Brak dostępu do listy kursantów dla wybranej szkoły.',
        );
        expect(resolveStudentsListError({ statusCode: 404 })).toBe(
            'Nie znaleziono wybranego kursu lub kurs nie należy do tej OSK.',
        );
        expect(resolveStudentsListError({ statusCode: 503 })).toBe(
            'Serwer jest chwilowo niedostępny. Spróbuj ponownie.',
        );
    });

    it('uses explicit error messages and fallbacks', () => {
        expect(resolveAssignToCourseError(new Error('Assign failed'))).toBe(
            'Assign failed',
        );
        expect(resolveStudentsListError(new Error('List failed'))).toBe(
            'List failed',
        );
        expect(resolveAssignToCourseError({ data: {} })).toBe(
            'Nie udało się zapisać kursanta na kurs.',
        );
        expect(resolveStudentsListError({ data: {} })).toBe(
            'Nie udało się pobrać listy kursantów.',
        );
    });
});
