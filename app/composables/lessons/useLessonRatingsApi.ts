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

function normalizeRatingResponse(
    data: unknown,
): { rating: ScheduleLessonRating | null } | null {
    if (!data || typeof data !== 'object' || !('rating' in data)) {
        return null;
    }

    const rating = data.rating;

    if (
        rating !== null &&
        (typeof rating !== 'object' || Array.isArray(rating))
    ) {
        return null;
    }

    return { rating: rating as ScheduleLessonRating | null };
}

export function useLessonRatingsApi() {
    async function fetchLessonRating(
        lessonId: string,
    ): Promise<ScheduleLessonRating | null> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        const response = await requestBffData<{
            rating: ScheduleLessonRating | null;
        }>('GET', `/api/lessons/${encodeURIComponent(id)}/rating`, {
            fallbackMessage: 'Nie udało się pobrać oceny lekcji.',
            normalize: normalizeRatingResponse,
        });

        return response.rating;
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
