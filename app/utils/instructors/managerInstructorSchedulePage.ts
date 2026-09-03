export interface ManagerInstructorScheduleRouteLike {
    params: {
        id?: unknown;
    };
    query: {
        schoolId?: unknown;
    };
}

export function getManagerInstructorScheduleRouteString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

export function getManagerInstructorScheduleInstructorId(
    route: ManagerInstructorScheduleRouteLike,
): string {
    return getManagerInstructorScheduleRouteString(route.params.id);
}

export function getManagerInstructorScheduleSchoolId(
    route: ManagerInstructorScheduleRouteLike,
): string {
    return getManagerInstructorScheduleRouteString(route.query.schoolId);
}

export function formatManagerInstructorScheduleRangeLabel(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(d);
}

export function formatManagerInstructorScheduleWeekCompact(
    monday: Date,
): string {
    const start = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate(),
    );
    const end = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 6,
    );
    const startDay = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
    }).format(start);
    const endLabel = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
    }).format(end);

    return `${startDay}-${endLabel}`;
}

export function formatManagerInstructorScheduleWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

export function buildManagerInstructorScheduleBackHref(
    instructorId: string,
    schoolId: string,
) {
    const id = instructorId.trim();
    const sid = schoolId.trim();

    if (!id) {
        return '/manager/instructors';
    }

    if (sid) {
        return {
            path: `/manager/instructors/${id}`,
            query: { schoolId: sid },
        };
    }

    return `/manager/instructors/${id}`;
}
