const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidString(value: string): boolean {
    return UUID_RE.test(value.trim());
}

function pushUuid(ids: string[], raw: unknown): void {
    if (typeof raw !== 'string') {
        return;
    }

    const t = raw.trim();

    if (t && isUuidString(t)) {
        ids.push(t);
    }
}

/**
 * Wyciąga UUID kont kursantów (`users.id`) z odpowiedzi GET /events/:id.
 * Obecny BE podaje tablicę `students` (pełne obiekty jak GET /lessons/:id) oraz/lub płaskie listy ID.
 * `source: present` — gdy w obiekcie były pola dotyczące kursantów (nawet pusta lista).
 */
export function extractStudentAttendanceFromEvent(ev: unknown): {
    ids: string[];
    source: 'unknown' | 'present';
} {
    if (!ev || typeof ev !== 'object') {
        return { ids: [], source: 'unknown' };
    }

    const o = ev as Record<string, unknown>;
    const hasKey =
        'studentUserIds' in o ||
        'studentIds' in o ||
        'assignedStudentIds' in o ||
        'students' in o;

    if (!hasKey) {
        return { ids: [], source: 'unknown' };
    }

    const ids: string[] = [];

    for (const key of [
        'studentUserIds',
        'studentIds',
        'assignedStudentIds',
    ] as const) {
        const arr = o[key];

        if (!Array.isArray(arr)) {
            continue;
        }

        for (const item of arr) {
            pushUuid(ids, item);
        }
    }

    const studentsRaw = o.students;

    if (Array.isArray(studentsRaw)) {
        for (const item of studentsRaw) {
            if (!item || typeof item !== 'object') {
                continue;
            }

            const s = item as Record<string, unknown>;
            const uid =
                s.userId ??
                s.user_id ??
                s.studentUserId ??
                s.student_user_id ??
                s.id ??
                s.studentId;

            pushUuid(ids, uid);
        }
    }

    return { ids: [...new Set(ids)], source: 'present' };
}

/**
 * Odpowiedź GET /events/:id/students (osobny zasób od szczegółów wydarzenia).
 * Akceptuje tablicę UUID, obiekty z userId, lub koperty z studentUserIds / students / items.
 */
export function extractStudentUserIdsFromEventStudentsPayload(
    raw: unknown,
): string[] {
    if (raw === null || raw === undefined) {
        return [];
    }

    if (Array.isArray(raw)) {
        const ids: string[] = [];

        for (const item of raw) {
            if (typeof item === 'string') {
                pushUuid(ids, item);
            } else if (item && typeof item === 'object') {
                const s = item as Record<string, unknown>;

                pushUuid(
                    ids,
                    s.userId ??
                        s.user_id ??
                        s.studentUserId ??
                        s.student_user_id ??
                        s.id ??
                        s.studentId,
                );
            }
        }

        return [...new Set(ids)];
    }

    if (typeof raw !== 'object') {
        return [];
    }

    const o = raw as Record<string, unknown>;

    if ('data' in o && o.data !== undefined) {
        return extractStudentUserIdsFromEventStudentsPayload(o.data);
    }

    const ids: string[] = [];

    for (const key of [
        'studentUserIds',
        'studentIds',
        'assignedStudentIds',
    ] as const) {
        const arr = o[key];

        if (!Array.isArray(arr)) {
            continue;
        }

        for (const item of arr) {
            pushUuid(ids, item);
        }
    }

    for (const nested of [o.students, o.items, o.participants] as const) {
        if (!Array.isArray(nested)) {
            continue;
        }

        for (const item of nested) {
            if (typeof item === 'string') {
                pushUuid(ids, item);
            } else if (item && typeof item === 'object') {
                const s = item as Record<string, unknown>;

                pushUuid(
                    ids,
                    s.userId ??
                        s.user_id ??
                        s.studentUserId ??
                        s.student_user_id ??
                        s.id ??
                        s.studentId,
                );
            }
        }
    }

    return [...new Set(ids)];
}
