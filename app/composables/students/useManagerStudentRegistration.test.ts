import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readonly, ref } from 'vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

const addToast = vi.fn();
const navigateTo = vi.fn();
const requestBffSuccess = vi.fn();

function installNuxtRegistrationGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('readonly', readonly);
    vi.stubGlobal('useAppToast', () => ({
        addToast,
    }));
    vi.stubGlobal('navigateTo', navigateTo);
    vi.stubGlobal('requestBffSuccess', requestBffSuccess);
}

function school(overrides: Partial<DrivingSchool> = {}): DrivingSchool {
    return {
        id: 'school-1',
        name: 'OSK Test',
        city: null,
        address: null,
        ...overrides,
    };
}

function createRegistrationOptions(
    overrides: Partial<
        Parameters<
            (typeof import('./useManagerStudentRegistration'))['useManagerStudentRegistration']
        >[0]
    > = {},
) {
    return {
        schools: ref<DrivingSchool[]>([school()]),
        isSchoolsLoading: ref(false),
        activeSchoolId: ref('school-1'),
        activeCourseId: ref('course-1'),
        currentPage: ref(3),
        loadSchools: vi.fn().mockResolvedValue(undefined),
        loadCoursesForFilter: vi.fn().mockResolvedValue(undefined),
        loadStudents: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

describe('useManagerStudentRegistration', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtRegistrationGlobals();
    });

    it('opens create dialog and lazily loads schools when list is empty', async () => {
        const options = createRegistrationOptions({
            schools: ref<DrivingSchool[]>([]),
        });
        const { useManagerStudentRegistration } =
            await import('./useManagerStudentRegistration');
        const registration = useManagerStudentRegistration(options);

        registration.handleOpenCreateDialog();

        expect(registration.formDialogOpen.value).toBe(true);
        expect(options.loadSchools).toHaveBeenCalledTimes(1);
    });

    it('does not load schools when list exists or schools are already loading', async () => {
        const loadSchools = vi.fn().mockResolvedValue(undefined);
        const { useManagerStudentRegistration } =
            await import('./useManagerStudentRegistration');

        useManagerStudentRegistration(
            createRegistrationOptions({ loadSchools }),
        ).handleOpenCreateDialog();
        useManagerStudentRegistration(
            createRegistrationOptions({
                schools: ref<DrivingSchool[]>([]),
                isSchoolsLoading: ref(true),
                loadSchools,
            }),
        ).handleOpenCreateDialog();

        expect(loadSchools).not.toHaveBeenCalled();
    });

    it('clears create API error when dialog closes or opens from query', async () => {
        requestBffSuccess.mockRejectedValue({ statusCode: 403 });
        const { useManagerStudentRegistration } =
            await import('./useManagerStudentRegistration');
        const registration = useManagerStudentRegistration(
            createRegistrationOptions(),
        );

        await registration.handleStudentSubmit({
            email: 'student@example.com',
            password: 'secret123',
            firstName: 'Jan',
            lastName: 'Kowalski',
            schoolId: 'school-1',
        });
        expect(registration.apiError.value).toBe(
            'Brak uprawnień do tej operacji.',
        );

        registration.handleFormDialogOpenChange(false);
        expect(registration.apiError.value).toBeNull();

        requestBffSuccess.mockRejectedValue({ statusCode: 500 });
        await registration.handleStudentSubmit({
            email: 'student@example.com',
            password: 'secret123',
            firstName: 'Jan',
            lastName: 'Kowalski',
            schoolId: 'school-1',
        });
        expect(registration.apiError.value).toBe(
            'Serwer jest chwilowo niedostępny. Spróbuj ponownie.',
        );

        registration.openInitialRegisterForm();
        expect(registration.formDialogOpen.value).toBe(true);
        expect(registration.apiError.value).toBeNull();
    });

    it('creates student, resets filters, reloads data and clears query on success', async () => {
        requestBffSuccess.mockResolvedValue(undefined);
        navigateTo.mockResolvedValue(undefined);
        const options = createRegistrationOptions({
            schools: ref<DrivingSchool[]>([
                school(),
                school({ id: 'school-2', name: 'OSK Drugi' }),
            ]),
        });
        const { useManagerStudentRegistration } =
            await import('./useManagerStudentRegistration');
        const registration = useManagerStudentRegistration(options);

        registration.handleOpenCreateDialog();
        await registration.handleStudentSubmit({
            email: 'student@example.com',
            password: 'secret123',
            firstName: 'Jan',
            lastName: 'Kowalski',
            schoolId: 'school-2',
        });

        expect(requestBffSuccess).toHaveBeenCalledWith(
            'POST',
            '/api/auth/register',
            {
                body: {
                    role: 'STUDENT',
                    email: 'student@example.com',
                    password: 'secret123',
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    schoolId: 'school-2',
                },
                fallbackMessage: 'Nie udało się utworzyć konta kursanta.',
            },
        );
        expect(addToast).toHaveBeenCalledWith({
            title: 'Kursant został utworzony',
            variant: 'success',
        });
        expect(registration.formDialogOpen.value).toBe(false);
        expect(options.activeSchoolId.value).toBe('school-2');
        expect(options.activeCourseId.value).toBe('');
        expect(options.currentPage.value).toBe(1);
        expect(options.loadCoursesForFilter).toHaveBeenCalledTimes(1);
        expect(options.loadStudents).toHaveBeenCalledTimes(1);
        expect(navigateTo).toHaveBeenCalledWith('/manager/students', {
            replace: true,
        });
    });

    it('keeps selected school if submitted school is not in local list', async () => {
        requestBffSuccess.mockResolvedValue(undefined);
        const options = createRegistrationOptions({
            activeSchoolId: ref('school-1'),
        });
        const { useManagerStudentRegistration } =
            await import('./useManagerStudentRegistration');
        const registration = useManagerStudentRegistration(options);

        await registration.handleStudentSubmit({
            email: 'student@example.com',
            password: 'secret123',
            firstName: 'Jan',
            lastName: 'Kowalski',
            schoolId: 'unknown-school',
        });

        expect(options.activeSchoolId.value).toBe('school-1');
    });

    it('shows error toast and leaves dialog state unchanged on create failure', async () => {
        requestBffSuccess.mockRejectedValue({ statusCode: 403 });
        const options = createRegistrationOptions();
        const { useManagerStudentRegistration } =
            await import('./useManagerStudentRegistration');
        const registration = useManagerStudentRegistration(options);

        registration.handleOpenCreateDialog();
        await registration.handleStudentSubmit({
            email: 'student@example.com',
            password: 'secret123',
            firstName: 'Jan',
            lastName: 'Kowalski',
            schoolId: 'school-1',
        });

        expect(registration.formDialogOpen.value).toBe(true);
        expect(registration.apiError.value).toBe(
            'Brak uprawnień do tej operacji.',
        );
        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się utworzyć konta',
            description: 'Brak uprawnień do tej operacji.',
            variant: 'error',
        });
        expect(options.loadCoursesForFilter).not.toHaveBeenCalled();
        expect(options.loadStudents).not.toHaveBeenCalled();
        expect(navigateTo).not.toHaveBeenCalled();
    });
});
