<script setup lang="ts">
import {
    normalizeInstructorDetail,
    normalizeInstructorDetailForEdit,
    type InstructorDetail,
    type InstructorEditFormModel,
} from '~/types/instructor';
import type { CourseTypeOption } from '~/types/courseType';
import type { LessonRatingsSummary } from '~/types/lessonRating';
import {
    assertBooleanSuccessEnvelope,
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { useAppToast } from '~/composables/useAppToast';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

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

const route = useRoute();
const { addToast } = useAppToast();
const { fetchList: fetchCourseTypesList, isListLoading: isCourseTypesLoading } =
    useCourseTypesApi();
const { fetchInstructorRatings } = useLessonRatingsListApi();

/** Opcjonalnie `schoolId` z query (np. z listy OSK) — przekazywany do podstron instruktora. */
const instructorSubpageQuery = computed((): Record<string, string> => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s === 'string' && s.trim().length > 0) {
        return { schoolId: s.trim() };
    }

    return {};
});

usePageMeta({
    title: () => instructor.value?.name?.trim() || 'Instruktor',
    description: () => 'Szczegóły instruktora.',
});

let fetchSeq = 0;

function getRouteIdString(rawId: unknown): string {
    if (typeof rawId === 'string') {
        return rawId.trim();
    }

    if (Array.isArray(rawId)) {
        return String(rawId[0] ?? '').trim();
    }

    return '';
}

function getRouteQueryString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '—';
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

/** Komunikat błędu zapisu z uwzględnieniem kodu HTTP (404/403/400/5xx). */
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

async function loadInstructor(rawId: unknown) {
    errorMessage.value = null;

    const id = getRouteIdString(rawId);

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
        const url = resolveBffEndpoint(
            `/api/instructors/${encodeURIComponent(id)}`,
        );

        const raw = await $fetch<unknown>(url, { credentials: 'include' });
        const data = unwrapApiSuccessData<unknown>(raw);
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

        if (status === 404 || status === 400) {
            errorMessage.value = getNotFoundMessage();
        } else {
            errorMessage.value = getApiFetchErrorMessage(
                err,
                getGenericLoadErrorMessage(),
            );
        }

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
    const id = getRouteIdString(rawId);
    const schoolId = getRouteQueryString(route.query.schoolId);

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

function normalizeCourseTypeIds(ids: string[]): string[] {
    const out: string[] = [];

    for (const raw of ids) {
        const id = raw.trim();

        if (id && !out.includes(id)) {
            out.push(id);
        }
    }

    return out.sort((a, b) => a.localeCompare(b));
}

function areSameCourseTypeIds(left: string[], right: string[]): boolean {
    const a = normalizeCourseTypeIds(left);
    const b = normalizeCourseTypeIds(right);

    if (a.length !== b.length) {
        return false;
    }

    return a.every((id, index) => id === b[index]);
}

function buildDirtyPatch(): Record<string, unknown> | null {
    const form = editForm.value;
    const base = editBaseline.value;

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
        !areSameCourseTypeIds(
            form.qualifiedCourseTypeIds,
            base.qualifiedCourseTypeIds,
        )
    ) {
        patch.qualifiedCourseTypeIds = normalizeCourseTypeIds(
            form.qualifiedCourseTypeIds,
        );
    }

    if (form.experienceYears !== base.experienceYears) {
        patch.experienceYears = form.experienceYears;
    }

    if (Object.keys(patch).length === 0) {
        return null;
    }

    return patch;
}

function validatePatch(patch: Record<string, unknown>): string | null {
    if (typeof patch.firstName === 'string' && !patch.firstName.trim()) {
        return 'Imię nie może być puste.';
    }

    if (typeof patch.lastName === 'string' && !patch.lastName.trim()) {
        return 'Nazwisko nie może być puste.';
    }

    if (typeof patch.experienceYears === 'number') {
        const y = patch.experienceYears;

        if (!Number.isInteger(y) || y < 0 || y > 80) {
            return 'Staż musi być liczbą całkowitą od 0 do 80.';
        }
    }

    return null;
}

async function handleSubmitEdit(): Promise<void> {
    submitError.value = null;

    const patch = buildDirtyPatch();

    if (!patch) {
        isEditDialogOpen.value = false;

        return;
    }

    const validationMessage = validatePatch(patch);

    if (validationMessage) {
        submitError.value = validationMessage;

        return;
    }

    const id = getRouteIdString(route.params.id);

    if (!id) {
        return;
    }

    isSubmitting.value = true;

    try {
        const url = resolveBffEndpoint(
            `/api/instructors/${encodeURIComponent(id)}`,
        );

        const raw = await $fetch<unknown>(url, {
            method: 'PATCH',
            body: patch,
            credentials: 'include',
        });

        const updated = unwrapApiSuccessData<unknown>(raw);
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

    const id = getRouteIdString(route.params.id);

    if (!id) {
        return;
    }

    isDeleting.value = true;

    try {
        const raw = await $fetch<unknown>(
            resolveBffEndpoint(`/api/instructors/${encodeURIComponent(id)}`),
            {
                method: 'DELETE',
                credentials: 'include',
            },
        );

        assertBooleanSuccessEnvelope(raw);

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
</script>

<template>
    <div class="space-y-6">
        <LoadingState
            v-if="isLoading"
            title="Wczytywanie instruktora"
            description="Pobieram profil, kwalifikacje i powiazane dane."
        />

        <ErrorState
            v-else-if="errorMessage"
            title="Nie udalo sie wczytac instruktora"
            :description="errorMessage"
            @retry="loadInstructor(route.params.id)"
        />

        <ManagerInstructorDetailsContent
            v-else-if="instructor !== null && editForm !== null"
            :instructor="instructor"
            :rating-summary="ratingSummary"
            :is-rating-summary-loading="isRatingSummaryLoading"
            :is-submitting="isSubmitting"
            :is-deleting="isDeleting"
            :subpage-query="instructorSubpageQuery"
            @edit="handleEnterEdit"
            @delete="handleOpenDeleteDialog"
        />
        <ManagerInstructorEditDialog
            v-if="editForm !== null"
            v-model:open="isEditDialogOpen"
            v-model:form="editForm"
            :is-submitting="isSubmitting || isDeleting"
            :submit-error="submitError"
            :course-types="courseTypes"
            :selected-qualified-course-types="
                instructor !== null ? instructor.qualifiedCourseTypes : []
            "
            :is-course-types-loading="isCourseTypesLoading"
            :course-types-error="courseTypesError"
            @submit="handleSubmitEdit"
        />

        <ManagerInstructorDeleteDialog
            :open="isDeleteDialogOpen"
            :instructor-display-name="
                instructor !== null ? displayText(instructor.name) : ''
            "
            @update:open="handleDeleteDialogOpenChange"
            @cancel="handleDeleteDialogCancel"
            @confirm="handleDeleteDialogConfirm"
        />
    </div>
</template>
