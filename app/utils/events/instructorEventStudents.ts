const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidString(value: string): boolean {
    return UUID_RE.test(value.trim());
}

function pushUuid(ids: string[], raw: unknown): void {
    if (typeof raw !== 'string') {
        return;
    }

    const trimmedId = raw.trim();

    if (trimmedId && isUuidString(trimmedId)) {
        ids.push(trimmedId);
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

    const eventRecord = ev as Record<string, unknown>;
    const hasKey =
        'studentUserIds' in eventRecord ||
        'studentIds' in eventRecord ||
        'assignedStudentIds' in eventRecord ||
        'students' in eventRecord;

    if (!hasKey) {
        return { ids: [], source: 'unknown' };
    }

    const ids: string[] = [];

    for (const key of [
        'studentUserIds',
        'studentIds',
        'assignedStudentIds',
    ] as const) {
        const arr = eventRecord[key];

        if (!Array.isArray(arr)) {
            continue;
        }

        for (const item of arr) {
            pushUuid(ids, item);
        }
    }

    const studentsRaw = eventRecord.students;

    if (Array.isArray(studentsRaw)) {
        for (const item of studentsRaw) {
            if (!item || typeof item !== 'object') {
                continue;
            }

            const studentRecord = item as Record<string, unknown>;
            const studentUserId =
                studentRecord.userId ??
                studentRecord.user_id ??
                studentRecord.studentUserId ??
                studentRecord.student_user_id ??
                studentRecord.id ??
                studentRecord.studentId;

            pushUuid(ids, studentUserId);
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
                const studentRecord = item as Record<string, unknown>;

                pushUuid(
                    ids,
                    studentRecord.userId ??
                        studentRecord.user_id ??
                        studentRecord.studentUserId ??
                        studentRecord.student_user_id ??
                        studentRecord.id ??
                        studentRecord.studentId,
                );
            }
        }

        return [...new Set(ids)];
    }

    if (typeof raw !== 'object') {
        return [];
    }

    const eventRecord = raw as Record<string, unknown>;

    if ('data' in eventRecord && eventRecord.data !== undefined) {
        return extractStudentUserIdsFromEventStudentsPayload(eventRecord.data);
    }

    const ids: string[] = [];

    for (const key of [
        'studentUserIds',
        'studentIds',
        'assignedStudentIds',
    ] as const) {
        const arr = eventRecord[key];

        if (!Array.isArray(arr)) {
            continue;
        }

        for (const item of arr) {
            pushUuid(ids, item);
        }
    }

    for (const nested of [
        eventRecord.students,
        eventRecord.items,
        eventRecord.participants,
    ] as const) {
        if (!Array.isArray(nested)) {
            continue;
        }

        for (const item of nested) {
            if (typeof item === 'string') {
                pushUuid(ids, item);
            } else if (item && typeof item === 'object') {
                const studentRecord = item as Record<string, unknown>;

                pushUuid(
                    ids,
                    studentRecord.userId ??
                        studentRecord.user_id ??
                        studentRecord.studentUserId ??
                        studentRecord.student_user_id ??
                        studentRecord.id ??
                        studentRecord.studentId,
                );
            }
        }
    }

    return [...new Set(ids)];
}
