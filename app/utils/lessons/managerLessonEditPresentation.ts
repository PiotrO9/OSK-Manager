import type { HeaderMetaItem, StatusTone } from '~/components/app/ui/types';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';

const LESSON_STATUS_LABELS: Record<string, string> = {
    SCHEDULED: 'Zaplanowana',
    COMPLETED: 'Zakonczona',
    CANCELLED: 'Anulowana',
    CANCELED: 'Anulowana',
};

const LESSON_STATUS_TONES: Record<string, StatusTone> = {
    SCHEDULED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    CANCELED: 'danger',
};

export function getManagerLessonStatusLabel(
    rawStatus: string | null | undefined,
): string {
    const status = rawStatus?.trim() ?? '';

    if (!status) {
        return '-';
    }

    return LESSON_STATUS_LABELS[status] ?? status;
}

export function getManagerLessonStatusTone(
    rawStatus: string | null | undefined,
): StatusTone {
    return LESSON_STATUS_TONES[rawStatus?.trim() ?? ''] ?? 'neutral';
}

export function formatManagerLessonDateRangeLabel(
    startIso?: string,
    endIso?: string,
): string {
    const start = startIso ? new Date(startIso) : null;
    const end = endIso ? new Date(endIso) : null;

    if (
        !start ||
        !end ||
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 'Termin lekcji';
    }

    const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'long',
    });
    const timeFormatter = new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)}-${timeFormatter.format(end)}`;
}

export function buildManagerLessonHeaderMeta(
    lesson: ManagerLessonDetail | null,
    studentDisplayName: string | null | undefined,
): HeaderMetaItem[] {
    if (!lesson) {
        return [];
    }

    return [
        {
            label: 'Kursant',
            value: studentDisplayName ?? `${lesson.studentId.slice(0, 8)}...`,
            tone: 'neutral',
        },
        {
            label: 'Status',
            value: getManagerLessonStatusLabel(lesson.status),
            tone: getManagerLessonStatusTone(lesson.status),
        },
    ];
}
