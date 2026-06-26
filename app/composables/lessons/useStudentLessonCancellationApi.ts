import type { LessonCreateResult } from '~/types/lessons/lessonBooking';

function normalizeLessonResult(data: unknown): LessonCreateResult | null {
    const lesson = (data as { lesson?: unknown } | null)?.lesson;

    return lesson && typeof lesson === 'object'
        ? (lesson as LessonCreateResult)
        : null;
}

export function useStudentLessonCancellationApi() {
    const isCancelling = shallowRef(false);

    async function cancelOwnLesson(
        lessonId: string,
    ): Promise<LessonCreateResult> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        isCancelling.value = true;

        try {
            return await requestBffData<LessonCreateResult>(
                'PATCH',
                `/api/lessons/${encodeURIComponent(id)}/cancel`,
                {
                    fallbackMessage: 'Nie udało się anulować rezerwacji.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: normalizeLessonResult,
                },
            );
        } finally {
            isCancelling.value = false;
        }
    }

    return {
        cancelOwnLesson,
        isCancelling: readonly(isCancelling),
    };
}
