import type { StatusTone } from '~/types/ui';

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
