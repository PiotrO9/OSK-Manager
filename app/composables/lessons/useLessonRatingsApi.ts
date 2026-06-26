import type { ScheduleLessonRating } from '~/types/schedule/schedule';

export interface CreateLessonRatingInput {
    rating: number;
    comment: string | null;
}

function normalizeNullableRating(data: unknown): ScheduleLessonRating | null {
    const rating = (data as { rating?: unknown } | null)?.rating;

    return rating && typeof rating === 'object'
        ? (rating as ScheduleLessonRating)
        : null;
}

function normalizeRequiredRating(data: unknown): ScheduleLessonRating | null {
    return normalizeNullableRating(data);
}

export function useLessonRatingsApi() {
    async function fetchLessonRating(
        lessonId: string,
    ): Promise<ScheduleLessonRating | null> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        return await requestBffData<ScheduleLessonRating | null>(
            'GET',
            `/api/lessons/${encodeURIComponent(id)}/rating`,
            {
                fallbackMessage: 'Nie udało się pobrać oceny lekcji.',
                normalize: normalizeNullableRating,
            },
        );
    }

    async function createLessonRating(
        lessonId: string,
        body: CreateLessonRatingInput,
    ): Promise<ScheduleLessonRating> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        return await requestBffData<ScheduleLessonRating>(
            'POST',
            `/api/lessons/${encodeURIComponent(id)}/rating`,
            {
                body,
                fallbackMessage: 'Nie udało się zapisać oceny lekcji.',
                invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                normalize: normalizeRequiredRating,
            },
        );
    }

    return {
        createLessonRating,
        fetchLessonRating,
    };
}
