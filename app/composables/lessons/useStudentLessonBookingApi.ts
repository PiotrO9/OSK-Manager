import type {
    CreateOwnLessonBody,
    LessonCreateResult,
} from '~/types/lessons/lessonBooking';

function normalizeLessonResult(data: unknown): LessonCreateResult | null {
    const lesson = (data as { lesson?: unknown } | null)?.lesson;

    return lesson && typeof lesson === 'object'
        ? (lesson as LessonCreateResult)
        : null;
}

export function useStudentLessonBookingApi() {
    const isBooking = shallowRef(false);

    async function bookOwnLesson(
        body: CreateOwnLessonBody,
    ): Promise<LessonCreateResult> {
        isBooking.value = true;

        try {
            return await requestBffData<LessonCreateResult>(
                'POST',
                '/api/lessons/me',
                {
                    body,
                    fallbackMessage: 'Nie udało się zarezerwować jazdy.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: normalizeLessonResult,
                },
            );
        } finally {
            isBooking.value = false;
        }
    }

    return {
        isBooking: readonly(isBooking),
        bookOwnLesson,
    };
}
