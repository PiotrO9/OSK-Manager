import type { InstructorEvent } from '~/types/events/instructorEvent';
import { isoInstantToDatetimeLocalString } from '~/utils/date/weeklyCalendarDates';

export interface ManagerEventEditFormSnapshot {
    type: 'DRIVE' | 'THEORY';
    start: string;
    end: string;
    vehicle: string;
    capacity: string;
    instructorId: string;
}

export interface ManagerEventEditCurrentSnapshotInput {
    type: 'DRIVE' | 'THEORY';
    startLocal: string;
    endLocal: string;
    vehicleId: string;
    capacityInput: unknown;
    instructorId: string;
}

export function localDatetimeToIso(local: string): string | null {
    const t = local.trim();

    if (!t) {
        return null;
    }

    const d = new Date(t);

    if (Number.isNaN(d.getTime())) {
        return null;
    }

    return d.toISOString();
}

export function parseManagerEventCapacity(raw: unknown): number | null | false {
    if (raw === null || raw === undefined) {
        return null;
    }

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return null;
        }

        if (raw < 0) {
            return false;
        }

        return Math.trunc(raw);
    }

    const t = String(raw).trim();

    if (t === '') {
        return null;
    }

    const n = Number.parseInt(t, 10);

    if (!Number.isFinite(n) || n < 0) {
        return false;
    }

    return n;
}

export function normalizeManagerEventCapacityForCompare(
    cap: number | null | undefined,
): string {
    if (cap === null || cap === undefined || !Number.isFinite(cap)) {
        return '';
    }

    return String(Math.trunc(cap));
}

export function buildManagerEventBaselineSnapshot(
    ev: InstructorEvent,
): ManagerEventEditFormSnapshot {
    return {
        type: ev.type === 'DRIVE' ? 'DRIVE' : 'THEORY',
        start: isoInstantToDatetimeLocalString(ev.startTime ?? ''),
        end: isoInstantToDatetimeLocalString(ev.endTime ?? ''),
        vehicle: (ev.vehicleId ?? '').trim(),
        capacity: normalizeManagerEventCapacityForCompare(ev.capacity ?? null),
        instructorId: (ev.instructorId ?? '').trim(),
    };
}

export function buildManagerEventCurrentSnapshot(
    input: ManagerEventEditCurrentSnapshotInput,
): ManagerEventEditFormSnapshot {
    const capParsed = parseManagerEventCapacity(input.capacityInput);
    const cap = capParsed === false ? null : capParsed;

    return {
        type: input.type,
        start: input.startLocal,
        end: input.endLocal,
        vehicle: input.type === 'DRIVE' ? input.vehicleId.trim() : '',
        capacity: normalizeManagerEventCapacityForCompare(cap),
        instructorId: input.instructorId.trim(),
    };
}

export function isManagerEventEditFormDirty(
    baseline: ManagerEventEditFormSnapshot | null,
    current: ManagerEventEditFormSnapshot,
): boolean {
    if (!baseline) {
        return false;
    }

    return JSON.stringify(baseline) !== JSON.stringify(current);
}

export function needsManagerEventSlotValidation(
    baseline: ManagerEventEditFormSnapshot | null,
    current: ManagerEventEditFormSnapshot,
): boolean {
    if (!baseline) {
        return false;
    }

    return (
        baseline.start !== current.start ||
        baseline.end !== current.end ||
        baseline.instructorId !== current.instructorId
    );
}
