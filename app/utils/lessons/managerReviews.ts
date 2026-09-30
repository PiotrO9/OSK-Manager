import type { LessonRatingsPeriod } from '~/types/lessons/lessonRating';

export type ManagerReviewsPeriod = Exclude<LessonRatingsPeriod, 'latest'>;

export const MANAGER_REVIEWS_PERIOD_OPTIONS: ReadonlyArray<{
    value: ManagerReviewsPeriod;
    label: string;
}> = [
    { value: 'last7days', label: 'Ostatnie 7 dni' },
    { value: 'last30days', label: 'Ostatnie 30 dni' },
    { value: 'yesterday', label: 'Wczoraj' },
    { value: 'all', label: 'Wszystkie' },
];

export function normalizeManagerReviewsPeriod(
    value: unknown,
): ManagerReviewsPeriod {
    const normalized = Array.isArray(value) ? value[0] : value;

    return MANAGER_REVIEWS_PERIOD_OPTIONS.some(
        (option) => option.value === normalized,
    )
        ? (normalized as ManagerReviewsPeriod)
        : 'last7days';
}

export function formatManagerReviewsPeriodLabel(
    period: ManagerReviewsPeriod,
): string {
    return (
        MANAGER_REVIEWS_PERIOD_OPTIONS.find((option) => option.value === period)
            ?.label ?? 'Opinie'
    );
}
