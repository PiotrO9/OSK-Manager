import type { MockSchoolAvailabilitySlot } from './mockSlots';
import { mockCoursesGetById } from './mockCoursesList';
import { mockInstructorsListPayload } from './mockInstructorsList';

function minutesFromHHmm(value: string): number {
    const parts = value.trim().split(':').map(Number);
    const h = parts[0];
    const m = parts[1];

    if (
        h === undefined ||
        m === undefined ||
        !Number.isFinite(h) ||
        !Number.isFinite(m)
    ) {
        return 0;
    }

    return h * 60 + m;
}

function slotDurationMinutes(s: MockSchoolAvailabilitySlot): number {
    return minutesFromHHmm(s.endTime) - minutesFromHHmm(s.startTime);
}

function getUtcWeekdayFromDate(dateStr: string): number {
    const parts = dateStr.trim().split('-').map(Number);
    const y = parts[0];
    const mo = parts[1];
    const d = parts[2];

    if (
        y === undefined ||
        mo === undefined ||
        d === undefined ||
        !Number.isFinite(y) ||
        !Number.isFinite(mo) ||
        !Number.isFinite(d)
    ) {
        return 0;
    }

    return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}

function parseCommaSeparatedInts(value: unknown): number[] | null {
    if (value === undefined || value === null) {
        return null;
    }

    if (Array.isArray(value)) {
        const out: number[] = [];

        for (const item of value) {
            if (typeof item === 'string') {
                const n = Number.parseInt(item.trim(), 10);

                if (Number.isFinite(n) && n >= 0 && n <= 6) {
                    out.push(n);
                }
            }
        }

        return out.length ? out : null;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        const out: number[] = [];

        for (const part of value.split(',')) {
            const n = Number.parseInt(part.trim(), 10);

            if (Number.isFinite(n) && n >= 0 && n <= 6) {
                out.push(n);
            }
        }

        return out.length ? out : null;
    }

    return null;
}

function parseInstructorIdsParam(value: unknown): string[] | null {
    if (value === undefined || value === null) {
        return null;
    }

    if (Array.isArray(value)) {
        const out = value.filter(
            (x): x is string => typeof x === 'string' && x.trim().length > 0,
        );

        return out.length ? out.map((s) => s.trim()) : null;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        const out = value
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        return out.length ? out : null;
    }

    return null;
}

/**
 * Stosuje do wyniku mocka te same idee co backend (uproszczenie dla dev bez upstreamu).
 */
export function applyMockSchoolSlotFilters(
    slots: MockSchoolAvailabilitySlot[],
    query: Record<string, unknown>,
): { slots: MockSchoolAvailabilitySlot[]; total: number } {
    let out = [...slots];

    const instructorIds = parseInstructorIdsParam(query.instructorIds);

    if (instructorIds?.length) {
        const allow = new Set(instructorIds);

        out = out.filter((s) => allow.has(s.instructorId));
    }

    const courseId =
        typeof query.courseId === 'string' ? query.courseId.trim() : '';

    if (courseId) {
        const course = mockCoursesGetById(courseId);

        if (course) {
            const qualified = new Set(
                Object.values(
                    out.reduce<Record<string, string>>((acc, slot) => {
                        acc[slot.instructorId] = slot.instructorId;

                        return acc;
                    }, {}),
                ).filter((id) => {
                    const schoolInstructors = mockInstructorsListPayload(
                        course.schoolId,
                    ).instructors;
                    const instructor = schoolInstructors.find(
                        (item) => item.id === id,
                    );

                    return (
                        instructor?.qualifiedCourseTypes?.some(
                            (courseType) => courseType.code === course.category,
                        ) ?? false
                    );
                }),
            );

            out = out.filter((slot) => qualified.has(slot.instructorId));

            if (course.instructor?.id) {
                out = out.filter(
                    (slot) => slot.instructorId === course.instructor?.id,
                );
            }
        }
    }

    const timeFromRaw =
        typeof query.timeFrom === 'string' ? query.timeFrom.trim() : '';
    const timeToRaw =
        typeof query.timeTo === 'string' ? query.timeTo.trim() : '';

    if (timeFromRaw && timeToRaw) {
        const fromMin = minutesFromHHmm(timeFromRaw);
        const toMin = minutesFromHHmm(timeToRaw);

        if (toMin > fromMin) {
            out = out.filter((s) => {
                const start = minutesFromHHmm(s.startTime);
                const end = minutesFromHHmm(s.endTime);

                return start >= fromMin && end <= toMin;
            });
        }
    }

    const weekdays = parseCommaSeparatedInts(query.weekdays);

    if (weekdays?.length) {
        const allow = new Set(weekdays);

        out = out.filter((s) => allow.has(getUtcWeekdayFromDate(s.date)));
    }

    const durationRaw = query.slotDurationMinutes;
    const duration =
        typeof durationRaw === 'string' || typeof durationRaw === 'number'
            ? Number.parseInt(String(durationRaw), 10)
            : NaN;

    if (Number.isFinite(duration) && duration >= 15 && duration <= 240) {
        out = out.filter((s) => slotDurationMinutes(s) === duration);
    }

    const sortRaw =
        typeof query.sort === 'string' ? query.sort.trim() : 'startTime';

    if (sortRaw === 'instructorName') {
        out.sort((a, b) => {
            const ln = a.instructorLastName.localeCompare(
                b.instructorLastName,
                'pl',
            );

            if (ln !== 0) {
                return ln;
            }

            const fn = a.instructorFirstName.localeCompare(
                b.instructorFirstName,
                'pl',
            );

            if (fn !== 0) {
                return fn;
            }

            return (
                a.date.localeCompare(b.date) ||
                a.startTime.localeCompare(b.startTime)
            );
        });
    } else {
        out.sort((a, b) => {
            const d = a.date.localeCompare(b.date);

            if (d !== 0) {
                return d;
            }

            const t = a.startTime.localeCompare(b.startTime);

            if (t !== 0) {
                return t;
            }

            return a.instructorId.localeCompare(b.instructorId);
        });
    }

    const total = out.length;

    const limitRaw = query.limit;
    const offsetRaw = query.offset;
    const limit = Number.parseInt(String(limitRaw ?? '200'), 10);
    const offset = Number.parseInt(String(offsetRaw ?? '0'), 10);
    const safeLimit = Number.isFinite(limit)
        ? Math.min(500, Math.max(1, limit))
        : 200;
    const safeOffset = Number.isFinite(offset) && offset >= 0 ? offset : 0;

    out = out.slice(safeOffset, safeOffset + safeLimit);

    return { slots: out, total };
}
