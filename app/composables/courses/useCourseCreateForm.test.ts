import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, watch } from 'vue';
import type { CourseCreatePayload } from '~/types/courses/course';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { OfferedCourseType } from '~/types/schools/drivingSchool';
import type { CourseCreateFormProps } from './useCourseCreateForm';

function installVueGlobals(): void {
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('watch', watch);
}

const offeredCourseTypes: OfferedCourseType[] = [
    { id: 'type-b', code: 'B', name: 'Kategoria B' },
    { id: 'type-c', code: 'C', name: 'Kategoria C' },
];

const instructors: InstructorListItem[] = [
    {
        id: 'instructor-b',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.test',
        qualifiedCourseTypes: [
            { id: 'type-b', code: 'B', name: 'Kategoria B' },
        ],
    },
    {
        id: 'instructor-c',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.test',
        qualifiedCourseTypes: [
            { id: 'type-c', code: 'C', name: 'Kategoria C' },
        ],
    },
];

function createProps(
    overrides: Partial<CourseCreateFormProps> = {},
): CourseCreateFormProps {
    return {
        schoolId: 'school-1',
        offeredCourseTypes,
        enabledCourseKinds: ['THEORY_GROUP', 'PRACTICAL'],
        isSchoolContextLoading: false,
        instructors,
        isInstructorsLoading: false,
        isSaving: false,
        apiError: null,
        ...overrides,
    };
}

describe('useCourseCreateForm', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installVueGlobals();
    });

    it('submits a normalized theory course payload', async () => {
        const submit = vi.fn<(payload: CourseCreatePayload) => void>();
        const { useCourseCreateForm } = await import('./useCourseCreateForm');
        const form = useCourseCreateForm(createProps(), submit);

        form.nameModel.value = ' Kurs B teoria ';
        form.totalHoursModel.value = '30';
        form.theoryStartModel.value = '2026-09-01';
        form.theoryEndModel.value = '2026-09-14';
        form.capacityModel.value = '12';
        form.instructorIdModel.value = 'instructor-b';

        form.handleSubmit();

        expect(submit).toHaveBeenCalledWith({
            schoolId: 'school-1',
            name: 'Kurs B teoria',
            category: 'B',
            kind: 'THEORY_GROUP',
            totalHours: 30,
            theoryStartDate: '2026-09-01',
            theoryEndDate: '2026-09-14',
            capacity: 12,
            instructorId: 'instructor-b',
        });
    });

    it('keeps only instructors qualified for the selected category', async () => {
        const { useCourseCreateForm } = await import('./useCourseCreateForm');
        const form = useCourseCreateForm(createProps(), vi.fn());

        expect(form.categoryModel.value).toBe('B');
        expect(form.qualifiedInstructors.value.map((item) => item.id)).toEqual([
            'instructor-b',
        ]);

        form.categoryModel.value = 'C';

        expect(form.qualifiedInstructors.value.map((item) => item.id)).toEqual([
            'instructor-c',
        ]);
    });

    it('blocks submit and exposes validation flags for missing required fields', async () => {
        const submit = vi.fn<(payload: CourseCreatePayload) => void>();
        const { useCourseCreateForm } = await import('./useCourseCreateForm');
        const form = useCourseCreateForm(createProps(), submit);

        form.nameModel.value = '';
        form.totalHoursModel.value = '0';
        form.theoryStartModel.value = '';
        form.theoryEndModel.value = '';

        form.handleSubmit();

        expect(submit).not.toHaveBeenCalled();
        expect(form.showNameRequired.value).toBe(true);
        expect(form.showTotalHoursInvalid.value).toBe(true);
        expect(form.showTheoryStartRequired.value).toBe(true);
        expect(form.showTheoryEndRequired.value).toBe(true);
    });
});
