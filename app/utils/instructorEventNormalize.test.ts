import { describe, expect, it } from 'vitest';
import {
    normalizeInstructorEventFromApi,
    readNestedEventStudents,
    readNestedInstructorListItem,
} from './instructorEventNormalize';

describe('instructorEventNormalize', () => {
    it('reads nested instructor list item from snake and camel case fields', () => {
        expect(
            readNestedInstructorListItem({
                id: ' instructor-1 ',
                first_name: ' Anna ',
                last_name: ' Nowak ',
                email: ' anna@example.test ',
                phone: ' 123 ',
            }),
        ).toEqual({
            id: 'instructor-1',
            firstName: 'Anna',
            lastName: 'Nowak',
            email: 'anna@example.test',
            phone: '123',
        });
    });

    it('normalizes nested event students and ignores incomplete rows', () => {
        expect(
            readNestedEventStudents([
                {
                    id: ' student-profile-1 ',
                    user_id: ' user-1 ',
                    first_name: ' Jan ',
                    last_name: ' Kowalski ',
                    email: ' jan@example.test ',
                },
                { id: 'missing-user' },
            ]),
        ).toEqual([
            {
                id: 'student-profile-1',
                userId: 'user-1',
                firstName: 'Jan',
                lastName: 'Kowalski',
                email: 'jan@example.test',
                phone: null,
            },
        ]);
    });

    it('normalizes event ids and nested payloads without dropping base fields', () => {
        expect(
            normalizeInstructorEventFromApi({
                id: 'event-1',
                type: 'THEORY',
                instructor: {
                    id: ' instructor-1 ',
                    firstName: 'Anna',
                    lastName: 'Nowak',
                    email: 'anna@example.test',
                },
                vehicle: { id: ' vehicle-1 ' },
                course_id: ' course-1 ',
                status: ' PLANNED ',
                startTime: '2026-06-26T10:00:00.000Z',
                endTime: '2026-06-26T11:00:00.000Z',
                freeWindows: [
                    {
                        start_time: '2026-06-26T09:00:00.000Z',
                        end_time: '2026-06-26T12:00:00.000Z',
                    },
                ],
                students: [
                    {
                        id: 'student-profile-1',
                        userId: 'user-1',
                        firstName: 'Jan',
                        lastName: 'Kowalski',
                        email: 'jan@example.test',
                    },
                ],
            }),
        ).toMatchObject({
            id: 'event-1',
            type: 'THEORY',
            instructorId: 'instructor-1',
            vehicleId: 'vehicle-1',
            courseId: 'course-1',
            status: 'PLANNED',
            eventInstructor: {
                id: 'instructor-1',
                firstName: 'Anna',
                lastName: 'Nowak',
            },
            freeWindows: [
                {
                    startTime: '2026-06-26T09:00:00.000Z',
                    endTime: '2026-06-26T12:00:00.000Z',
                },
            ],
            students: [
                {
                    id: 'student-profile-1',
                    userId: 'user-1',
                },
            ],
        });
    });
});
