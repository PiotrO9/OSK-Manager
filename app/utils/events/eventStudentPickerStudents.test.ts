import { describe, expect, it } from 'vitest';
import type { StudentListItem } from '~/types/students/student';
import {
    filterEventStudentPickerStudents,
    getEventStudentPickerExcludedUserIds,
    getEventStudentPickerStudentsFetchLimit,
    isEventStudentPickerRowSelectionBlocked,
} from './eventStudentPickerStudents';

function makeStudent(
    overrides: Partial<StudentListItem> & Pick<StudentListItem, 'userId'>,
): StudentListItem {
    const { userId, ...rest } = overrides;

    return {
        id: userId,
        userId,
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: `${userId}@example.com`,
        phone: null,
        pkkNumber: null,
        isActive: true,
        createdAt: '2026-08-20T10:00:00.000Z',
        ...rest,
    };
}

describe('eventStudentPickerStudents', () => {
    it('normalizuje limit pobierania kursantów do zakresu BFF', () => {
        expect(getEventStudentPickerStudentsFetchLimit(null)).toBe(100);
        expect(getEventStudentPickerStudentsFetchLimit(0)).toBe(1);
        expect(getEventStudentPickerStudentsFetchLimit(3)).toBe(3);
        expect(getEventStudentPickerStudentsFetchLimit(150)).toBe(100);
    });

    it('normalizuje listę wykluczonych userId', () => {
        expect([
            ...getEventStudentPickerExcludedUserIds([' u-1 ', '', 'u-2']),
        ]).toEqual(['u-1', 'u-2']);
    });

    it('filtruje tylko aktywnych, niewykluczonych kursantów po nazwie lub emailu', () => {
        const students = [
            makeStudent({
                userId: 'u-1',
                firstName: 'Anna',
                lastName: 'Nowak',
                email: 'anna@example.com',
            }),
            makeStudent({
                userId: 'u-2',
                firstName: 'Piotr',
                lastName: 'Zieliński',
                email: 'piotr@example.com',
            }),
            makeStudent({
                userId: 'u-3',
                firstName: 'Karol',
                lastName: 'Kowal',
                email: 'karol@example.com',
                isActive: false,
            }),
        ];

        expect(
            filterEventStudentPickerStudents({
                students,
                query: 'anna',
                excludedUserIds: new Set(),
            }).map((student) => student.userId),
        ).toEqual(['u-1']);

        expect(
            filterEventStudentPickerStudents({
                students,
                query: 'example',
                excludedUserIds: new Set(['u-2']),
            }).map((student) => student.userId),
        ).toEqual(['u-1']);
    });

    it('blokuje wybór tylko dla niewybranych wierszy po osiągnięciu limitu', () => {
        expect(
            isEventStudentPickerRowSelectionBlocked({
                userId: 'u-1',
                selectedUserIds: ['u-1'],
                isCapacityReached: true,
            }),
        ).toBe(false);

        expect(
            isEventStudentPickerRowSelectionBlocked({
                userId: 'u-2',
                selectedUserIds: ['u-1'],
                isCapacityReached: true,
            }),
        ).toBe(true);

        expect(
            isEventStudentPickerRowSelectionBlocked({
                userId: 'u-2',
                selectedUserIds: ['u-1'],
                isCapacityReached: false,
            }),
        ).toBe(false);
    });
});
