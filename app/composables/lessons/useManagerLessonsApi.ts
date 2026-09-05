import type {
    ManagerLessonDetail,
    PatchManagerLessonPayload,
} from '~/types/lessons/managerLesson';
import {
    buildManagerLessonPatchBody,
    normalizeManagerLesson,
} from '~/utils/lessons/managerLessonsApi';

export function useManagerLessonsApi() {
    const isFetchLoading = ref(false);
    const isUpdateLoading = ref(false);

    async function fetchLesson(lessonId: string): Promise<ManagerLessonDetail> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        isFetchLoading.value = true;

        try {
            return await requestBffData<ManagerLessonDetail>(
                'GET',
                `/api/lessons/${encodeURIComponent(id)}`,
                {
                    fallbackMessage: 'Nie udało się wczytać lekcji.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera (lekcja).',
                    normalize: (data) =>
                        normalizeManagerLesson(
                            (data as { lesson?: unknown }).lesson,
                        ),
                },
            );
        } finally {
            isFetchLoading.value = false;
        }
    }

    async function updateLesson(
        lessonId: string,
        payload: PatchManagerLessonPayload,
    ): Promise<ManagerLessonDetail> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        const body = buildManagerLessonPatchBody(payload);

        if (Object.keys(body).length === 0) {
            throw new Error('Brak pól do zapisu.');
        }

        isUpdateLoading.value = true;

        try {
            return await requestBffData<ManagerLessonDetail>(
                'PATCH',
                `/api/lessons/${encodeURIComponent(id)}`,
                {
                    body,
                    fallbackMessage: 'Nie udało się zapisać lekcji.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera (lekcja).',
                    normalize: (data) =>
                        normalizeManagerLesson(
                            (data as { lesson?: unknown }).lesson,
                        ),
                },
            );
        } finally {
            isUpdateLoading.value = false;
        }
    }

    return {
        isFetchLoading: readonly(isFetchLoading),
        isUpdateLoading: readonly(isUpdateLoading),
        fetchLesson,
        updateLesson,
    };
}
