import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useManagerCoursesPage } from './useManagerCoursesPage';

const fetchSchools = vi.fn();
const fetchCourses = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('onMounted', vi.fn());
    vi.stubGlobal('onBeforeUnmount', vi.fn());
    vi.stubGlobal('useRoute', () => ({ query: { schoolId: 'b' } }));
    vi.stubGlobal('useDrivingSchoolsApi', () => ({ fetchList: fetchSchools }));
    vi.stubGlobal('useCoursesApi', () => ({ fetchList: fetchCourses }));
    fetchSchools.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    fetchCourses.mockResolvedValue([]);
});
afterEach(() => vi.unstubAllGlobals());

describe('courses page loading', () => {
    it('respects an accessible school from the URL and recovers after a failed school request', async () => {
        fetchSchools.mockRejectedValueOnce(new Error('Offline'));
        const page = useManagerCoursesPage();

        await page.loadSchools();
        expect(page.schoolsLoadError.value).toBe('Offline');
        await page.loadSchools();
        expect(page.activeSchoolId.value).toBe('b');
        expect(fetchCourses).toHaveBeenCalledWith('b');
        expect(page.schoolsLoadError.value).toBeNull();
    });
    it('ignores a stale course response after switching schools', async () => {
        let resolveOld!: (items: unknown[]) => void;

        fetchCourses.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveOld = resolve;
                }),
        );
        const page = useManagerCoursesPage();
        const oldRequest = page.handleActiveSchoolChange('a');

        fetchCourses.mockResolvedValueOnce([{ id: 'new' }]);
        await page.handleActiveSchoolChange('b');
        resolveOld([{ id: 'old' }]);
        await oldRequest;
        expect(page.courses.value).toEqual([{ id: 'new' }]);
        expect(page.isCoursesLoading.value).toBe(false);
    });
    it('clears loading and records when the school context disappears', async () => {
        const page = useManagerCoursesPage();

        await page.loadSchools();
        fetchSchools.mockResolvedValueOnce([]);
        await page.loadSchools();
        expect(page.activeSchoolId.value).toBe('');
        expect(page.courses.value).toEqual([]);
        expect(page.isCoursesLoading.value).toBe(false);
    });
});
