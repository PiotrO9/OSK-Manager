import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import { isNavigationFailure, onBeforeRouteLeave } from 'vue-router';
import { appPaths } from '~~/shared/routing/appPaths';
import type { CourseKind } from '~~/shared/contracts/courses';
import type { CourseTypeOption } from '~/types/courses/courseType';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { oskFormSchema } from '~/utils/forms/oskFormSchema';
import {
    buildManagerOskEditFormValues,
    buildManagerOskUpdateBody,
    getManagerOskErrorMessage,
} from '~/utils/schools/managerOskPage';

export function useManagerOskEditPage() {
    const route = useRoute();
    const { fetchList, update } = useDrivingSchoolsApi();
    const { fetchList: fetchCourseTypes } = useCourseTypesApi();
    const { addToast } = useAppToast();

    const school = shallowRef<DrivingSchool | null>(null);
    const isSchoolLoading = shallowRef(true);
    const schoolLoadError = shallowRef<string | null>(null);
    const isSchoolMissing = shallowRef(false);
    const courseTypes = shallowRef<CourseTypeOption[]>([]);
    const isCourseTypesLoading = shallowRef(true);
    const courseTypesLoadError = shallowRef<string | null>(null);
    const name = shallowRef('');
    const city = shallowRef('');
    const address = shallowRef('');
    const enabledCourseKinds = shallowRef<CourseKind[]>([]);
    const offeredCourseTypeIds = shallowRef<string[]>([]);
    const nameError = shallowRef('');
    const submitError = shallowRef('');
    const navigationError = shallowRef<string | null>(null);
    const isSaving = shallowRef(false);
    const isSaved = shallowRef(false);
    const isNavigating = shallowRef(false);
    const isLeaveDialogOpen = shallowRef(false);
    const initialSnapshot = shallowRef('');
    const snapshot = computed(() =>
        JSON.stringify([
            name.value,
            city.value,
            address.value,
            enabledCourseKinds.value,
            offeredCourseTypeIds.value,
        ]),
    );
    const isDirty = computed(
        () =>
            school.value !== null &&
            !isSaved.value &&
            snapshot.value !== initialSnapshot.value,
    );
    const canSave = computed(
        () =>
            school.value !== null &&
            !isSaving.value &&
            !isSaved.value &&
            !isNavigating.value &&
            !isCourseTypesLoading.value &&
            !courseTypesLoadError.value,
    );
    let schoolLoadSequence = 0;
    let courseTypesLoadSequence = 0;
    let isDisposed = false;
    let leaveDecision: Promise<boolean> | null = null;
    let resolveLeave: ((allow: boolean) => void) | null = null;

    function finishLeave(allow: boolean) {
        const resolve = resolveLeave;

        resolveLeave = null;
        leaveDecision = null;
        isLeaveDialogOpen.value = false;
        resolve?.(allow);
    }

    onBeforeRouteLeave(() => {
        if (isSaving.value) return false;

        if (!isDirty.value) return true;

        if (leaveDecision) return leaveDecision;

        isLeaveDialogOpen.value = true;
        leaveDecision = new Promise<boolean>((resolve) => {
            resolveLeave = resolve;
        });

        return leaveDecision;
    });

    function handleBeforeUnload(event: BeforeUnloadEvent) {
        if (!isDirty.value && !isSaving.value) return;

        event.preventDefault();
        event.returnValue = '';
    }

    async function loadSchool() {
        const sequence = ++schoolLoadSequence;

        isSchoolLoading.value = true;
        schoolLoadError.value = null;
        isSchoolMissing.value = false;

        try {
            const schools = await fetchList();

            if (isDisposed || sequence !== schoolLoadSequence) return;

            const schoolId = route.params.id;
            const foundSchool =
                typeof schoolId === 'string'
                    ? (schools.find((item) => item.id === schoolId) ?? null)
                    : null;

            if (!foundSchool) {
                isSchoolMissing.value = true;

                return;
            }

            if (
                foundSchool.enabledCourseKinds === undefined ||
                foundSchool.offeredCourseTypes === undefined
            ) {
                schoolLoadError.value =
                    'Dane ustawień tej szkoły są niepełne. Spróbuj ponownie.';

                return;
            }

            const values = buildManagerOskEditFormValues(foundSchool);

            school.value = foundSchool;
            name.value = values.name;
            city.value = values.city;
            address.value = values.address;
            enabledCourseKinds.value = values.enabledCourseKinds;
            offeredCourseTypeIds.value = values.offeredCourseTypeIds;
            initialSnapshot.value = snapshot.value;
        } catch (error) {
            if (isDisposed || sequence !== schoolLoadSequence) return;

            schoolLoadError.value = getManagerOskErrorMessage(
                error,
                'Nie udało się pobrać danych OSK.',
            );
        } finally {
            if (!isDisposed && sequence === schoolLoadSequence)
                isSchoolLoading.value = false;
        }
    }

    async function loadCourseTypes() {
        const sequence = ++courseTypesLoadSequence;

        isCourseTypesLoading.value = true;
        courseTypesLoadError.value = null;

        try {
            const items = await fetchCourseTypes();

            if (isDisposed || sequence !== courseTypesLoadSequence) return;

            courseTypes.value = items;
        } catch (error) {
            if (isDisposed || sequence !== courseTypesLoadSequence) return;

            courseTypesLoadError.value = getManagerOskErrorMessage(
                error,
                'Nie udało się pobrać katalogu kategorii.',
            );
        } finally {
            if (!isDisposed && sequence === courseTypesLoadSequence)
                isCourseTypesLoading.value = false;
        }
    }

    async function returnToList() {
        if (isNavigating.value || isSaving.value) return;

        navigationError.value = null;
        isNavigating.value = true;

        try {
            const result = await navigateTo(appPaths.managerSchools(), {
                replace: isSaved.value,
            });

            if (
                (result === false || isNavigationFailure(result)) &&
                isSaved.value
            )
                navigationError.value =
                    'Zmiany zostały zapisane. Nie udało się wrócić na listę OSK.';
        } catch {
            navigationError.value = isSaved.value
                ? 'Zmiany zostały zapisane. Nie udało się wrócić na listę OSK.'
                : 'Nie udało się wrócić na listę OSK. Spróbuj ponownie.';
        } finally {
            isNavigating.value = false;
        }
    }

    async function handleSubmit(): Promise<
        'saved' | 'field-error' | 'error' | 'ignored'
    > {
        if (!canSave.value || !school.value) return 'ignored';

        nameError.value = '';
        submitError.value = '';
        const parsed = oskFormSchema.safeParse({
            name: name.value,
            city: city.value,
            address: address.value,
        });

        if (!parsed.success) {
            nameError.value =
                parsed.error.flatten().fieldErrors.name?.[0] ??
                'Podaj nazwę szkoły jazdy.';

            return 'field-error';
        }

        isSaving.value = true;

        try {
            await update(
                school.value.id,
                buildManagerOskUpdateBody({
                    ...parsed.data,
                    enabledCourseKinds: enabledCourseKinds.value,
                    offeredCourseTypeIds: offeredCourseTypeIds.value,
                }),
            );
            isSaved.value = true;
            addToast({
                title: 'Zapisano zmiany',
                description: `Dane szkoły „${parsed.data.name}” zostały zaktualizowane.`,
                variant: 'success',
            });
        } catch (error) {
            submitError.value = getManagerOskErrorMessage(
                error,
                'Nie udało się zapisać zmian. Spróbuj ponownie.',
            );

            return 'error';
        } finally {
            isSaving.value = false;
        }

        if (!isDisposed) await returnToList();

        return 'saved';
    }

    watch(name, () => (nameError.value = ''), { flush: 'sync' });
    watch(
        [name, city, address, enabledCourseKinds, offeredCourseTypeIds],
        () => (submitError.value = ''),
        { flush: 'sync' },
    );
    onMounted(() => {
        void loadSchool();
        void loadCourseTypes();
        window.addEventListener('beforeunload', handleBeforeUnload);
    });
    onBeforeUnmount(() => {
        isDisposed = true;
        schoolLoadSequence++;
        courseTypesLoadSequence++;
        window.removeEventListener('beforeunload', handleBeforeUnload);
        finishLeave(false);
    });

    return {
        school,
        isSchoolLoading,
        schoolLoadError,
        isSchoolMissing,
        loadSchool,
        courseTypes,
        isCourseTypesLoading,
        courseTypesLoadError,
        loadCourseTypes,
        name,
        city,
        address,
        enabledCourseKinds,
        offeredCourseTypeIds,
        nameError,
        submitError,
        navigationError,
        isSaving,
        isSaved,
        isNavigating,
        canSave,
        isDirty,
        isLeaveDialogOpen,
        cancelLeave: () => finishLeave(false),
        confirmDiscard: () => finishLeave(true),
        returnToList,
        handleSubmit,
    };
}
