<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next';
import type { InstructorRegisterPayload } from '~/components/manager/instructors/ManagerInstructorFormDialog.vue';
import type { DrivingSchool } from '~/types/drivingSchool';
import {
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Instruktorzy',
    description: () => 'Zarządzanie kontami instruktorów w szkołach jazdy.',
});

const route = useRoute();
const { fetchList } = useDrivingSchoolsApi();
const { addToast } = useAppToast();

const REGISTER_GENERIC_FALLBACK = 'Nie udało się utworzyć konta instruktora.';

function resolveInstructorRegisterError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak uprawnień do tej operacji.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (status === 400 || status === 409) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane lub konflikt.');
    }

    return getApiFetchErrorMessage(err, REGISTER_GENERIC_FALLBACK);
}

const schools = ref<DrivingSchool[]>([]);
const schoolsLoadError = ref<string | null>(null);
const isSchoolsLoading = ref(false);

const formDialogOpen = ref(false);
const isFormSaving = ref(false);
const apiError = ref<string | null>(null);

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

const prefillSchoolId = computed((): string | null => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    if (!isUuid(t)) return null;

    return t;
});

async function loadSchools() {
    schoolsLoadError.value = null;
    isSchoolsLoading.value = true;

    try {
        schools.value = await fetchList();
    } catch (e) {
        schoolsLoadError.value =
            e instanceof Error ? e.message : 'Nie udało się pobrać listy OSK.';
    } finally {
        isSchoolsLoading.value = false;
    }
}

onMounted(async () => {
    await loadSchools();

    if (prefillSchoolId.value) {
        apiError.value = null;
        formDialogOpen.value = true;
    }
});

function handleOpenCreateDialog() {
    apiError.value = null;
    formDialogOpen.value = true;

    if (schools.value.length === 0 && !isSchoolsLoading.value) {
        loadSchools();
    }
}

function handleFormDialogOpenChange(open: boolean) {
    formDialogOpen.value = open;

    if (!open) {
        apiError.value = null;
    }
}

async function handleInstructorSubmit(payload: InstructorRegisterPayload) {
    if (isFormSaving.value) return;

    apiError.value = null;
    isFormSaving.value = true;

    try {
        const raw = await $fetch<unknown>(
            resolveBffEndpoint('/api/auth/register'),
            {
                method: 'POST',
                credentials: 'include',
                body: {
                    role: 'INSTRUCTOR',
                    email: payload.email,
                    password: payload.password,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    licenseNumber: payload.licenseNumber,
                    schoolId: payload.schoolId,
                },
            },
        );

        unwrapApiSuccessData(raw);

        addToast({
            title: 'Instruktor został utworzony',
            variant: 'success',
        });

        formDialogOpen.value = false;

        await navigateTo('/manager/instructors', { replace: true });
    } catch (err) {
        const message = resolveInstructorRegisterError(err);

        apiError.value = message;

        addToast({
            title: 'Nie udało się utworzyć konta',
            description: message,
            variant: 'error',
        });
    } finally {
        isFormSaving.value = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Instruktorzy
            </h1>
            <p class="text-muted-foreground text-sm">
                Dodawaj konta instruktorów przypisane do wybranej OSK. Lista
                kont z backendu może być rozszerzona w kolejnych iteracjach.
            </p>
        </div>

        <UiButton
            type="button"
            class="inline-flex items-center gap-2"
            aria-label="Otwórz formularz dodawania instruktora"
            @click="handleOpenCreateDialog"
        >
            <GraduationCap class="size-4 shrink-0" aria-hidden="true" />
            Dodaj instruktora
        </UiButton>

        <p
            class="text-muted-foreground border-border rounded-lg border border-dashed p-6 text-sm"
            role="status"
        >
            Tutaj pojawi się lista instruktorów, gdy endpoint listy będzie
            dostępny w API. Dodawanie odbywa się w oknie po kliknięciu przycisku
            powyżej (stary adres
            <span class="font-mono">/manager/instructors/new</span>
            przekierowuje tutaj i może otworzyć formularz z
            <span class="font-mono">?schoolId=</span>).
        </p>

        <ManagerInstructorFormDialog
            :open="formDialogOpen"
            :schools="schools"
            :is-schools-loading="isSchoolsLoading"
            :schools-load-error="schoolsLoadError"
            :is-saving="isFormSaving"
            :api-error="apiError"
            :prefill-school-id="prefillSchoolId"
            @update:open="handleFormDialogOpenChange"
            @submit="handleInstructorSubmit"
        />
    </div>
</template>
