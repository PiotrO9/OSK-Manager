import type { LessonRatingsPeriod } from '~/types/lessons/lessonRating';

export type MyReviewsPeriod = Extract<
    LessonRatingsPeriod,
    'last7days' | 'last30days' | 'all'
>;

export function formatLessonRatingValue(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
        return '—';
    }

    return new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value);
}

export function formatLessonRatingCount(count: number): string {
    const safeCount = Math.max(0, Math.trunc(count));
    const lastDigit = safeCount % 10;
    const lastTwoDigits = safeCount % 100;
    const noun =
        safeCount === 1
            ? 'opinia'
            : lastDigit >= 2 &&
                lastDigit <= 4 &&
                (lastTwoDigits < 12 || lastTwoDigits > 14)
              ? 'opinie'
              : 'opinii';

    return `${safeCount} ${noun}`;
}
