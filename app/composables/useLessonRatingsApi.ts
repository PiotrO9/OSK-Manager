import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import type { ScheduleLessonRating } from '~/types/schedule';

export interface CreateLessonRatingInput {
    rating: number;
    comment: string | null;
}

export function useLessonRatingsApi() {
    async function fetchLessonRating(
        lessonId: string,
    ): Promise<ScheduleLessonRating | null> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        const raw = await $fetch<unknown>(
            resolveBffEndpoint(`/api/lessons/${encodeURIComponent(id)}/rating`),
            {
                method: 'GET',
                credentials: 'include',
            },
        );

        const data = unwrapApiSuccessData<{
            rating: ScheduleLessonRating | null;
        }>(raw);

        return data.rating ?? null;
    }

    async function createLessonRating(
        lessonId: string,
        body: CreateLessonRatingInput,
    ): Promise<ScheduleLessonRating> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        const raw = await $fetch<unknown>(
            resolveBffEndpoint(`/api/lessons/${encodeURIComponent(id)}/rating`),
            {
                method: 'POST',
                credentials: 'include',
                body,
            },
        );

        const data = unwrapApiSuccessData<{
            rating: ScheduleLessonRating;
        }>(raw);

        return data.rating;
    }

    return {
        createLessonRating,
        fetchLessonRating,
    };
}
