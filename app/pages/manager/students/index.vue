<script setup lang="ts">
import { Users } from 'lucide-vue-next';
import type { StudentRegisterPayload } from '~/components/manager/students/ManagerStudentFormDialog.vue';
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
    title: () => 'Kursanci',
    description: () => 'Tworzenie kont kursantów w szkołach jazdy.',
});

const route = useRoute();
const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
const { addToast } = useAppToast();

const REGISTER_GENERIC_FALLBACK = 'Nie udało się utworzyć konta kursanta.';

function resolveStudentRegisterError(err: unknown): string {
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
        schools.value = await fetchSchoolsList();
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

async function handleStudentSubmit(payload: StudentRegisterPayload) {
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
                    role: 'STUDENT',
                    email: payload.email,
                    password: payload.password,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    schoolId: payload.schoolId,
                },
            },
        );

        unwrapApiSuccessData(raw);

        addToast({
            title: 'Kursant został utworzony',
            variant: 'success',
        });

        formDialogOpen.value = false;

        await navigateTo('/manager/students', { replace: true });
    } catch (err) {
        const message = resolveStudentRegisterError(err);

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
                Kursanci
            </h1>
            <p class="text-muted-foreground text-sm">
                Twórz konta kursantów przypisane do wybranej OSK. Lista
                kursantów w panelu pojawi się po udostępnieniu odpowiedniego
                API. Formularz można otworzyć z parametru
                <span class="font-mono">?schoolId=</span>.
            </p>
        </div>

        <UiButton
            type="button"
            class="inline-flex items-center gap-2"
            aria-label="Otwórz formularz dodawania kursanta"
            @click="handleOpenCreateDialog"
        >
            <Users class="size-4 shrink-0" aria-hidden="true" />
            Dodaj kursanta
        </UiButton>

        <div
            class="border-border rounded-lg border p-4 md:p-6"
            :aria-busy="isSchoolsLoading"
        >
            <p
                v-if="isSchoolsLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie listy szkół jazdy…
            </p>

            <template v-else>
                <p
                    v-if="schoolsLoadError"
                    class="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {{ schoolsLoadError }}
                </p>

                <p
                    v-else-if="schools.length === 0"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Nie masz jeszcze żadnej szkoły jazdy. Dodaj OSK w panelu
                    szkół, aby móc przypisać kursanta do szkoły.
                </p>

                <p
                    v-else
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    W formularzu „Dodaj kursanta” wybierz szkołę jazdy, do
                    której ma należeć nowe konto.
                </p>
            </template>
        </div>

        <ManagerStudentFormDialog
            :open="formDialogOpen"
            :schools="schools"
            :is-schools-loading="isSchoolsLoading"
            :schools-load-error="schoolsLoadError"
            :is-saving="isFormSaving"
            :api-error="apiError"
            :prefill-school-id="prefillSchoolId"
            @update:open="handleFormDialogOpenChange"
            @submit="handleStudentSubmit"
        />
    </div>
</template>
