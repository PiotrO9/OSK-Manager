import {
    computed,
    effectScope,
    nextTick,
    reactive,
    ref,
    shallowRef,
    watch,
} from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useManagerLessonEditPage } from './useManagerLessonEditPage';
import type { ManagerLessonDetail } from '~/types/lessons/managerLesson';

const fetchLesson = vi.fn();
const cancelLesson = vi.fn();
const updateLesson = vi.fn();
const navigateTo = vi.fn();
const addToast = vi.fn();
const applyPrefill = vi.fn();
const isCancelLoading = ref(false);
const isUpdateLoading = ref(false);
const route = reactive({ params: { id: '' }, query: {} });
const scopes: ReturnType<typeof effectScope>[] = [];
const form = {
    formInstructorId: ref(''),
    formStartLocal: ref(''),
    formEndLocal: ref(''),
    formVehicleId: ref(''),
    formError: ref<string | null>(null),
    isFormDirty: ref(true),
    buildPatchPayload: vi.fn(),
    applyPrefill,
    recheckLessonAvailability: vi.fn(),
};

function lesson(id = 'lesson-a'): ManagerLessonDetail {
    return {
        id,
        courseId: 'course',
        schoolId: 'school',
        studentId: 'student',
        instructorId: 'original-instructor',
        vehicleId: 'vehicle',
        lessonType: 'PRACTICE',
        startTime: '2030-01-10T10:00:00Z',
        endTime: '2030-01-10T11:00:00Z',
        status: 'SCHEDULED',
        student: { firstName: 'Jan', lastName: 'Test' },
        bookingMaxDaysAhead: 30,
    };
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
    });

    return { resolve, reject, promise };
}

function createPage() {
    const scope = effectScope();

    scopes.push(scope);

    return scope.run(() => useManagerLessonEditPage())!;
}

beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T12:00:00Z'));
    route.params.id = '';
    isCancelLoading.value = false;
    isUpdateLoading.value = false;
    form.formInstructorId.value = '';
    form.formError.value = null;
    form.buildPatchPayload.mockImplementation(() => ({
        ok: true,
        payload: { instructorId: 'new-instructor' },
    }));
    form.recheckLessonAvailability.mockResolvedValue('available');
    fetchLesson.mockResolvedValue(lesson());
    cancelLesson.mockResolvedValue(undefined);
    const globals = {
        ref,
        shallowRef,
        computed,
        watch,
        onMounted: vi.fn(),
        onUnmounted: vi.fn(),
        useRoute: () => route,
        usePageMeta: vi.fn(),
        navigateTo,
        useAppToast: () => ({ addToast }),
        useManagerLessonsApi: () => ({
            fetchLesson,
            updateLesson,
            cancelLesson,
            isCancelLoading,
            isUpdateLoading,
            isFetchLoading: ref(false),
        }),
        useVehiclesApi: () => ({
            fetchList: vi.fn(),
            fetchVehicleById: vi.fn(),
        }),
        useInstructorsApi: () => ({ fetchList: vi.fn() }),
        useManagerLessonEditForm: () => form,
        useManagerLessonEditReferences: () => ({
            studentDisplayName: ref('Jan Test'),
            clearFallbacks: vi.fn(),
            loadLessonReferences: vi.fn(),
            loadVehicles: vi.fn(),
            loadInstructors: vi.fn(),
        }),
        requestBffData: vi.fn().mockResolvedValue([]),
    };

    for (const [name, value] of Object.entries(globals))
        vi.stubGlobal(name, value);
});
afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop();

    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('manager lesson cancellation and page coordination', () => {
    it('does not open cancellation for a missing, noncancellable or saving lesson', () => {
        const page = createPage();

        page.handleRequestCancelLesson();
        expect(page.isCancelDialogOpen.value).toBe(false);
        page.loadedLesson.value = { ...lesson(), status: 'CANCELLED' };
        page.handleRequestCancelLesson();
        expect(page.isCancelDialogOpen.value).toBe(false);
        page.loadedLesson.value = lesson();
        isUpdateLoading.value = true;
        page.handleRequestCancelLesson();
        expect(page.isCancelDialogOpen.value).toBe(false);
    });
    it('closes and navigates to the original school and week on successful cancellation', async () => {
        const page = createPage();

        page.loadedLesson.value = lesson();
        page.handleRequestCancelLesson();
        await page.handleConfirmCancelLesson();
        expect(cancelLesson).toHaveBeenCalledWith('lesson-a');
        expect(page.isCancelDialogOpen.value).toBe(false);
        expect(addToast).toHaveBeenCalledTimes(1);
        expect(navigateTo).toHaveBeenCalledWith({
            path: '/menedzer/harmonogram',
            query: { schoolId: 'school', week: lesson().startTime },
        });
    });
    it.each([400, 409])(
        'reloads after cancellation error %i and reports a lesson that can no longer be cancelled',
        async (statusCode) => {
            const page = createPage();

            page.loadedLesson.value = lesson();
            page.handleRequestCancelLesson();
            cancelLesson.mockRejectedValue({ statusCode });
            fetchLesson.mockResolvedValue({ ...lesson(), status: 'CANCELLED' });
            await page.handleConfirmCancelLesson();
            expect(fetchLesson).toHaveBeenCalledWith('lesson-a');
            expect(page.canCancelLesson.value).toBe(false);
            expect(page.cancelError.value).toContain('nie może już');
            expect(page.isCancelDialogOpen.value).toBe(true);
            expect(navigateTo).not.toHaveBeenCalled();
        },
    );
    it.each([false, true])(
        'keeps the cancellation error when refresh is still cancellable or fails (%s)',
        async (rejectRefresh) => {
            const page = createPage();

            page.loadedLesson.value = lesson();
            cancelLesson.mockRejectedValue({ statusCode: 409 });

            if (rejectRefresh)
                fetchLesson.mockRejectedValue(new Error('read failed'));

            await page.handleConfirmCancelLesson();
            expect(page.cancelError.value).toBeTruthy();
            expect(page.cancelError.value).not.toContain('read failed');
            expect(page.canCancelLesson.value).toBe(true);
            expect(navigateTo).not.toHaveBeenCalled();
        },
    );
    it('does not refresh on a technical cancellation failure and blocks commands during cancellation', async () => {
        const page = createPage();

        page.loadedLesson.value = lesson();
        cancelLesson.mockRejectedValue({ statusCode: 503 });
        await page.handleConfirmCancelLesson();
        expect(fetchLesson).not.toHaveBeenCalled();
        isCancelLoading.value = true;
        await page.handleConfirmCancelLesson();
        await page.handleSubmit();
        expect(cancelLesson).toHaveBeenCalledTimes(1);
        expect(updateLesson).not.toHaveBeenCalled();
    });
    it.each([false, true])(
        'ignores the old lesson response after navigating to another lesson (reject=%s)',
        async (rejectOld) => {
            const old = deferred<ManagerLessonDetail>();

            fetchLesson
                .mockReturnValueOnce(old.promise)
                .mockResolvedValueOnce(lesson('lesson-b'));
            route.params.id = 'lesson-a';
            const page = createPage();

            route.params.id = 'lesson-b';
            await nextTick();
            await nextTick();

            if (rejectOld) old.reject({ statusCode: 404 });
            else old.resolve(lesson('lesson-a'));

            await nextTick();
            await nextTick();
            expect(page.loadedLesson.value?.id).toBe('lesson-b');
            expect(page.notFound.value).toBe(false);
            expect(page.loadError.value).toBeNull();
        },
    );
    it('sends the expected lesson state and retains read-only fields after saving', async () => {
        route.params.id = 'lesson-a';
        const page = createPage();

        await nextTick();
        await nextTick();
        const {
            schoolId: _school,
            student: _student,
            bookingMaxDaysAhead: _days,
            ...patchResponse
        } = lesson();

        updateLesson.mockResolvedValue({
            ...patchResponse,
            instructorId: 'new-instructor',
        });
        await page.handleSubmit();
        expect(updateLesson).toHaveBeenCalledWith('lesson-a', {
            instructorId: 'new-instructor',
            expectedLessonState: {
                instructorId: 'original-instructor',
                vehicleId: 'vehicle',
                startTime: lesson().startTime,
                endTime: lesson().endTime,
            },
        });
        expect(page.loadedLesson.value).toMatchObject({
            schoolId: 'school',
            student: lesson().student,
            bookingMaxDaysAhead: 30,
            instructorId: 'new-instructor',
        });
    });
    // Existing races are documented rather than changed as part of the extraction.
    it.fails(
        'known issue: a failed cancellation refresh should not replace a newer route lesson',
        async () => {
            const page = createPage();

            page.loadedLesson.value = lesson();
            cancelLesson.mockRejectedValue({ statusCode: 409 });
            const old = deferred<ManagerLessonDetail>();

            fetchLesson.mockReturnValueOnce(old.promise);
            const pending = page.handleConfirmCancelLesson();

            await nextTick();
            page.loadedLesson.value = lesson('lesson-b');
            old.resolve({ ...lesson(), status: 'CANCELLED' });
            await pending;
            expect(page.loadedLesson.value?.id).toBe('lesson-b');
        },
    );
    it.fails(
        'known issue: a late save response should not replace a newer route lesson',
        async () => {
            route.params.id = 'lesson-a';
            const page = createPage();

            await nextTick();
            await nextTick();
            const old = deferred<ManagerLessonDetail>();

            updateLesson.mockReturnValueOnce(old.promise);
            const pending = page.handleSubmit();

            await nextTick();
            page.loadedLesson.value = lesson('lesson-b');
            old.resolve({ ...lesson(), instructorId: 'new-instructor' });
            await pending;
            expect(page.loadedLesson.value?.id).toBe('lesson-b');
        },
    );
});
