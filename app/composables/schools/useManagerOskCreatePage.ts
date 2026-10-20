import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    watch,
} from 'vue';
import { isNavigationFailure, onBeforeRouteLeave } from 'vue-router';
import { appPaths } from '~~/shared/routing/appPaths';
import { oskFormSchema } from '~/utils/forms/oskFormSchema';
import {
    buildManagerOskCreateBody,
    getManagerOskErrorMessage,
} from '~/utils/schools/managerOskPage';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

export function useManagerOskCreatePage() {
    const { fetchList, create, setAsDefault } = useDrivingSchoolsApi();
    const { addToast } = useAppToast();
    const schools = ref<DrivingSchool[]>([]);
    const isSchoolsLoading = shallowRef(true);
    const schoolsLoadError = shallowRef<string | null>(null);
    const hasLoadedSchools = shallowRef(false);
    const name = shallowRef('');
    const city = shallowRef('');
    const address = shallowRef('');
    const asDefault = shallowRef(false);
    const nameError = shallowRef('');
    const submitError = shallowRef('');
    const isSaving = shallowRef(false);
    const isCreated = shallowRef(false);
    const isNavigating = shallowRef(false);
    const navigationError = shallowRef<string | null>(null);
    const isLeaveDialogOpen = shallowRef(false);
    const initialSnapshot = shallowRef('');
    const defaultSwitchLocked = computed(
        () => hasLoadedSchools.value && schools.value.length === 0,
    );
    const snapshot = computed(() =>
        JSON.stringify([
            name.value,
            city.value,
            address.value,
            asDefault.value,
        ]),
    );
    const isDirty = computed(
        () =>
            hasLoadedSchools.value &&
            !isCreated.value &&
            snapshot.value !== initialSnapshot.value,
    );
    let loadSequence = 0;
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

    async function loadSchools() {
        if (isSaving.value || isCreated.value) return;

        const sequence = ++loadSequence;

        isSchoolsLoading.value = true;
        schoolsLoadError.value = null;

        try {
            const items = await fetchList();

            if (isDisposed || sequence !== loadSequence) return;

            schools.value = items;

            if (!hasLoadedSchools.value) {
                asDefault.value = items.length === 0;
                initialSnapshot.value = snapshot.value;
                hasLoadedSchools.value = true;
            }
        } catch (error) {
            if (isDisposed || sequence !== loadSequence) return;

            schoolsLoadError.value = getManagerOskErrorMessage(
                error,
                'Nie udało się pobrać listy OSK.',
            );
        } finally {
            if (!isDisposed && sequence === loadSequence)
                isSchoolsLoading.value = false;
        }
    }

    async function returnToList() {
        if (isNavigating.value || isSaving.value) return;

        navigationError.value = null;
        isNavigating.value = true;

        try {
            const result = await navigateTo(appPaths.managerSchools(), {
                replace: isCreated.value,
            });

            if (result === false || isNavigationFailure(result)) {
                if (isCreated.value)
                    navigationError.value =
                        'Szkoła została dodana. Nie udało się wrócić na listę OSK.';
            }
        } catch {
            navigationError.value = isCreated.value
                ? 'Szkoła została dodana. Nie udało się wrócić na listę OSK.'
                : 'Nie udało się wrócić na listę OSK. Spróbuj ponownie.';
        } finally {
            isNavigating.value = false;
        }
    }

    async function handleSubmit(): Promise<
        'created' | 'field-error' | 'error' | 'ignored'
    > {
        if (
            isSaving.value ||
            isCreated.value ||
            !hasLoadedSchools.value ||
            isSchoolsLoading.value ||
            schoolsLoadError.value
        )
            return 'ignored';

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
            const createdSchool = await create(
                buildManagerOskCreateBody(parsed.data),
            );

            // POST is committed. Subsequent failures must never enable another create.
            isCreated.value = true;
            let defaultChangeFailed = false;

            if (asDefault.value && schools.value.length > 0) {
                try {
                    await setAsDefault(createdSchool.id);
                } catch {
                    defaultChangeFailed = true;
                }
            }

            addToast(
                defaultChangeFailed
                    ? {
                          title: 'Szkoła została dodana',
                          description:
                              'Nie udało się ustawić jej jako domyślnej. Możesz zrobić to z poziomu listy.',
                          variant: 'warning',
                      }
                    : {
                          title: 'Dodano szkołę',
                          description: `Szkoła „${parsed.data.name}” jest gotowa do konfiguracji.`,
                          variant: 'success',
                      },
            );
        } catch (error) {
            submitError.value = getManagerOskErrorMessage(
                error,
                'Nie udało się dodać szkoły. Spróbuj ponownie.',
            );

            return 'error';
        } finally {
            isSaving.value = false;
        }

        if (!isDisposed) await returnToList();

        return 'created';
    }

    watch(
        name,
        () => {
            nameError.value = '';
        },
        { flush: 'sync' },
    );
    watch(
        [name, city, address, asDefault],
        () => {
            submitError.value = '';
        },
        { flush: 'sync' },
    );
    onMounted(() => {
        void loadSchools();
        window.addEventListener('beforeunload', handleBeforeUnload);
    });
    onBeforeUnmount(() => {
        isDisposed = true;
        loadSequence++;
        window.removeEventListener('beforeunload', handleBeforeUnload);
        finishLeave(false);
    });

    return {
        name,
        city,
        address,
        asDefault,
        nameError,
        submitError,
        defaultSwitchLocked,
        isSchoolsLoading,
        schoolsLoadError,
        isSaving,
        isCreated,
        isNavigating,
        navigationError,
        isDirty,
        isLeaveDialogOpen,
        cancelLeave: () => finishLeave(false),
        confirmDiscard: () => finishLeave(true),
        loadSchools,
        returnToList,
        handleSubmit,
    };
}
