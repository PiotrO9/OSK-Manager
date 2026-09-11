import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { onMounted } from 'vue';
import { computed, readonly, ref } from 'vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { InstructorListItem } from '~/types/instructors/instructor';

const requestBffSuccess = vi.fn();
const fetchSchoolsList = vi.fn();
const fetchInstructorsList = vi.fn();
const addToast = vi.fn();
const navigateTo = vi.fn();

vi.mock('../../core/useApi', () => ({
    requestBffSuccess,
}));

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function createSchool(id: string): DrivingSchool {
    return {
        id,
        name: `OSK ${id}`,
        address: null,
        phone: null,
        email: null,
        description: null,
        ownerId: 'owner-1',
        createdAt: '2026-01-01T00:00:00.000Z',
    } as DrivingSchool;
}

function createInstructor(
    id: string,
    overrides: Partial<InstructorListItem> = {},
): InstructorListItem {
    return {
        id,
        firstName: `Jan ${id}`,
        lastName: 'Kowalski',
        email: `${id}@example.com`,
        avatarUrl: null,
        qualifiedCourseTypes: [],
        ...overrides,
    };
}

describe('useManagerInstructorsPage', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        fetchSchoolsList.mockResolvedValue([]);
        fetchInstructorsList.mockResolvedValue([]);
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('computed', computed);
        vi.stubGlobal('readonly', readonly);
        vi.stubGlobal('onMounted', vi.fn<typeof onMounted>());
        vi.stubGlobal('useRoute', () => ({ query: {} }));
        vi.stubGlobal('useDrivingSchoolsApi', () => ({
            fetchList: fetchSchoolsList,
        }));
        vi.stubGlobal('useInstructorsApi', () => ({
            fetchList: fetchInstructorsList,
        }));
        vi.stubGlobal('useAppToast', () => ({ addToast }));
        vi.stubGlobal('navigateTo', navigateTo);
    });

    it('creates instructor accounts through the success-only BFF helper', async () => {
        requestBffSuccess.mockResolvedValue(undefined);
        navigateTo.mockResolvedValue(undefined);
        const { useManagerInstructorsPage } =
            await import('./useManagerInstructorsPage');
        const page = useManagerInstructorsPage();

        await page.handleInstructorSubmit({
            email: 'instructor@example.com',
            password: 'secret123',
            firstName: 'Anna',
            lastName: 'Nowak',
            licenseNumber: 'LIC-123',
            schoolId: 'school-1',
        });

        expect(requestBffSuccess).toHaveBeenCalledWith(
            'POST',
            '/api/auth/register',
            {
                body: {
                    role: 'INSTRUCTOR',
                    email: 'instructor@example.com',
                    password: 'secret123',
                    firstName: 'Anna',
                    lastName: 'Nowak',
                    licenseNumber: 'LIC-123',
                    schoolId: 'school-1',
                },
                fallbackMessage: 'Nie udało się utworzyć konta instruktora.',
            },
        );
        expect(addToast).toHaveBeenCalledWith({
            title: 'Instruktor został utworzony',
            variant: 'success',
        });
        expect(navigateTo).toHaveBeenCalledWith('/manager/instructors', {
            replace: true,
        });
        expect(page.apiError.value).toBeNull();
    });

    it('keeps the latest instructors response when school changes quickly', async () => {
        const firstLoad = deferred<InstructorListItem[]>();
        const secondLoad = deferred<InstructorListItem[]>();

        fetchInstructorsList
            .mockReturnValueOnce(firstLoad.promise)
            .mockReturnValueOnce(secondLoad.promise);

        const { useManagerInstructorsPage } =
            await import('./useManagerInstructorsPage');
        const page = useManagerInstructorsPage();

        page.schools.value = [
            createSchool('school-1'),
            createSchool('school-2'),
        ];
        page.activeSchoolId.value = 'school-1';

        const firstPromise = page.loadInstructors();

        page.activeSchoolId.value = 'school-2';

        const secondPromise = page.loadInstructors();

        secondLoad.resolve([createInstructor('instructor-2')]);
        await secondPromise;

        expect(page.instructors.value.map((item) => item.id)).toEqual([
            'instructor-2',
        ]);

        firstLoad.resolve([createInstructor('instructor-1')]);
        await firstPromise;

        expect(page.instructors.value.map((item) => item.id)).toEqual([
            'instructor-2',
        ]);
        expect(page.isInstructorsLoading.value).toBe(false);
    });

    it('derives visible instructors and labels from local filters', async () => {
        const { useManagerInstructorsPage } =
            await import('./useManagerInstructorsPage');
        const page = useManagerInstructorsPage();

        page.instructors.value = [
            createInstructor('instructor-1', {
                firstName: 'Anna',
                lastName: 'Nowak',
                email: 'anna@example.com',
                qualifiedCourseTypes: [
                    { id: 'ct-1', code: 'B', name: 'Prawo jazdy B' },
                ],
            }),
            createInstructor('instructor-2', {
                firstName: 'Piotr',
                lastName: 'Zieliński',
                email: 'piotr@example.com',
            }),
        ];

        page.search.value = 'anna b';

        expect(page.visibleInstructors.value.map((item) => item.id)).toEqual([
            'instructor-1',
        ]);
        expect(page.visibleInstructorsLabel.value).toBe('1 wynik');

        page.search.value = '';
        page.quickView.value = 'unqualified';

        expect(page.visibleInstructors.value.map((item) => item.id)).toEqual([
            'instructor-2',
        ]);
        expect(page.qualificationFilterLabel.value).toBe('Bez kwalifikacji');
        expect(page.hasInstructorFilters.value).toBe(true);

        page.quickView.value = 'all';
        page.advancedFilters.value = [
            {
                id: 'filter-1',
                field: 'qualification',
                operator: 'eq',
                value: 'ct-1',
            },
        ];

        expect(page.visibleInstructors.value.map((item) => item.id)).toEqual([
            'instructor-1',
        ]);
        expect(page.hasInstructorFilters.value).toBe(true);
        expect(page.qualificationOptions.value).toEqual([
            { id: 'ct-1', code: 'B', name: 'Prawo jazdy B' },
        ]);

        page.clearInstructorFilters();

        expect(page.search.value).toBe('');
        expect(page.quickView.value).toBe('all');
        expect(page.advancedFilters.value).toEqual([]);
    });
});
