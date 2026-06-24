import type { ScheduleLessonItem } from '~/types/schedule';

function buildScheduleMePath(dateFrom: string, dateTo: string): string {
    const params = new URLSearchParams({
        dateFrom: dateFrom.trim(),
        dateTo: dateTo.trim(),
    });

    return `/api/schedule/me?${params.toString()}`;
}

function buildScheduleManagerPath(
    dateFrom: string,
    dateTo: string,
    target: { instructorId: string } | { studentId: string; schoolId: string },
): string {
    const params = new URLSearchParams({
        dateFrom: dateFrom.trim(),
        dateTo: dateTo.trim(),
    });

    if ('instructorId' in target) {
        params.set('instructorId', target.instructorId.trim());
    } else {
        params.set('studentId', target.studentId.trim());
        params.set('schoolId', target.schoolId.trim());
    }

    return `/api/schedule?${params.toString()}`;
}

function normalizeScheduleItems(data: unknown): ScheduleLessonItem[] {
    const items = (data as { items?: unknown } | null)?.items;

    return Array.isArray(items) ? (items as ScheduleLessonItem[]) : [];
}

export function useScheduleApi() {
    async function fetchMySchedule(
        dateFrom: string,
        dateTo: string,
    ): Promise<ScheduleLessonItem[]> {
        const from = dateFrom.trim();
        const to = dateTo.trim();

        if (!from || !to) {
            return [];
        }

        return await requestBffData<ScheduleLessonItem[]>(
            'GET',
            buildScheduleMePath(from, to),
            {
                fallbackMessage: 'Nie udało się pobrać harmonogramu.',
                normalize: normalizeScheduleItems,
            },
        );
    }

    async function fetchScheduleForInstructor(
        instructorId: string,
        dateFrom: string,
        dateTo: string,
    ): Promise<ScheduleLessonItem[]> {
        const id = instructorId.trim();
        const from = dateFrom.trim();
        const to = dateTo.trim();

        if (!id || !from || !to) {
            return [];
        }

        return await requestBffData<ScheduleLessonItem[]>(
            'GET',
            buildScheduleManagerPath(from, to, { instructorId: id }),
            {
                fallbackMessage: 'Nie udało się pobrać harmonogramu.',
                normalize: normalizeScheduleItems,
            },
        );
    }

    async function fetchScheduleForStudent(
        studentId: string,
        dateFrom: string,
        dateTo: string,
        schoolId: string,
    ): Promise<ScheduleLessonItem[]> {
        const id = studentId.trim();
        const from = dateFrom.trim();
        const to = dateTo.trim();
        const sid = schoolId.trim();

        if (!id || !from || !to || !sid) {
            return [];
        }

        return await requestBffData<ScheduleLessonItem[]>(
            'GET',
            buildScheduleManagerPath(from, to, {
                studentId: id,
                schoolId: sid,
            }),
            {
                fallbackMessage: 'Nie udało się pobrać harmonogramu.',
                normalize: normalizeScheduleItems,
            },
        );
    }

    return {
        fetchMySchedule,
        fetchScheduleForInstructor,
        fetchScheduleForStudent,
    };
}
