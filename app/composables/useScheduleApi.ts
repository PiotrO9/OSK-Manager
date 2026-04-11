import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import type { ScheduleLessonItem } from '~/types/schedule';

function buildScheduleMeUrl(dateFrom: string, dateTo: string): string {
    const params = new URLSearchParams({
        dateFrom: dateFrom.trim(),
        dateTo: dateTo.trim(),
    });

    return resolveBffEndpoint(`/api/schedule/me?${params.toString()}`);
}

function buildScheduleManagerUrl(
    dateFrom: string,
    dateTo: string,
    target: { instructorId: string } | { studentId: string },
): string {
    const params = new URLSearchParams({
        dateFrom: dateFrom.trim(),
        dateTo: dateTo.trim(),
    });

    if ('instructorId' in target) {
        params.set('instructorId', target.instructorId.trim());
    } else {
        params.set('studentId', target.studentId.trim());
    }

    return resolveBffEndpoint(`/api/schedule?${params.toString()}`);
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

        const raw = await $fetch<unknown>(buildScheduleMeUrl(from, to), {
            credentials: 'include',
        });

        const data = unwrapApiSuccessData<{ items: ScheduleLessonItem[] }>(raw);

        return Array.isArray(data?.items) ? data.items : [];
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

        const raw = await $fetch<unknown>(
            buildScheduleManagerUrl(from, to, { instructorId: id }),
            { credentials: 'include' },
        );

        const data = unwrapApiSuccessData<{ items: ScheduleLessonItem[] }>(raw);

        return Array.isArray(data?.items) ? data.items : [];
    }

    async function fetchScheduleForStudent(
        studentId: string,
        dateFrom: string,
        dateTo: string,
    ): Promise<ScheduleLessonItem[]> {
        const id = studentId.trim();
        const from = dateFrom.trim();
        const to = dateTo.trim();

        if (!id || !from || !to) {
            return [];
        }

        const raw = await $fetch<unknown>(
            buildScheduleManagerUrl(from, to, { studentId: id }),
            { credentials: 'include' },
        );

        const data = unwrapApiSuccessData<{ items: ScheduleLessonItem[] }>(raw);

        return Array.isArray(data?.items) ? data.items : [];
    }

    return {
        fetchMySchedule,
        fetchScheduleForInstructor,
        fetchScheduleForStudent,
    };
}
