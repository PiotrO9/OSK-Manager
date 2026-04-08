<script setup lang="ts">
import {
    normalizeInstructorDetail,
    normalizeInstructorDetailForEdit,
    type InstructorDetail,
    type InstructorEditFormModel,
} from '~/types/instructor';
import {
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
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);
const isEditDialogOpen = ref(false);

const route = useRoute();
const { addToast } = useAppToast();

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

watch(
    () => route.params.id,
    async (id) => {
        submitError.value = null;
        isEditDialogOpen.value = false;
        await loadInstructor(id);
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
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Szczegóły instruktora
            </h1>
            <p class="text-muted-foreground text-sm">
                Informacje o instruktorze.
            </p>
        </div>

        <p
            v-if="isLoading"
            class="text-muted-foreground text-sm"
            role="status"
            aria-live="polite"
        >
            Wczytywanie danych instruktora…
        </p>

        <p
            v-else-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ errorMessage }}
        </p>

        <div
            v-else-if="instructor !== null && editForm !== null"
            class="border-border bg-card max-w-2xl min-w-0 space-y-6 rounded-2xl border p-6 shadow-sm"
        >
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 space-y-1">
                    <h2
                        class="text-foreground text-lg font-semibold wrap-break-word"
                    >
                        {{ displayText(instructor.name) }}
                    </h2>
                    <p class="text-muted-foreground text-sm break-all">
                        {{ displayText(instructor.email) }}
                    </p>
                </div>
                <button
                    type="button"
                    class="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex shrink-0 rounded-md px-3 py-2 text-sm font-medium shadow-sm hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    aria-label="Edytuj dane instruktora"
                    @click="handleEnterEdit"
                >
                    Edytuj
                </button>
            </div>

            <dl
                class="border-border grid gap-4 border-t pt-6 sm:grid-cols-2"
                aria-label="Dane instruktora"
            >
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Numer licencji
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayText(instructor.licenseNumber) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Numer telefonu
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayText(instructor.phone) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Kwalifikacje
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayText(instructor.qualifications) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Doświadczenie
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayText(instructor.experience) }}
                    </dd>
                </div>
            </dl>
        </div>

        <ManagerInstructorEditDialog
            v-if="editForm !== null"
            v-model:open="isEditDialogOpen"
            v-model:form="editForm"
            :is-submitting="isSubmitting"
            :submit-error="submitError"
            @submit="handleSubmitEdit"
        />

        <NuxtLink
            to="/manager/instructors"
            class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Wróć do listy instruktorów"
        >
            Wróć do listy instruktorów
        </NuxtLink>
    </div>
</template>
