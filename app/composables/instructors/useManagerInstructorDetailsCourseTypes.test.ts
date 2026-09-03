import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { CourseTypeOption } from '~/types/courses/courseType';

const fetchCourseTypesList = vi.fn();

vi.mock('../course-types/useCourseTypesApi', () => ({
    useCourseTypesApi: () => ({
        fetchList: fetchCourseTypesList,
        isListLoading: ref(false),
    }),
}));

function installNuxtCourseTypesGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useCourseTypesApi', () => ({
        fetchList: fetchCourseTypesList,
        isListLoading: ref(false),
    }));
}

describe('useManagerInstructorDetailsCourseTypes', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtCourseTypesGlobals();
    });

    it('loads course type options and clears previous errors', async () => {
        const options: CourseTypeOption[] = [
            { id: 'course-b', code: 'B', name: 'Kategoria B' },
        ];

        fetchCourseTypesList.mockResolvedValue(options);

        const { useManagerInstructorDetailsCourseTypes } =
            await import('./useManagerInstructorDetailsCourseTypes');
        const data = useManagerInstructorDetailsCourseTypes();

        data.courseTypesError.value = 'Poprzedni błąd';
        await data.loadCourseTypes();

        expect(fetchCourseTypesList).toHaveBeenCalledOnce();
        expect(data.courseTypes.value).toEqual(options);
        expect(data.courseTypesError.value).toBeNull();
        expect(data.isCourseTypesLoading.value).toBe(false);
    });

    it('clears options and exposes API error messages on load failure', async () => {
        fetchCourseTypesList.mockRejectedValue(new Error('API niedostępne'));

        const { useManagerInstructorDetailsCourseTypes } =
            await import('./useManagerInstructorDetailsCourseTypes');
        const data = useManagerInstructorDetailsCourseTypes();

        data.courseTypes.value = [
            { id: 'course-b', code: 'B', name: 'Kategoria B' },
        ];
        await data.loadCourseTypes();

        expect(data.courseTypes.value).toEqual([]);
        expect(data.courseTypesError.value).toBe('API niedostępne');
    });
});
