import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { InstructorDetail } from '~/types/instructors/instructor';

const requestBffData = vi.fn();

vi.mock('../core/useApi', () => ({
    requestBffData,
}));

function installNuxtInstructorDetailsDataGlobals(): void {
    vi.stubGlobal('ref', ref);
}

function instructorPayload(overrides: Record<string, unknown> = {}) {
    return {
        id: 'instructor-1',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.com',
        licenseNumber: 'LIC-123',
        qualifications: 'Kat. B',
        qualifiedCourseTypes: [],
        experienceYears: 5,
        ...overrides,
    };
}

describe('useManagerInstructorDetailsData', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtInstructorDetailsDataGlobals();
    });

    it('reports not found and skips API calls without instructor id', async () => {
        const { useManagerInstructorDetailsData } =
            await import('./useManagerInstructorDetailsData');
        const data = useManagerInstructorDetailsData();

        await data.loadInstructor('   ');

        expect(requestBffData).not.toHaveBeenCalled();
        expect(data.instructor.value).toBeNull();
        expect(data.editForm.value).toBeNull();
        expect(data.editBaseline.value).toBeNull();
        expect(data.isLoading.value).toBe(false);
        expect(data.errorMessage.value).toBe('Nie znaleziono instruktora.');
    });

    it('loads and normalizes instructor details for the edit form', async () => {
        requestBffData.mockResolvedValue(instructorPayload());

        const { useManagerInstructorDetailsData } =
            await import('./useManagerInstructorDetailsData');
        const data = useManagerInstructorDetailsData();

        await data.loadInstructor(' instructor-1 ');

        expect(requestBffData).toHaveBeenCalledWith(
            'GET',
            '/api/instructors/instructor-1',
            {
                fallbackMessage: 'Nie udało się wczytać danych instruktora.',
            },
        );
        expect(data.instructor.value).toMatchObject<Partial<InstructorDetail>>({
            id: 'instructor-1',
            name: 'Anna Nowak',
            email: 'anna@example.com',
        });
        expect(data.editForm.value).toMatchObject({
            id: 'instructor-1',
            firstName: 'Anna',
            lastName: 'Nowak',
            experienceYears: 5,
        });
        expect(data.editBaseline.value).toEqual(data.editForm.value);
        expect(data.errorMessage.value).toBeNull();
        expect(data.isLoading.value).toBe(false);
    });

    it('ignores stale instructor responses from older requests', async () => {
        let resolveFirst!: (value: unknown) => void;

        requestBffData
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveFirst = resolve;
                }),
            )
            .mockResolvedValueOnce(instructorPayload({ id: 'second' }));

        const { useManagerInstructorDetailsData } =
            await import('./useManagerInstructorDetailsData');
        const data = useManagerInstructorDetailsData();

        const firstLoad = data.loadInstructor('first');
        const secondLoad = data.loadInstructor('second');

        await secondLoad;

        expect(data.instructor.value?.id).toBe('second');

        resolveFirst(instructorPayload({ id: 'first' }));
        await firstLoad;

        expect(data.instructor.value?.id).toBe('second');
    });
});
