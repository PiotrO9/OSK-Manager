import type { ComputedRef, Ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

interface UseMyLessonsRatingsInput {
    isStudent: ComputedRef<boolean>;
    items: Ref<ScheduleLessonItem[]>;
}

export function useMyLessonsRatings(input: UseMyLessonsRatingsInput) {
    const { createLessonRating, fetchLessonRating } = useLessonRatingsApi();
    const { addToast } = useAppToast();

    const selectedRatingLessonId = ref<string | null>(null);
    const isRatingRefreshing = ref(false);
    const isRatingSubmitting = ref(false);
    const ratingErrorMessage = ref<string | null>(null);

    let ratingFetchSeq = 0;

    async function handleRatingLessonSelected(
        lesson: ScheduleLessonItem,
    ): Promise<void> {
        selectedRatingLessonId.value = lesson.id;
        ratingErrorMessage.value = null;

        const seq = ++ratingFetchSeq;

        if (!input.isStudent.value || !isCompletedPracticeLesson(lesson)) {
            isRatingRefreshing.value = false;

            return;
        }

        isRatingRefreshing.value = true;

        try {
            const rating = await fetchLessonRating(lesson.id);

            if (seq !== ratingFetchSeq) {
                return;
            }

            input.items.value = input.items.value.map((item) =>
                item.id === lesson.id ? { ...item, rating } : item,
            );
        } catch (err: unknown) {
            if (seq !== ratingFetchSeq) {
                return;
            }

            ratingErrorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się odświeżyć opinii.',
            );
        } finally {
            if (seq === ratingFetchSeq) {
                isRatingRefreshing.value = false;
            }
        }
    }

    async function handleRatingSubmit(payload: {
        lesson: ScheduleLessonItem;
        rating: number;
        comment: string | null;
    }): Promise<void> {
        if (isRatingSubmitting.value) {
            return;
        }

        isRatingSubmitting.value = true;
        ratingErrorMessage.value = null;

        try {
            const rating = await createLessonRating(payload.lesson.id, {
                rating: payload.rating,
                comment: payload.comment,
            });

            input.items.value = input.items.value.map((item) =>
                item.id === payload.lesson.id ? { ...item, rating } : item,
            );
            selectedRatingLessonId.value = payload.lesson.id;

            addToast({
                title: 'Opinia zostala dodana',
                variant: 'success',
            });
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udało się dodać opinii.',
            );

            ratingErrorMessage.value = message;
            addToast({
                title: 'Nie udało się dodać opinii',
                description: message,
                variant: 'error',
            });
        } finally {
            isRatingSubmitting.value = false;
        }
    }

    return {
        handleRatingLessonSelected,
        handleRatingSubmit,
        isRatingRefreshing,
        isRatingSubmitting,
        ratingErrorMessage,
        selectedRatingLessonId,
    };
}

export function isCompletedPracticeLesson(lesson: ScheduleLessonItem): boolean {
    return (
        lesson.kind === 'lesson' &&
        lesson.type.trim().toUpperCase() === 'PRACTICE' &&
        lesson.status.trim().toUpperCase() === 'COMPLETED'
    );
}
