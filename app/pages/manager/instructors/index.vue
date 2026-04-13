<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next';
import type { InstructorRegisterPayload } from '~/components/manager/instructors/ManagerInstructorFormDialog.vue';
import type { DrivingSchool } from '~/types/drivingSchool';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructor';
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
const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
const { fetchList: fetchInstructorsList } = useInstructorsApi();
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

function resolveInstructorsListError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do listy instruktorów dla wybranej szkoły.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(
        err,
        'Nie udało się pobrać listy instruktorów.',
    );
}

const schools = ref<DrivingSchool[]>([]);
const schoolsLoadError = ref<string | null>(null);
const isSchoolsLoading = ref(false);

const activeSchoolId = ref('');
const instructors = ref<InstructorListItem[]>([]);
const isInstructorsLoading = ref(false);
const instructorsLoadError = ref<string | null>(null);

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

function resolveInitialActiveSchoolId(): string {
    const pre = prefillSchoolId.value;

    if (pre && schools.value.some((s) => s.id === pre)) {
        return pre;
    }

    return schools.value[0]?.id ?? '';
}

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

async function loadInstructors() {
    const sid = activeSchoolId.value.trim();

    if (!sid) {
        instructors.value = [];

        return;
    }

    instructorsLoadError.value = null;
    isInstructorsLoading.value = true;

    try {
        instructors.value = await fetchInstructorsList(sid);
    } catch (err) {
        instructors.value = [];
        instructorsLoadError.value = resolveInstructorsListError(err);
    } finally {
        isInstructorsLoading.value = false;
    }
}

async function handleActiveSchoolChange() {
    instructorsLoadError.value = null;
    await loadInstructors();
}

onMounted(async () => {
    await loadSchools();
    activeSchoolId.value = resolveInitialActiveSchoolId();

    if (prefillSchoolId.value) {
        apiError.value = null;
        formDialogOpen.value = true;
    }

    if (activeSchoolId.value) {
        await loadInstructors();
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

        const createdSchoolId = payload.schoolId;

        if (schools.value.some((s) => s.id === createdSchoolId)) {
            activeSchoolId.value = createdSchoolId;
        }

        if (activeSchoolId.value) {
            await loadInstructors();
        }

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
                Zarządzaj kontami instruktorów przypisanymi do wybranej OSK.
                Dodawanie odbywa się po kliknięciu przycisku poniżej; stary
                adres
                <span class="font-mono">/manager/instructors/new</span>
                przekierowuje tutaj i może otworzyć formularz z
                <span class="font-mono">?schoolId=</span>.
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
                    szkół, aby wyświetlić listę instruktorów.
                </p>

                <template v-else>
                    <div v-if="schools.length > 1" class="mb-4 space-y-2">
                        <UiLabel for="instructors-page-school"
                            >Szkoła jazdy (lista instruktorów)</UiLabel
                        >
                        <UiSelect
                            v-model="activeSchoolId"
                            :disabled="isInstructorsLoading"
                            @update:model-value="handleActiveSchoolChange"
                        >
                            <UiSelectTrigger
                                id="instructors-page-school"
                                class="w-full max-w-md"
                                aria-label="Wybierz szkołę jazdy do podglądu listy instruktorów"
                            >
                                <UiSelectValue placeholder="Wybierz szkołę" />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem
                                        v-for="s in schools"
                                        :key="s.id"
                                        :value="s.id"
                                    >
                                        {{ s.name
                                        }}{{
                                            s.city && s.city.length > 0
                                                ? ` (${s.city})`
                                                : ''
                                        }}
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                    </div>

                    <template v-if="instructorsLoadError">
                        <p
                            class="text-destructive text-sm"
                            role="alert"
                            aria-live="polite"
                        >
                            {{ instructorsLoadError }}
                        </p>
                    </template>
                    <template v-else-if="isInstructorsLoading">
                        <p class="text-muted-foreground text-sm" role="status">
                            Wczytywanie listy instruktorów…
                        </p>
                    </template>
                    <template v-else-if="instructors.length > 0">
                        <ul
                            class="divide-border divide-y rounded-md border"
                            role="list"
                        >
                            <li
                                v-for="instructor in instructors"
                                :key="instructor.id"
                                class="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                            >
                                <NuxtLink
                                    :to="{
                                        path: `/manager/instructors/${instructor.id}`,
                                        query:
                                            activeSchoolId.trim().length > 0
                                                ? {
                                                      schoolId:
                                                          activeSchoolId.trim(),
                                                  }
                                                : {},
                                    }"
                                    class="text-foreground focus-visible:ring-ring rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                                    :aria-label="`Szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                                >
                                    {{
                                        formatInstructorDisplayName(instructor)
                                    }}
                                </NuxtLink>
                                <span
                                    class="text-muted-foreground text-sm break-all"
                                >
                                    {{ instructor.email || '—' }}
                                </span>
                            </li>
                        </ul>
                    </template>
                    <template v-else>
                        <p class="text-muted-foreground text-sm" role="status">
                            Brak instruktorów
                        </p>
                    </template>
                </template>
            </template>
        </div>

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
