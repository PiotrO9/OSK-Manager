import { describe, expect, it } from 'vitest';
import { validateEventStudentsBody } from './eventStudentsBody';

const studentId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('validateEventStudentsBody', () => {
    it('accepts a participant draft with a valid override window', () => {
        expect(
            validateEventStudentsBody(
                {
                    studentIds: [studentId],
                    startTime: '2026-09-25T08:00:00.000Z',
                    endTime: '2026-09-25T09:00:00.000Z',
                },
                { allowWindow: true },
            ),
        ).toEqual({
            ok: true,
            data: {
                studentIds: [studentId],
                startTime: '2026-09-25T08:00:00.000Z',
                endTime: '2026-09-25T09:00:00.000Z',
            },
        });
    });

    it('rejects an incomplete or non-positive override window', () => {
        expect(
            validateEventStudentsBody(
                {
                    studentIds: [studentId],
                    startTime: '2026-09-25T08:00:00.000Z',
                },
                { allowWindow: true },
            ).ok,
        ).toBe(false);
        expect(
            validateEventStudentsBody(
                {
                    studentIds: [studentId],
                    startTime: '2026-09-25T09:00:00.000Z',
                    endTime: '2026-09-25T08:00:00.000Z',
                },
                { allowWindow: true },
            ).ok,
        ).toBe(false);
    });

    it('rejects duplicate student ids', () => {
        expect(
            validateEventStudentsBody({ studentIds: [studentId, studentId] })
                .ok,
        ).toBe(false);
    });
});
