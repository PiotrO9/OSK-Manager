import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, type Ref } from 'vue';

interface SchoolRef {
    id: string;
}

interface RouteStub {
    query: Record<string, unknown>;
}

const route: RouteStub = {
    query: {},
};

let mountedCallback: (() => Promise<void>) | null = null;

function installNuxtPageInitGlobals(): void {
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('useRoute', () => route);
    vi.stubGlobal('onMounted', (callback: () => Promise<void>) => {
        mountedCallback = callback;
    });
}

function createPageInitOptions(
    overrides: Partial<{
        schools: Ref<SchoolRef[]>;
        activeSchoolId: Ref<string>;
        loadSchools: () => Promise<void>;
        loadCoursesForFilter: () => Promise<void>;
        loadStudents: () => Promise<void>;
        openInitialRegisterForm: () => void;
    }> = {},
) {
    return {
        schools: ref<SchoolRef[]>([
            { id: 'school-1' },
            { id: '2f3c7d2b-8c28-4a3d-9f1b-0d7c4f35b4a1' },
        ]),
        activeSchoolId: ref(''),
        loadSchools: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
        loadCoursesForFilter: vi
            .fn<() => Promise<void>>()
            .mockResolvedValue(undefined),
        loadStudents: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
        openInitialRegisterForm: vi.fn<() => void>(),
        ...overrides,
    };
}

describe('useManagerStudentsPageInit', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        route.query = {};
        mountedCallback = null;
        installNuxtPageInitGlobals();
    });

    it('exposes valid prefill school id from query', async () => {
        route.query.schoolId = '2f3c7d2b-8c28-4a3d-9f1b-0d7c4f35b4a1';
        const { useManagerStudentsPageInit } =
            await import('./useManagerStudentsPageInit');
        const pageInit = useManagerStudentsPageInit(createPageInitOptions());

        expect(pageInit.prefillSchoolId.value).toBe(
            '2f3c7d2b-8c28-4a3d-9f1b-0d7c4f35b4a1',
        );
    });

    it('ignores invalid prefill school id from query', async () => {
        route.query.schoolId = 'not-a-uuid';
        const { useManagerStudentsPageInit } =
            await import('./useManagerStudentsPageInit');
        const pageInit = useManagerStudentsPageInit(createPageInitOptions());

        expect(pageInit.prefillSchoolId.value).toBeNull();
    });

    it('selects prefilled school when it exists in loaded schools', async () => {
        route.query.schoolId = '2f3c7d2b-8c28-4a3d-9f1b-0d7c4f35b4a1';
        const options = createPageInitOptions();
        const { useManagerStudentsPageInit } =
            await import('./useManagerStudentsPageInit');

        useManagerStudentsPageInit(options);
        await mountedCallback?.();

        expect(options.loadSchools).toHaveBeenCalledTimes(1);
        expect(options.activeSchoolId.value).toBe(
            '2f3c7d2b-8c28-4a3d-9f1b-0d7c4f35b4a1',
        );
        expect(options.loadCoursesForFilter).toHaveBeenCalledTimes(1);
        expect(options.loadStudents).toHaveBeenCalledTimes(1);
    });

    it('falls back to first school when prefilled school is missing', async () => {
        route.query.schoolId = '3f3c7d2b-8c28-4a3d-9f1b-0d7c4f35b4a1';
        const options = createPageInitOptions();
        const { useManagerStudentsPageInit } =
            await import('./useManagerStudentsPageInit');

        useManagerStudentsPageInit(options);
        await mountedCallback?.();

        expect(options.activeSchoolId.value).toBe('school-1');
        expect(options.loadCoursesForFilter).toHaveBeenCalledTimes(1);
        expect(options.loadStudents).toHaveBeenCalledTimes(1);
    });

    it('opens initial register form when query flag is truthy', async () => {
        route.query.register = 'true';
        const options = createPageInitOptions();
        const { useManagerStudentsPageInit } =
            await import('./useManagerStudentsPageInit');

        useManagerStudentsPageInit(options);
        await mountedCallback?.();

        expect(options.openInitialRegisterForm).toHaveBeenCalledTimes(1);
    });

    it('does not load courses or students when no school is available', async () => {
        const options = createPageInitOptions({
            schools: ref<SchoolRef[]>([]),
        });
        const { useManagerStudentsPageInit } =
            await import('./useManagerStudentsPageInit');

        useManagerStudentsPageInit(options);
        await mountedCallback?.();

        expect(options.activeSchoolId.value).toBe('');
        expect(options.loadCoursesForFilter).not.toHaveBeenCalled();
        expect(options.loadStudents).not.toHaveBeenCalled();
    });
});
