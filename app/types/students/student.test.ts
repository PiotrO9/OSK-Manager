import { describe, expect, it } from 'vitest';
import {
    formatStudentCourseStatusLabel,
    getStudentCourseStatusVariant,
    normalizeStudentDetail,
    normalizeStudentListItem,
} from './student';

describe('student domain types', () => {
    it('normalizes list avatar url from backend aliases', () => {
        expect(
            normalizeStudentListItem({
                id: ' profile-1 ',
                user_id: ' user-1 ',
                first_name: ' Anna ',
                last_name: ' Nowak ',
                email: ' ANNA@example.com ',
                phone: ' 123 ',
                pkk_number: ' PKK123 ',
                is_active: true,
                created_at: '2026-09-03T10:00:00.000Z',
                avatar_url: ' https://cdn.example/student.jpg ',
            })?.avatarUrl,
        ).toBe('https://cdn.example/student.jpg');
    });

    it('normalizes student profile details with course assignments', () => {
        expect(
            normalizeStudentDetail({
                id: ' profile-1 ',
                user_id: ' user-1 ',
                first_name: ' Anna ',
                last_name: ' Nowak ',
                email: ' ANNA@example.com ',
                pkk_number: ' PKK123 ',
                notes: ' ważna notatka ',
                courses: [
                    {
                        id: ' course-1 ',
                        title: ' Kurs B ',
                        category_code: ' B ',
                        status: ' active ',
                    },
                    {
                        id: 'course-without-status',
                        name: 'Kurs dodatkowy',
                    },
                    {
                        id: '',
                        name: 'Pominiety kurs',
                    },
                ],
            }),
        ).toEqual({
            id: 'profile-1',
            userId: 'user-1',
            firstName: 'Anna',
            lastName: 'Nowak',
            email: 'anna@example.com',
            pkkNumber: 'PKK123',
            notes: 'ważna notatka',
            courses: [
                {
                    id: 'course-1',
                    name: 'Kurs B',
                    category: 'B',
                    status: 'ACTIVE',
                },
                {
                    id: 'course-without-status',
                    name: 'Kurs dodatkowy',
                    category: '',
                    status: 'UNKNOWN',
                },
            ],
        });
    });

    it('formats student course status labels and badge variants', () => {
        expect(formatStudentCourseStatusLabel(' active ')).toBe('Aktywny');
        expect(formatStudentCourseStatusLabel('finished')).toBe('Zakończony');
        expect(formatStudentCourseStatusLabel('')).toBe('Nieznany');
        expect(formatStudentCourseStatusLabel('paused')).toBe('Nieznany');

        expect(getStudentCourseStatusVariant('ACTIVE')).toBe('default');
        expect(getStudentCourseStatusVariant('FINISHED')).toBe('secondary');
        expect(getStudentCourseStatusVariant('PAUSED')).toBe('outline');
    });
});
