import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type {
    ScheduleLessonItem,
    ScheduleLessonRating,
} from '~/types/schedule/schedule';

function installVueGlobals(options: {
    fetchLessonRating?: (
        lessonId: string,
    ) => Promise<ScheduleLessonRating | null>;
    createLessonRating?: (
        lessonId: string,
        body: { rating: number; comment: string | null },
    ) => Promise<ScheduleLessonRating>;
    addToast?: (toast: Record<string, unknown>) => void;
}): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useLessonRatingsApi', () => ({
        fetchLessonRating:
            options.fetchLessonRating ?? vi.fn().mockResolvedValue(null),
        createLessonRating:
            options.createLessonRating ??
            vi.fn().mockResolvedValue(lessonRating()),
    }));
    vi.stubGlobal('useAppToast', () => ({
        addToast: options.addToast ?? vi.fn(),
    }));
}

function lesson(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'COMPLETED',
        startTime: '2026-08-16T10:00:00.000Z',
        endTime: '2026-08-16T11:00:00.000Z',
        ...overrides,
    };
}

function lessonRating(
    overrides: Partial<ScheduleLessonRating> = {},
): ScheduleLessonRating {
    return {
        id: 'rating-1',
        rating: 5,
        comment: 'OK',
        createdAt: '2026-08-16T12:00:00.000Z',
        ...overrides,
    };
}

describe('useMyLessonsRatings', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it('refreshes rating for selected completed practice lesson', async () => {
        const rating = lessonRating({ rating: 4 });
        const fetchLessonRating = vi.fn().mockResolvedValue(rating);

        installVueGlobals({ fetchLessonRating });
        const { useMyLessonsRatings } = await import('./useMyLessonsRatings');
        const items = ref<ScheduleLessonItem[]>([lesson()]);
        const ratings = useMyLessonsRatings({
            isStudent: computed(() => true),
            items,
        });

        await ratings.handleRatingLessonSelected(items.value[0]!);

        expect(ratings.selectedRatingLessonId.value).toBe('lesson-1');
        expect(fetchLessonRating).toHaveBeenCalledWith('lesson-1');
        expect(items.value[0]?.rating).toEqual(rating);
        expect(ratings.isRatingRefreshing.value).toBe(false);
    });

    it('does not fetch rating for non-students', async () => {
        const fetchLessonRating = vi.fn().mockResolvedValue(lessonRating());

        installVueGlobals({ fetchLessonRating });
        const { useMyLessonsRatings } = await import('./useMyLessonsRatings');
        const items = ref<ScheduleLessonItem[]>([lesson()]);
        const ratings = useMyLessonsRatings({
            isStudent: computed(() => false),
            items,
        });

        await ratings.handleRatingLessonSelected(items.value[0]!);

        expect(ratings.selectedRatingLessonId.value).toBe('lesson-1');
        expect(fetchLessonRating).not.toHaveBeenCalled();
    });

    it('submits rating, updates lesson and emits success toast', async () => {
        const rating = lessonRating({ rating: 3, comment: null });
        const createLessonRating = vi.fn().mockResolvedValue(rating);
        const addToast = vi.fn();

        installVueGlobals({ createLessonRating, addToast });
        const { useMyLessonsRatings } = await import('./useMyLessonsRatings');
        const items = ref<ScheduleLessonItem[]>([lesson()]);
        const ratings = useMyLessonsRatings({
            isStudent: computed(() => true),
            items,
        });

        await ratings.handleRatingSubmit({
            lesson: items.value[0]!,
            rating: 3,
            comment: null,
        });

        expect(createLessonRating).toHaveBeenCalledWith('lesson-1', {
            rating: 3,
            comment: null,
        });
        expect(items.value[0]?.rating).toEqual(rating);
        expect(ratings.selectedRatingLessonId.value).toBe('lesson-1');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Opinia zostala dodana',
            variant: 'success',
        });
    });

    it('sets rating error and emits error toast on submit failure', async () => {
        const createLessonRating = vi
            .fn()
            .mockRejectedValue({ data: { message: 'Rating rejected' } });
        const addToast = vi.fn();

        installVueGlobals({ createLessonRating, addToast });
        const { useMyLessonsRatings } = await import('./useMyLessonsRatings');
        const items = ref<ScheduleLessonItem[]>([lesson()]);
        const ratings = useMyLessonsRatings({
            isStudent: computed(() => true),
            items,
        });

        await ratings.handleRatingSubmit({
            lesson: items.value[0]!,
            rating: 2,
            comment: 'bad',
        });

        expect(ratings.ratingErrorMessage.value).toBe('Rating rejected');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się dodać opinii',
            description: 'Rating rejected',
            variant: 'error',
        });
    });
});
