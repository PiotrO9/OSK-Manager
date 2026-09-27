import { describe, expect, it } from 'vitest';
import {
    buildManagerLessonPatchBody,
    mergeManagerLessonAfterUpdate,
    normalizeManagerLesson,
    readManagerLessonIdFromNestedObject,
} from './managerLessonsApi';

describe('manager lessons api model', () => {
    it('reads ids from nested objects with string and scalar id values', () => {
        expect(readManagerLessonIdFromNestedObject({ id: ' lesson-1 ' })).toBe(
            'lesson-1',
        );
        expect(readManagerLessonIdFromNestedObject({ id: 123 })).toBe('123');
        expect(readManagerLessonIdFromNestedObject({ id: {} })).toBe('');
        expect(readManagerLessonIdFromNestedObject(null)).toBe('');
    });

    it('normalizes lesson details with nested instructor, student and vehicle', () => {
        expect(
            normalizeManagerLesson({
                id: ' lesson-1 ',
                course_id: ' course-1 ',
                school_id: ' school-1 ',
                student: {
                    id: ' student-1 ',
                    userId: ' user-1 ',
                    firstName: ' Anna ',
                    lastName: ' Nowak ',
                },
                instructor: {
                    id: ' instructor-1 ',
                    first_name: ' Jan ',
                    last_name: ' Kowalski ',
                    Email: ' jan@example.com ',
                },
                assignedCourseInstructor: {
                    id: ' instructor-2 ',
                    name: ' Anna Nowak ',
                },
                vehicle: {
                    id: ' vehicle-1 ',
                    name: 'Toyota',
                    registration_number: 'KR12345',
                    status: 'ACTIVE',
                },
                lesson_type: '',
                start_time: ' 10:00 ',
                end_time: ' 11:00 ',
                status: ' planned ',
                bookingMaxDaysAhead: 14,
                schoolWorkingDaysMask: 126,
            }),
        ).toMatchObject({
            id: 'lesson-1',
            courseId: 'course-1',
            schoolId: 'school-1',
            studentId: 'student-1',
            studentUserId: 'user-1',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
            lessonType: 'PRACTICE',
            startTime: '10:00',
            endTime: '11:00',
            status: 'planned',
            bookingMaxDaysAhead: 14,
            schoolWorkingDaysMask: 126,
            student: {
                firstName: 'Anna',
                lastName: 'Nowak',
            },
            lessonInstructor: {
                id: 'instructor-1',
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: 'jan@example.com',
            },
            assignedCourseInstructor: {
                id: 'instructor-2',
                name: 'Anna Nowak',
            },
            lessonVehicle: {
                id: 'vehicle-1',
                registrationNumber: 'KR12345',
            },
        });
    });

    it('drops mismatched nested instructor and vehicle from normalized result', () => {
        expect(
            normalizeManagerLesson({
                id: 'lesson-1',
                courseId: 'course-1',
                studentId: 'student-1',
                instructorId: 'instructor-1',
                instructor: { id: 'instructor-2' },
                vehicleId: 'vehicle-1',
                vehicle: { id: 'vehicle-2', name: 'Toyota' },
                startTime: '10:00',
                endTime: '11:00',
                status: 'planned',
            }),
        ).toEqual({
            id: 'lesson-1',
            courseId: 'course-1',
            studentId: 'student-1',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
            lessonType: 'PRACTICE',
            startTime: '10:00',
            endTime: '11:00',
            status: 'planned',
        });
    });

    it('preserves student display data after a partial PATCH response', () => {
        const previous = normalizeManagerLesson({
            id: 'lesson-1',
            courseId: 'course-1',
            student: {
                id: 'student-profile-1',
                userId: 'user-1',
                firstName: 'Anna',
                lastName: 'Nowak',
            },
            instructor: {
                id: 'instructor-1',
                firstName: 'Jan',
                lastName: 'Kowalski',
            },
            vehicle: { id: 'vehicle-1', name: 'Toyota' },
            schoolId: 'school-1',
            startTime: '2026-10-01T09:00:00.000Z',
            endTime: '2026-10-01T10:00:00.000Z',
            status: 'SCHEDULED',
        });
        const updated = normalizeManagerLesson({
            id: 'lesson-1',
            courseId: 'course-1',
            studentId: 'student-profile-1',
            instructorId: 'instructor-2',
            vehicleId: 'vehicle-1',
            startTime: '2026-10-01T10:00:00.000Z',
            endTime: '2026-10-01T11:00:00.000Z',
            status: 'SCHEDULED',
        });

        expect(previous).not.toBeNull();
        expect(updated).not.toBeNull();

        const merged = mergeManagerLessonAfterUpdate(previous!, updated!);

        expect(merged).toMatchObject({
            studentId: 'student-profile-1',
            studentUserId: 'user-1',
            student: { firstName: 'Anna', lastName: 'Nowak' },
            schoolId: 'school-1',
            lessonVehicle: { id: 'vehicle-1' },
            startTime: '2026-10-01T10:00:00.000Z',
        });
        expect(merged.lessonInstructor).toBeUndefined();
    });

    it('returns null for incomplete lesson responses', () => {
        expect(
            normalizeManagerLesson({
                id: 'lesson-1',
                courseId: 'course-1',
                startTime: '10:00',
                status: 'planned',
            }),
        ).toBeNull();
    });

    it('builds patch body from defined fields only', () => {
        expect(
            buildManagerLessonPatchBody({
                startTime: ' 08:00 ',
                endTime: undefined,
                instructorId: ' instructor-1 ',
                vehicleId: '',
            }),
        ).toEqual({
            startTime: '08:00',
            instructorId: 'instructor-1',
            vehicleId: '',
        });
    });
});
