import { describe, expect, it } from 'vitest';
import {
    buildManagerEventTheoryStudentDraft,
    formatManagerEventTheoryCapacitySummary,
    getManagerEventCanonicalParticipantUserId,
    getManagerEventCapacityLimitError,
    getNextManagerEventTheoryStudentDraft,
    isManagerEventEligibleRowInteractive,
    isManagerEventTheoryRowChecked,
    isManagerEventTheoryStudentsDirty,
    readManagerEventStudentUserIds,
    resolveManagerEventCapacityForStudentPicker,
    sortManagerEventParticipantIds,
} from './managerEventParticipants';
import type {
    InstructorEvent,
    TheoryEventEligibleStudentRow,
    TheoryEventEligibleStudentsData,
} from '~/types/events/instructorEvent';
import type { StudentListItem } from '~/types/students/student';

const event = (overrides: Partial<InstructorEvent> = {}): InstructorEvent => ({
    id: 'event-1',
    instructorId: 'instructor-1',
    type: 'THEORY',
    startTime: '2026-06-26T08:00:00.000Z',
    endTime: '2026-06-26T09:00:00.000Z',
    vehicleId: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
});

const student = (
    overrides: Partial<StudentListItem> = {},
): StudentListItem => ({
    id: overrides.id ?? 'profile-1',
    userId: overrides.userId ?? 'user-1',
    firstName: overrides.firstName ?? 'Anna',
    lastName: overrides.lastName ?? 'Nowak',
    email: overrides.email ?? 'anna@example.test',
    phone: overrides.phone ?? null,
    pkkNumber: overrides.pkkNumber ?? null,
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? '2026-06-01T00:00:00.000Z',
});

const eligibleRow = (
    overrides: Partial<TheoryEventEligibleStudentRow> = {},
): TheoryEventEligibleStudentRow => ({
    id: 'profile-1',
    userId: 'user-1',
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna@example.test',
    phone: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    isAssignedToEvent: false,
    hasScheduleConflict: false,
    canAssign: true,
    ...overrides,
});

const eligibleData = (
    capacity: TheoryEventEligibleStudentsData['capacity'],
): TheoryEventEligibleStudentsData => ({
    courseId: 'course-1',
    capacity,
    students: [],
});

describe('manager event participants model', () => {
    it('normalizes participant ids for stable comparison', () => {
        expect(sortManagerEventParticipantIds([' b ', '', 'a', ' c '])).toEqual(
            ['a', 'b', 'c'],
        );
    });

    it('reads clean student user ids from an event', () => {
        expect(
            readManagerEventStudentUserIds(
                event({ studentUserIds: [' user-2 ', '', 'user-1'] }),
            ),
        ).toEqual(['user-2', 'user-1']);
    });

    it('builds baseline and draft ids from an event', () => {
        expect(
            buildManagerEventTheoryStudentDraft(
                event({ studentUserIds: [' user-2 ', 'user-1'] }),
            ),
        ).toEqual({
            baselineIds: ['user-1', 'user-2'],
            draftIds: ['user-2', 'user-1'],
        });
        expect(buildManagerEventTheoryStudentDraft(null)).toEqual({
            baselineIds: [],
            draftIds: [],
        });
    });

    it('matches draft ids by user id or profile id', () => {
        expect(
            isManagerEventTheoryRowChecked({
                row: student({ id: 'profile-1', userId: 'user-1' }),
                draftIds: ['profile-1'],
            }),
        ).toBe(true);
        expect(
            isManagerEventTheoryRowChecked({
                row: student({ id: 'profile-1', userId: 'user-1' }),
                draftIds: ['user-1'],
            }),
        ).toBe(true);
    });

    it('uses user id as the canonical selected id and falls back to profile id', () => {
        expect(getManagerEventCanonicalParticipantUserId(student())).toBe(
            'user-1',
        );
        expect(
            getManagerEventCanonicalParticipantUserId(student({ userId: ' ' })),
        ).toBe('profile-1');
    });

    it('formats capacity summary for limited and unlimited theory events', () => {
        expect(
            formatManagerEventTheoryCapacitySummary(
                eligibleData({ limit: null, used: 3, remaining: null }),
            ),
        ).toBe('Miejsca na evencie: 3 (bez limitu)');
        expect(
            formatManagerEventTheoryCapacitySummary(
                eligibleData({ limit: 8, used: 5, remaining: 3 }),
            ),
        ).toBe('Miejsca: 5 / 8 (wolnych: 3)');
    });

    it('detects dirty theory student draft only for theory events', () => {
        expect(
            isManagerEventTheoryStudentsDirty({
                event: event({ type: 'DRIVE' }),
                draftIds: ['user-2'],
                baselineIds: ['user-1'],
            }),
        ).toBe(false);
        expect(
            isManagerEventTheoryStudentsDirty({
                event: event(),
                draftIds: ['user-2'],
                baselineIds: ['user-1'],
            }),
        ).toBe(true);
    });

    it('resolves capacity picker fallback when raw input is invalid or empty', () => {
        expect(
            resolveManagerEventCapacityForStudentPicker({
                parsedCapacity: false,
                eventCapacity: 12,
            }),
        ).toBe(12);
        expect(
            resolveManagerEventCapacityForStudentPicker({
                parsedCapacity: null,
                eventCapacity: 10,
            }),
        ).toBe(10);
        expect(
            resolveManagerEventCapacityForStudentPicker({
                parsedCapacity: 7,
                eventCapacity: 10,
            }),
        ).toBe(7);
    });

    it('blocks adding a new student over capacity but allows already checked rows', () => {
        expect(
            getManagerEventCapacityLimitError({
                nextChecked: true,
                capacity: 2,
                isAlreadyChecked: false,
                draftCount: 2,
            }),
        ).toContain('Osiągnięto limit miejsc');
        expect(
            getManagerEventCapacityLimitError({
                nextChecked: true,
                capacity: 2,
                isAlreadyChecked: true,
                draftCount: 2,
            }),
        ).toBeNull();
    });

    it('calculates next selected student draft', () => {
        expect(
            getNextManagerEventTheoryStudentDraft({
                row: student({ id: 'profile-1', userId: 'user-1' }),
                nextChecked: true,
                draftIds: ['user-2'],
            }),
        ).toEqual(['user-2', 'user-1']);
        expect(
            getNextManagerEventTheoryStudentDraft({
                row: student({ id: 'profile-1', userId: 'user-1' }),
                nextChecked: false,
                draftIds: ['profile-1', 'user-2'],
            }),
        ).toEqual(['user-2']);
    });

    it('keeps assigned rows interactive even when they cannot be newly assigned', () => {
        expect(
            isManagerEventEligibleRowInteractive(
                eligibleRow({ isAssignedToEvent: true, canAssign: false }),
            ),
        ).toBe(true);
        expect(
            isManagerEventEligibleRowInteractive(
                eligibleRow({ isAssignedToEvent: false, canAssign: false }),
            ),
        ).toBe(false);
    });
});
