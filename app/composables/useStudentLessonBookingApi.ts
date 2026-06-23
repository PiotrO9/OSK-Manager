import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type {
    CreateOwnLessonBody,
    LessonCreateResult,
} from '~/types/lessonBooking';

export function useStudentLessonBookingApi() {
    const isBooking = shallowRef(false);

    async function bookOwnLesson(
        body: CreateOwnLessonBody,
    ): Promise<LessonCreateResult> {
        isBooking.value = true;

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint('/api/lessons/me'),
                {
                    method: 'POST',
                    body,
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
                    'Nie udalo sie zarezerwowac jazdy.',
                ),
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
