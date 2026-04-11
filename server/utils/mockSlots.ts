import { mockAvailabilityGetWeekly } from './mockAvailabilityStore';
import { mockInstructorsListPayload } from './mockInstructorsList';

export interface MockAvailabilitySlot {
    date: string;
    startTime: string;
    endTime: string;
}

function parseHHmm(value: string): { hours: number; minutes: number } {
    const parts = value.trim().split(':');

    if (parts.length < 2) {
        return { hours: 0, minutes: 0 };
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return { hours: 0, minutes: 0 };
    }

    return { hours, minutes };
}

function minutesFromMidnight(value: string): number {
    const { hours, minutes } = parseHHmm(value);

    return hours * 60 + minutes;
}

function minutesToHHmm(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseDateOnly(dateStr: string): Date {
    const parts = dateStr.trim().split('-').map(Number);

    if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) {
        return new Date(NaN);
    }

    const y = parts[0];
    const mo = parts[1];
    const d = parts[2];

    if (y === undefined || mo === undefined || d === undefined) {
        return new Date(NaN);
    }

    return new Date(y, mo - 1, d);
}

function formatDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

function buildSlotsForDay(
    dateStr: string,
    startTime: string,
    endTime: string,
): MockAvailabilitySlot[] {
    const startMin = minutesFromMidnight(startTime);
    const endMin = minutesFromMidnight(endTime);

    if (endMin <= startMin) {
        return [];
    }

    const out: MockAvailabilitySlot[] = [];

    for (let t = startMin; t + 60 <= endMin; t += 60) {
        out.push({
            date: dateStr,
            startTime: minutesToHHmm(t),
            endTime: minutesToHHmm(t + 60),
        });
    }

    return out;
}

/**
 * Generuje sloty 60 min z tygodniowego wzorca (mock) dla zakresu dat kalendarzowych.
 */
export function mockGenerateSlots(
    instructorId: string,
    dateFrom: string,
    dateTo: string,
): MockAvailabilitySlot[] {
    const weekly = mockAvailabilityGetWeekly(instructorId);
    const byDayOfWeek = new Map(weekly.map((e) => [e.dayOfWeek, e]));

    const from = parseDateOnly(dateFrom);
    const to = parseDateOnly(dateTo);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return [];
    }

    const slots: MockAvailabilitySlot[] = [];

    const cursor = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate(),
    );
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

    while (cursor <= end) {
        const dayOfWeek = cursor.getDay();
        const entry = byDayOfWeek.get(dayOfWeek);

        if (entry) {
            const dateStr = formatDateOnly(cursor);

            slots.push(
                ...buildSlotsForDay(dateStr, entry.startTime, entry.endTime),
            );
        }

        cursor.setDate(cursor.getDate() + 1);
    }

    slots.sort((a, b) => {
        const byDate = a.date.localeCompare(b.date);

        if (byDate !== 0) {
            return byDate;
        }

        return a.startTime.localeCompare(b.startTime);
    });

    return slots;
}

export interface MockSchoolAvailabilitySlot extends MockAvailabilitySlot {
    instructorId: string;
    instructorFirstName: string;
    instructorLastName: string;
}

/**
 * Agreguje sloty wszystkich instruktorów przypisanych do szkoły (mock).
 */
export function mockGenerateSchoolSlots(
    schoolId: string,
    dateFrom: string,
    dateTo: string,
): { slots: MockSchoolAvailabilitySlot[]; total: number } {
    const { instructors } = mockInstructorsListPayload(schoolId);
    const slots: MockSchoolAvailabilitySlot[] = [];

    for (const inst of instructors) {
        const raw = mockGenerateSlots(inst.id, dateFrom, dateTo);

        for (const s of raw) {
            slots.push({
                instructorId: inst.id,
                instructorFirstName: inst.firstName,
                instructorLastName: inst.lastName,
                date: s.date,
                startTime: s.startTime,
                endTime: s.endTime,
            });
        }
    }

    slots.sort((a, b) => {
        const byDate = a.date.localeCompare(b.date);

        if (byDate !== 0) {
            return byDate;
        }

        const byTime = a.startTime.localeCompare(b.startTime);

        if (byTime !== 0) {
            return byTime;
        }

        return a.instructorId.localeCompare(b.instructorId);
    });

    return { slots, total: slots.length };
}
