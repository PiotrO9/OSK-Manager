import { describe, expect, it } from 'vitest';
import {
    buildManagerLessonBookingSubmitBody,
    filterManagerLessonBookingAvailableInstructors,
    filterManagerLessonBookingCourses,
    readManagerLessonBookingFetchStatusCode,
} from '~/utils/lessons/managerLessonBookingDialog';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';

const slotCtx: LessonBookingSlotContext = {
    date: '2026-06-26',
    startTime: '09:00',
    endTime: '10:00',
    schoolId: 'school-1',
    availableInstructors: [
        { id: 'instructor-a', firstName: 'Anna', lastName: 'Nowak' },
        { id: 'instructor-b', firstName: 'Jan', lastName: 'Kowalski' },
    ],
};

const practicalCourse: StudentCourseWithKind = {
    id: 'course-1',
    name: 'Kurs B',
    category: 'B',
    status: 'ACTIVE',
    kind: 'PRACTICAL',
};

describe('manager lesson booking dialog helpers', () => {
    it('filters booking courses to practical, extra, and unknown kind', () => {
        expect(
            filterManagerLessonBookingCourses([
                practicalCourse,
                { ...practicalCourse, id: 'course-2', kind: 'EXTRA' },
                { ...practicalCourse, id: 'course-3', kind: null },
                { ...practicalCourse, id: 'course-4', kind: 'THEORY_GROUP' },
            ]),
        ).toEqual([
            practicalCourse,
            { ...practicalCourse, id: 'course-2', kind: 'EXTRA' },
            { ...practicalCourse, id: 'course-3', kind: null },
        ]);
    });

    it('keeps only instructors qualified for the selected course category', () => {
        const schoolInstructors: InstructorListItem[] = [
            {
                id: 'instructor-a',
                firstName: 'Anna',
                lastName: 'Nowak',
                email: '',
                qualifiedCourseTypes: [{ id: 'ct-b', code: 'B', name: 'B' }],
            },
            {
                id: 'instructor-b',
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: '',
                qualifiedCourseTypes: [{ id: 'ct-a', code: 'A', name: 'A' }],
            },
        ];

        expect(
            filterManagerLessonBookingAvailableInstructors({
                slotCtx,
                selectedCourse: practicalCourse,
                schoolInstructors,
            }),
        ).toEqual([
            { id: 'instructor-a', firstName: 'Anna', lastName: 'Nowak' },
        ]);
    });

    it('builds the lesson create payload from selected ids and slot context', () => {
        expect(
            buildManagerLessonBookingSubmitBody({
                slotCtx,
                studentUserId: 'student-1',
                courseId: 'course-1',
                instructorId: 'instructor-a',
                vehicleId: 'vehicle-1',
            }),
        ).toMatchObject({
            ok: true,
            body: {
                courseId: 'course-1',
                studentId: 'student-1',
                instructorId: 'instructor-a',
                lessonType: 'PRACTICE',
                vehicleId: 'vehicle-1',
            },
        });
    });

    it('extracts conflict status code from fetch-like errors', () => {
        expect(
            readManagerLessonBookingFetchStatusCode({ statusCode: 409 }),
        ).toBe(409);
        expect(
            readManagerLessonBookingFetchStatusCode(new Error('x')),
        ).toBeUndefined();
    });
});
