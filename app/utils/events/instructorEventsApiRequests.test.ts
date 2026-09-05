import { describe, expect, it } from 'vitest';

import {
    buildCreateInstructorEventRequestBody,
    buildPatchInstructorEventRequestBody,
    buildTheoryEventEligibleStudentsQuery,
    isTheoryInstructorEvent,
} from './instructorEventsApiRequests';

describe('instructor event API request helpers', () => {
    it('builds a trimmed drive event create request', () => {
        expect(
            buildCreateInstructorEventRequestBody({
                instructorId: ' instructor-1 ',
                type: 'DRIVE',
                startTime: ' 2026-08-16T08:00:00.000Z ',
                endTime: ' 2026-08-16T09:00:00.000Z ',
                vehicleId: ' vehicle-1 ',
                capacity: 2,
            }),
        ).toEqual({
            instructorId: 'instructor-1',
            type: 'DRIVE',
            startTime: '2026-08-16T08:00:00.000Z',
            endTime: '2026-08-16T09:00:00.000Z',
            vehicleId: 'vehicle-1',
            capacity: 2,
        });
    });

    it('builds a theory event create request with course id and capacity', () => {
        expect(
            buildCreateInstructorEventRequestBody({
                instructorId: 'instructor-1',
                type: 'THEORY',
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
                vehicleId: 'ignored',
                capacity: 12,
                courseId: ' course-1 ',
            }),
        ).toEqual({
            instructorId: 'instructor-1',
            type: 'THEORY',
            startTime: '2026-08-16T08:00:00.000Z',
            endTime: '2026-08-16T09:00:00.000Z',
            capacity: 12,
            courseId: 'course-1',
        });
    });

    it('builds a patch request with only provided fields', () => {
        expect(
            buildPatchInstructorEventRequestBody({
                instructorId: ' instructor-2 ',
                vehicleId: null,
                status: 'DONE',
            }),
        ).toEqual({
            instructorId: 'instructor-2',
            vehicleId: null,
            status: 'DONE',
        });
    });

    it('detects theory events defensively', () => {
        expect(isTheoryInstructorEvent({ type: ' theory ' } as never)).toBe(
            true,
        );
        expect(isTheoryInstructorEvent({ type: 'DRIVE' } as never)).toBe(false);
    });

    it('builds eligible students query only when both dates are present', () => {
        expect(
            buildTheoryEventEligibleStudentsQuery({
                startTime: ' 2026-08-16T08:00:00.000Z ',
                endTime: '2026-08-16T09:00:00.000Z',
            }),
        ).toBe(
            '?startTime=2026-08-16T08%3A00%3A00.000Z&endTime=2026-08-16T09%3A00%3A00.000Z',
        );
        expect(
            buildTheoryEventEligibleStudentsQuery({
                startTime: '2026-08-16T08:00:00.000Z',
            }),
        ).toBe('');
    });
});
