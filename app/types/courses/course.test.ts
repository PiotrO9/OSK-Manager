import { describe, expect, it } from 'vitest';
import {
    normalizeCourseDetailData,
    normalizeCoursesList,
    normalizeMyCoursesList,
} from './course';

describe('course normalizers', () => {
    it('normalizes nested manager course list payloads and skips invalid rows', () => {
        expect(
            normalizeCoursesList({
                courses: [
                    {
                        id: 'course-1',
                        name: 'Kurs B',
                        category: 'B',
                        type: 'PRACTICAL',
                        totalHours: '30',
                        courseType: {
                            id: 'type-b',
                            code: 'B',
                            name: 'Kategoria B',
                        },
                        instructor: {
                            id: 'instructor-1',
                            name: 'Anna Nowak',
                        },
                    },
                    {
                        id: '',
                        name: 'Brak ID',
                        category: 'B',
                        type: 'PRACTICAL',
                        totalHours: 30,
                    },
                ],
            }),
        ).toEqual([
            {
                id: 'course-1',
                name: 'Kurs B',
                category: 'B',
                courseType: {
                    id: 'type-b',
                    code: 'B',
                    name: 'Kategoria B',
                },
                type: 'PRACTICAL',
                totalHours: 30,
                instructor: {
                    id: 'instructor-1',
                    name: 'Anna Nowak',
                },
            },
        ]);
    });

    it('normalizes course detail from wrapped or flat payloads', () => {
        expect(
            normalizeCourseDetailData({
                course: {
                    id: 'course-1',
                    name: 'Kurs B',
                    category: 'B',
                    kind: 'THEORY_GROUP',
                    totalHours: 30,
                    capacity: '12',
                    school: {
                        id: 'school-1',
                    },
                },
            }),
        ).toMatchObject({
            id: 'course-1',
            type: 'THEORY_GROUP',
            capacity: 12,
            schoolId: 'school-1',
        });

        expect(
            normalizeCourseDetailData({
                id: 'course-2',
                name: 'Kurs C',
                category: 'C',
                type: 'PRACTICAL',
                totalHours: 20,
                capacity: null,
            }),
        ).toMatchObject({
            id: 'course-2',
            capacity: null,
        });
    });

    it('normalizes current user courses from nested payloads', () => {
        expect(
            normalizeMyCoursesList({
                data: [
                    {
                        id: 'course-1',
                        school_id: 'school-1',
                        name: 'Kurs B',
                        status: 'ACTIVE',
                        kind: 'PRACTICAL',
                        total_hours: '30',
                        progress: 130,
                    },
                    {
                        id: 'course-2',
                        schoolId: 'school-1',
                        name: 'Nieznany status',
                        status: 'PENDING',
                        type: 'PRACTICAL',
                        totalHours: 10,
                    },
                ],
            }),
        ).toEqual([
            {
                id: 'course-1',
                schoolId: 'school-1',
                name: 'Kurs B',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 30,
                progress: 100,
            },
        ]);
    });

    it('returns empty values for unsupported payload shapes', () => {
        expect(normalizeCoursesList(null)).toEqual([]);
        expect(normalizeMyCoursesList({ data: null })).toEqual([]);
        expect(normalizeCourseDetailData({ course: null })).toBeNull();
    });
});
