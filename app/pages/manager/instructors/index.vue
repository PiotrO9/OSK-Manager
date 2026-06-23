<script setup lang="ts">
import { Mail, Plus } from 'lucide-vue-next';
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

const activeSchool = computed(
    () =>
        schools.value.find((school) => school.id === activeSchoolId.value) ??
        null,
);

const instructorsWithQualificationsCount = computed(
    () =>
        instructors.value.filter(
            (instructor) => (instructor.qualifiedCourseTypes ?? []).length > 0,
        ).length,
);

const uniqueQualificationCodesCount = computed(() => {
    const codes = new Set<string>();

    for (const instructor of instructors.value) {
        for (const courseType of instructor.qualifiedCourseTypes ?? []) {
            const code = courseType.code.trim();

            if (code.length > 0) {
                codes.add(code);
            }
        }
    }

    return codes.size;
});

const visibleInstructorsLabel = computed(() => {
    const count = instructors.value.length;

    if (count === 1) {
        return '1 wynik';
    }

    if (count >= 2 && count <= 4) {
        return `${count} wyniki`;
    }

    return `${count} wyników`;
});

const qualificationFilterLabel = computed(() => {
    if (uniqueQualificationCodesCount.value === 0) {
        return 'Kwalifikacje: brak danych';
    }

    return 'Kwalifikacje: wszystkie';
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

function instructorDetailsTo(instructor: InstructorListItem) {
    return {
        path: `/manager/instructors/${instructor.id}`,
        query:
            activeSchoolId.value.trim().length > 0
                ? {
                      schoolId: activeSchoolId.value.trim(),
                  }
                : {},
    };
}

function instructorQualificationLabel(instructor: InstructorListItem): string {
    const labels = (instructor.qualifiedCourseTypes ?? [])
        .map((courseType) => courseType.code.trim() || courseType.name.trim())
        .filter((label) => label.length > 0);

    if (labels.length === 0) {
        return 'Brak kwalifikacji';
    }

    return labels.join(', ');
}

function instructorInitials(instructor: InstructorListItem): string {
    const first = instructor.firstName.trim().charAt(0);
    const last = instructor.lastName.trim().charAt(0);
    const initials = `${first}${last}`.trim();

    return initials.length > 0 ? initials.toUpperCase() : 'IN';
}

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
    <div class="space-y-5">
        <PageHeader
            title="Instruktorzy"
            description="Zespół szkoleniowy, kwalifikacje i przypisanie do OSK."
        >
            <template #actions>
                <UiButton
                    type="button"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                    aria-label="Otwórz formularz dodawania instruktora"
                    @click="handleOpenCreateDialog"
                >
                    <Plus class="mr-2 size-4" aria-hidden="true" />
                    Dodaj instruktora
                </UiButton>
            </template>
        </PageHeader>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Instruktorzy
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ instructors.length }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">OSK</p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ activeSchool ? '1' : '0' }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Z kwalifikacjami
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ instructorsWithQualificationsCount }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Kategorie
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ uniqueQualificationCodesCount }}
                </p>
            </div>
        </div>

        <UiCard class="overflow-hidden rounded-2xl shadow-sm">
            <UiCardHeader class="border-border border-b p-5">
                <div
                    class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
                >
                    <div class="space-y-1">
                        <UiCardTitle class="text-xl font-extrabold">
                            Lista instruktorów
                        </UiCardTitle>
                        <UiCardDescription>
                            {{ visibleInstructorsLabel }}
                            <span v-if="activeSchool">
                                · {{ activeSchool.name }}
                            </span>
                        </UiCardDescription>
                    </div>

                    <UiBadge
                        v-if="activeSchool"
                        variant="outline"
                        class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                    >
                        {{ activeSchool.name }}
                    </UiBadge>
                </div>
            </UiCardHeader>

            <UiCardContent
                class="space-y-4 px-4 py-4"
                :aria-busy="isSchoolsLoading || isInstructorsLoading"
            >
                <div
                    class="border-border bg-card flex min-w-0 flex-col gap-3 rounded-2xl border px-4 py-3 shadow-xs md:flex-row md:items-center md:justify-between"
                >
                    <div
                        class="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                    >
                        <p class="text-foreground text-sm font-semibold">
                            Filtry
                        </p>

                        <div v-if="schools.length > 1" class="min-w-52">
                            <UiSelect
                                v-model="activeSchoolId"
                                :disabled="isInstructorsLoading"
                                @update:model-value="handleActiveSchoolChange"
                            >
                                <UiSelectTrigger
                                    id="instructors-page-school"
                                    class="h-8 rounded-full border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700"
                                    aria-label="Wybierz szkołę jazdy do podglądu listy instruktorów"
                                >
                                    <UiSelectValue placeholder="Wybierz OSK" />
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

                        <UiBadge
                            v-else-if="activeSchool"
                            variant="outline"
                            class="rounded-full border-sky-200 bg-sky-50 text-sky-700"
                        >
                            {{ activeSchool.name }}
                        </UiBadge>

                        <UiBadge
                            variant="outline"
                            class="bg-muted/40 rounded-full"
                        >
                            {{ qualificationFilterLabel }}
                        </UiBadge>
                    </div>

                    <p
                        class="text-muted-foreground text-xs font-semibold whitespace-nowrap"
                    >
                        {{ visibleInstructorsLabel }}
                    </p>
                </div>

                <div v-if="isSchoolsLoading" class="space-y-3" role="status">
                    <UiSkeleton class="h-16 rounded-xl" />
                    <UiSkeleton class="h-16 rounded-xl" />
                    <UiSkeleton class="h-16 rounded-xl" />
                </div>

                <ErrorState
                    v-else-if="schoolsLoadError"
                    title="Nie udało się wczytać szkół jazdy"
                    :description="schoolsLoadError"
                    @retry="loadSchools"
                />

                <EmptyState
                    v-else-if="schools.length === 0"
                    title="Brak szkół jazdy"
                    description="Dodaj OSK w panelu szkół, aby wyświetlić listę instruktorów."
                />

                <ErrorState
                    v-else-if="instructorsLoadError"
                    title="Nie udało się wczytać instruktorów"
                    :description="instructorsLoadError"
                    @retry="loadInstructors"
                />

                <div
                    v-else-if="isInstructorsLoading"
                    class="space-y-3"
                    role="status"
                >
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                </div>

                <EmptyState
                    v-else-if="instructors.length === 0"
                    title="Brak instruktorów"
                    description="W wybranej szkole nie ma jeszcze instruktorów."
                />

                <template v-else>
                    <div
                        class="hidden overflow-hidden rounded-2xl border md:block"
                    >
                        <table class="w-full min-w-[760px] text-left text-sm">
                            <thead
                                class="bg-muted/50 text-muted-foreground border-b"
                            >
                                <tr>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Nazwa
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Kontakt
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Zakres
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Akcje
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-border divide-y">
                                <tr
                                    v-for="instructor in instructors"
                                    :key="instructor.id"
                                    class="hover:bg-muted/30"
                                >
                                    <td class="px-4 py-3">
                                        <div
                                            class="flex min-w-0 items-center gap-3"
                                        >
                                            <div
                                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700"
                                            >
                                                {{
                                                    instructorInitials(
                                                        instructor,
                                                    )
                                                }}
                                            </div>
                                            <div class="min-w-0">
                                                <p
                                                    class="truncate font-extrabold"
                                                >
                                                    {{
                                                        formatInstructorDisplayName(
                                                            instructor,
                                                        )
                                                    }}
                                                </p>
                                                <p
                                                    class="text-muted-foreground text-xs"
                                                >
                                                    {{
                                                        instructorQualificationLabel(
                                                            instructor,
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <p
                                            class="text-muted-foreground flex items-center gap-2 text-sm break-all"
                                        >
                                            <Mail
                                                class="size-3.5 shrink-0"
                                                aria-hidden="true"
                                            />
                                            {{ instructor.email || '—' }}
                                        </p>
                                    </td>
                                    <td class="px-4 py-3">
                                        <UiBadge
                                            variant="outline"
                                            class="bg-muted/40 rounded-full"
                                        >
                                            {{
                                                instructorQualificationLabel(
                                                    instructor,
                                                )
                                            }}
                                        </UiBadge>
                                    </td>
                                    <td class="px-4 py-3">
                                        <UiBadge
                                            variant="outline"
                                            class="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                                        >
                                            Konto
                                        </UiBadge>
                                    </td>
                                    <td class="px-4 py-3">
                                        <UiButton
                                            as-child
                                            variant="outline"
                                            size="sm"
                                            class="rounded-xl"
                                        >
                                            <NuxtLink
                                                :to="
                                                    instructorDetailsTo(
                                                        instructor,
                                                    )
                                                "
                                                :aria-label="`Otwórz szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                                            >
                                                Szczegóły
                                            </NuxtLink>
                                        </UiButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="space-y-3 md:hidden">
                        <article
                            v-for="instructor in instructors"
                            :key="instructor.id"
                            class="border-border rounded-2xl border p-4"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="truncate font-extrabold">
                                        {{
                                            formatInstructorDisplayName(
                                                instructor,
                                            )
                                        }}
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-1 text-sm break-all"
                                    >
                                        {{ instructor.email || '—' }}
                                    </p>
                                </div>
                                <div
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700"
                                >
                                    {{ instructorInitials(instructor) }}
                                </div>
                            </div>

                            <div class="mt-3 flex flex-wrap gap-2">
                                <UiBadge
                                    variant="outline"
                                    class="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                                >
                                    Konto
                                </UiBadge>
                                <UiBadge
                                    variant="outline"
                                    class="bg-muted/40 rounded-full"
                                >
                                    {{
                                        instructorQualificationLabel(instructor)
                                    }}
                                </UiBadge>
                            </div>

                            <div class="mt-4">
                                <UiButton
                                    as-child
                                    variant="outline"
                                    size="sm"
                                    class="w-full rounded-xl"
                                >
                                    <NuxtLink
                                        :to="instructorDetailsTo(instructor)"
                                        :aria-label="`Otwórz szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                                    >
                                        Szczegóły
                                    </NuxtLink>
                                </UiButton>
                            </div>
                        </article>
                    </div>
                </template>
            </UiCardContent>
        </UiCard>

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
