import {
    normalizeInstructorDetail,
    normalizeInstructorDetailForEdit,
    type InstructorDetail,
    type InstructorEditFormModel,
} from '~/types/instructors/instructor';
import type { CourseTypeOption } from '~/types/courses/courseType';
import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { requestBffData, requestBffSuccess } from '../core/useApi';
import { usePageMeta } from '../core/usePageMeta';

export function getManagerInstructorRouteString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

export function displayManagerInstructorText(value: string): string {
    const text = value.trim();

    return text.length > 0 ? text : '—';
}

export function normalizeManagerInstructorCourseTypeIds(
    ids: string[],
): string[] {
    const out: string[] = [];

    for (const raw of ids) {
        const id = raw.trim();

        if (id && !out.includes(id)) {
            out.push(id);
        }
    }

    return out.sort((a, b) => a.localeCompare(b));
}

export function areSameManagerInstructorCourseTypeIds(
    left: string[],
    right: string[],
): boolean {
    const a = normalizeManagerInstructorCourseTypeIds(left);
    const b = normalizeManagerInstructorCourseTypeIds(right);

    return a.length === b.length && a.every((id, index) => id === b[index]);
}

export function buildManagerInstructorDirtyPatch(
    form: InstructorEditFormModel | null,
    base: InstructorEditFormModel | null,
): Record<string, unknown> | null {
    if (!form || !base) {
        return null;
    }

    const patch: Record<string, unknown> = {};

    if (form.firstName.trim() !== base.firstName.trim()) {
        patch.firstName = form.firstName.trim();
    }

    if (form.lastName.trim() !== base.lastName.trim()) {
        patch.lastName = form.lastName.trim();
    }

    if (form.qualifications !== base.qualifications) {
        patch.qualifications = form.qualifications;
    }

    if (
        !areSameManagerInstructorCourseTypeIds(
            form.qualifiedCourseTypeIds,
            base.qualifiedCourseTypeIds,
        )
    ) {
        patch.qualifiedCourseTypeIds = normalizeManagerInstructorCourseTypeIds(
            form.qualifiedCourseTypeIds,
        );
    }

    if (form.experienceYears !== base.experienceYears) {
        patch.experienceYears = form.experienceYears;
    }

    return Object.keys(patch).length > 0 ? patch : null;
}

export function validateManagerInstructorPatch(
    patch: Record<string, unknown>,
): string | null {
    if (typeof patch.firstName === 'string' && !patch.firstName.trim()) {
        return 'Imię nie może być puste.';
    }

    if (typeof patch.lastName === 'string' && !patch.lastName.trim()) {
        return 'Nazwisko nie może być puste.';
    }

    if (typeof patch.experienceYears === 'number') {
        const years = patch.experienceYears;

        if (!Number.isInteger(years) || years < 0 || years > 80) {
            return 'Staż musi być liczbą całkowitą od 0 do 80.';
        }
    }

    return null;
}

function getNotFoundMessage(): string {
    return 'Nie znaleziono instruktora.';
}

function getGenericLoadErrorMessage(): string {
    return 'Nie udało się wczytać danych instruktora.';
}

function getGenericSaveErrorMessage(): string {
    return 'Nie udało się zapisać zmian.';
}

function getGenericCourseTypesErrorMessage(): string {
    return 'Nie udało się pobrać katalogu kategorii uprawnień.';
}

function getInstructorSaveErrorMessage(err: unknown): string {
    const status = getApiErrorStatusCode(err);
    const fromServer = getApiFetchErrorMessage(err, '').trim();

    if (status === 400) {
        return fromServer.length > 0
            ? fromServer
            : 'Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie.';
    }

    if (status === 403) {
        return fromServer.length > 0
            ? fromServer
            : 'Brak uprawnień do zapisu zmian.';
    }

    if (status === 404) {
        return fromServer.length > 0
            ? fromServer
            : 'Nie znaleziono instruktora.';
    }

    if (status !== undefined && status >= 500) {
        return fromServer.length > 0
            ? fromServer
            : 'Błąd serwera. Spróbuj ponownie później.';
    }

    return getApiFetchErrorMessage(err, getGenericSaveErrorMessage());
}

function getInstructorDeleteErrorMessage(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak uprawnień do tej operacji.';
    }

    if (status === 404) {
        return 'Instruktor nie istnieje lub został już usunięty.';
    }

    if (status === 401) {
        return getApiFetchErrorMessage(err, 'Brak autoryzacji.');
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (status === 400) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane.');
    }

    return getApiFetchErrorMessage(err, 'Nie udało się usunąć instruktora.');
}

type InstructorDetailData = InstructorDetail | null;

export function useManagerInstructorDetailsPage() {
    const route = useRoute();
    const { addToast } = useAppToast();
    const {
        fetchList: fetchCourseTypesList,
        isListLoading: isCourseTypesLoading,
    } = useCourseTypesApi();
    const { fetchInstructorRatings } = useLessonRatingsListApi();

    const instructor = ref<InstructorDetail | null>(null);
    const editForm = ref<InstructorEditFormModel | null>(null);
    const editBaseline = ref<InstructorEditFormModel | null>(null);
    const courseTypes = ref<CourseTypeOption[]>([]);
    const courseTypesError = ref<string | null>(null);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);
    const isSubmitting = ref(false);
    const submitError = ref<string | null>(null);
    const isEditDialogOpen = ref(false);
    const isDeleteDialogOpen = ref(false);
    const isDeleting = ref(false);
    const ratingSummary = ref<LessonRatingsSummary>({
        averageRating: null,
        totalCount: 0,
    });
    const isRatingSummaryLoading = ref(false);

    const instructorSubpageQuery = computed((): Record<string, string> => {
        const schoolId = getManagerInstructorRouteString(route.query.schoolId);

        return schoolId.length > 0 ? { schoolId } : {};
    });

    usePageMeta({
        title: () => instructor.value?.name?.trim() || 'Instruktor',
        description: () => 'Szczegóły instruktora.',
    });

    let fetchSeq = 0;

    async function loadInstructor(rawId: unknown) {
        errorMessage.value = null;

        const id = getManagerInstructorRouteString(rawId);

        if (!id) {
            instructor.value = null;
            editForm.value = null;
            editBaseline.value = null;
            errorMessage.value = getNotFoundMessage();
            isLoading.value = false;

            return;
        }

        const seq = ++fetchSeq;

        isLoading.value = true;
        instructor.value = null;
        editForm.value = null;
        editBaseline.value = null;

        try {
            const data = await requestBffData<InstructorDetailData>(
                'GET',
                `/api/instructors/${encodeURIComponent(id)}`,
                {
                    fallbackMessage: getGenericLoadErrorMessage(),
                },
            );
            const normalized = normalizeInstructorDetail(data);
            const forEdit = normalizeInstructorDetailForEdit(data);

            if (seq !== fetchSeq) {
                return;
            }

            if (!normalized || !forEdit) {
                errorMessage.value = getNotFoundMessage();
                instructor.value = null;

                return;
            }

            instructor.value = normalized;
            editForm.value = { ...forEdit };
            editBaseline.value = { ...forEdit };
        } catch (err: unknown) {
            if (seq !== fetchSeq) {
                return;
            }

            const status = getApiErrorStatusCode(err);

            errorMessage.value =
                status === 404 || status === 400
                    ? getNotFoundMessage()
                    : getApiFetchErrorMessage(
                          err,
                          getGenericLoadErrorMessage(),
                      );
            instructor.value = null;
        } finally {
            if (seq === fetchSeq) {
                isLoading.value = false;
            }
        }
    }

    async function loadCourseTypes(): Promise<void> {
        courseTypesError.value = null;

        try {
            courseTypes.value = await fetchCourseTypesList();
        } catch (err: unknown) {
            courseTypes.value = [];
            courseTypesError.value = getApiFetchErrorMessage(
                err,
                getGenericCourseTypesErrorMessage(),
            );
        }
    }

    async function loadRatingSummary(rawId: unknown): Promise<void> {
        const id = getManagerInstructorRouteString(rawId);
        const schoolId = getManagerInstructorRouteString(route.query.schoolId);

        ratingSummary.value = { averageRating: null, totalCount: 0 };

        if (!id || !schoolId) {
            return;
        }

        isRatingSummaryLoading.value = true;

        try {
            const payload = await fetchInstructorRatings(id, {
                schoolId,
                period: 'all',
                limit: 1,
            });

            ratingSummary.value = payload.summary;
        } catch {
            ratingSummary.value = { averageRating: null, totalCount: 0 };
        } finally {
            isRatingSummaryLoading.value = false;
        }
    }

    watch(
        () => route.params.id,
        async (id) => {
            submitError.value = null;
            isEditDialogOpen.value = false;
            isDeleteDialogOpen.value = false;
            await Promise.all([
                loadInstructor(id),
                loadCourseTypes(),
                loadRatingSummary(id),
            ]);
        },
        { immediate: true },
    );

    watch(isEditDialogOpen, (open) => {
        if (open) {
            return;
        }

        submitError.value = null;

        if (editBaseline.value && editForm.value) {
            editForm.value = { ...editBaseline.value };
        }
    });

    function handleEnterEdit(): void {
        submitError.value = null;

        if (editBaseline.value) {
            editForm.value = { ...editBaseline.value };
        }

        isEditDialogOpen.value = true;
    }

    async function handleSubmitEdit(): Promise<void> {
        submitError.value = null;

        const patch = buildManagerInstructorDirtyPatch(
            editForm.value,
            editBaseline.value,
        );

        if (!patch) {
            isEditDialogOpen.value = false;

            return;
        }

        const validationMessage = validateManagerInstructorPatch(patch);

        if (validationMessage) {
            submitError.value = validationMessage;

            return;
        }

        const id = getManagerInstructorRouteString(route.params.id);

        if (!id) {
            return;
        }

        isSubmitting.value = true;

        try {
            const updated = await requestBffData<InstructorDetailData>(
                'PATCH',
                `/api/instructors/${encodeURIComponent(id)}`,
                {
                    body: patch,
                    fallbackMessage: getGenericSaveErrorMessage(),
                },
            );
            const normalized = normalizeInstructorDetail(updated);
            const forEdit = normalizeInstructorDetailForEdit(updated);

            if (!normalized || !forEdit) {
                submitError.value =
                    'Nieprawidłowa odpowiedź serwera po zapisie. Spróbuj ponownie.';

                return;
            }

            instructor.value = normalized;
            editForm.value = { ...forEdit };
            editBaseline.value = { ...forEdit };

            addToast({
                title: 'Zapisano zmiany',
                description: 'Dane instruktora zostały zaktualizowane.',
                variant: 'success',
            });

            isEditDialogOpen.value = false;
        } catch (err: unknown) {
            submitError.value = getInstructorSaveErrorMessage(err);
        } finally {
            isSubmitting.value = false;
        }
    }

    function handleOpenDeleteDialog(): void {
        if (isDeleting.value || isSubmitting.value) {
            return;
        }

        isEditDialogOpen.value = false;
        isDeleteDialogOpen.value = true;
    }

    function handleDeleteDialogCancel(): void {
        isDeleteDialogOpen.value = false;
    }

    function handleDeleteDialogOpenChange(open: boolean): void {
        isDeleteDialogOpen.value = open;
    }

    async function runDeleteInstructor(): Promise<void> {
        if (isDeleting.value) {
            return;
        }

        const id = getManagerInstructorRouteString(route.params.id);

        if (!id) {
            return;
        }

        isDeleting.value = true;

        try {
            await requestBffSuccess(
                'DELETE',
                `/api/instructors/${encodeURIComponent(id)}`,
                {
                    fallbackMessage: 'Nie udało się usunąć instruktora.',
                },
            );

            addToast({
                title: 'Instruktor został usunięty',
                variant: 'success',
            });

            isEditDialogOpen.value = false;

            await navigateTo('/manager/instructors');
        } catch (err: unknown) {
            addToast({
                title: 'Nie udało się usunąć instruktora',
                description: getInstructorDeleteErrorMessage(err),
                variant: 'error',
            });
        } finally {
            isDeleting.value = false;
        }
    }

    async function handleDeleteDialogConfirm(): Promise<void> {
        isDeleteDialogOpen.value = false;
        await runDeleteInstructor();
    }

    return {
        route,
        instructor,
        editForm,
        courseTypes,
        courseTypesError,
        isLoading,
        errorMessage,
        isSubmitting,
        submitError,
        isEditDialogOpen,
        isDeleteDialogOpen,
        isDeleting,
        ratingSummary,
        isRatingSummaryLoading,
        isCourseTypesLoading,
        instructorSubpageQuery,
        displayText: displayManagerInstructorText,
        loadInstructor,
        handleEnterEdit,
        handleSubmitEdit,
        handleOpenDeleteDialog,
        handleDeleteDialogCancel,
        handleDeleteDialogOpenChange,
        handleDeleteDialogConfirm,
    };
}
