import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type { LessonCreateResult } from '~/types/lessonBooking';

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
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/lessons/${encodeURIComponent(id)}/cancel`,
                ),
                {
                    method: 'PATCH',
                    credentials: 'include',
                },
            );

            const data = unwrapApiSuccessData<{ lesson?: LessonCreateResult }>(
                raw,
            );
            const lesson = data.lesson;

            if (!lesson || typeof lesson !== 'object') {
                throw new Error('Nieprawid?owa odpowied? serwera.');
            }

            return lesson;
        } catch (err: unknown) {
            throw new Error(
                getApiFetchErrorMessage(
                    err,
                    'Nie udalo sie anulowac rezerwacji.',
                ),
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
