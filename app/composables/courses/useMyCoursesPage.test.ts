import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, shallowRef } from 'vue';
import type { CurrentUserCourseItem } from '~/types/courses/course';
import { useMyCoursesPage } from './useMyCoursesPage';

const fetchMyCourses = vi.fn();

function makeCourse(
    overrides: Partial<CurrentUserCourseItem> &
        Pick<CurrentUserCourseItem, 'id'>,
): CurrentUserCourseItem {
    const { id, ...rest } = overrides;

    return {
        id,
        schoolId: 'school-1',
        name: `Kurs ${id}`,
        status: 'ACTIVE',
        type: 'PRACTICAL',
        totalHours: 30,
        progress: 0,
        ...rest,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('onMounted', vi.fn());
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('useCoursesApi', () => ({ fetchMyCourses }));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('useMyCoursesPage', () => {
    it('loads courses sorted with active first and summarises them honestly', async () => {
        fetchMyCourses.mockResolvedValue([
            makeCourse({
                id: 'finished',
                status: 'FINISHED',
                totalHours: 20,
                progress: 100,
            }),
            makeCourse({ id: 'active', totalHours: 30, progress: 40 }),
        ]);
        const page = useMyCoursesPage();

        await page.loadCourses();

        expect(page.isLoading.value).toBe(false);
        expect(page.visibleCourses.value.map((course) => course.id)).toEqual([
            'active',
            'finished',
        ]);
        expect(page.resultLabel.value).toBe('2 wyniki');
        expect(page.summary.value).toEqual({
            primary: '2 kursy',
            secondary: '1 aktywny · 50 godz. programu',
        });
        expect(page.filterOptions.value).toEqual([
            { value: 'ALL', label: 'Wszystkie', count: 2 },
            { value: 'ACTIVE', label: 'Aktywne', count: 1 },
            { value: 'FINISHED', label: 'Ukończone', count: 1 },
        ]);
    });

    it('narrows the list to the selected filter and resets it from the empty state', async () => {
        fetchMyCourses.mockResolvedValue([
            makeCourse({ id: 'active' }),
            makeCourse({ id: 'finished', status: 'FINISHED' }),
        ]);
        const page = useMyCoursesPage();

        await page.loadCourses();
        page.activeFilter.value = 'ACTIVE';

        expect(page.visibleCourses.value.map((course) => course.id)).toEqual([
            'active',
        ]);
        expect(page.resultLabel.value).toBe('1 wynik');

        page.handleShowAllCourses();

        expect(page.activeFilter.value).toBe('ALL');
        expect(page.visibleCourses.value).toHaveLength(2);
    });

    it('distinguishes no courses from an empty filter result', async () => {
        fetchMyCourses.mockResolvedValue([]);
        const page = useMyCoursesPage();

        await page.loadCourses();

        expect(page.emptyState.value.title).toBe('Brak przypisanych kursów');
        expect(page.emptyState.value.canResetFilter).toBe(false);

        fetchMyCourses.mockResolvedValue([makeCourse({ id: 'active' })]);
        await page.loadCourses();
        page.activeFilter.value = 'FINISHED';

        expect(page.visibleCourses.value).toHaveLength(0);
        expect(page.emptyState.value.title).toBe('Brak kursów w tym widoku');
        expect(page.emptyState.value.canResetFilter).toBe(true);
    });

    it('surfaces a fetch error and clears it on a successful retry', async () => {
        fetchMyCourses.mockRejectedValue({
            data: { message: 'Brak dostępu do kursów.' },
        });
        const page = useMyCoursesPage();

        await page.loadCourses();

        expect(page.errorMessage.value).toBe('Brak dostępu do kursów.');
        expect(page.courses.value).toEqual([]);
        expect(page.isLoading.value).toBe(false);

        fetchMyCourses.mockResolvedValue([makeCourse({ id: 'active' })]);
        await page.loadCourses();

        expect(page.errorMessage.value).toBeNull();
        expect(page.visibleCourses.value).toHaveLength(1);
    });

    it('falls back to a generic message when the error carries no details', async () => {
        fetchMyCourses.mockRejectedValue({});
        const page = useMyCoursesPage();

        await page.loadCourses();

        expect(page.errorMessage.value).toBe(
            'Nie udało się pobrać listy kursów.',
        );
    });
});
