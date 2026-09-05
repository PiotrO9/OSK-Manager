<script setup lang="ts">
import type { ManagerAttentionPayload } from '~/types/manager/attentionItem';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Pulpit',
    description: () => 'Panel zarządzania OSK.',
});

const { session } = useAuthSession();
const { fetchDefaultDrivingSchool, isDefaultLoading } = useDrivingSchoolsApi();
const { fetchAttentionItems, isLoading: isAttentionLoading } =
    useManagerAttentionItemsApi();

const isManager = computed(() => session.value?.role === 'MANAGER');

const isInstructorOrStudent = computed(() => {
    const r = session.value?.role?.trim().toUpperCase();

    return r === 'INSTRUCTOR' || r === 'STUDENT';
});

const sessionDrivingSchools = computed(
    () => session.value?.drivingSchools ?? [],
);

const defaultOsk = ref<DrivingSchool | null>(null);
const defaultOskError = ref<string | null>(null);
const attentionItems = ref<ManagerAttentionPayload>({
    items: [],
    total: 0,
    hiddenCount: 0,
});
const attentionError = shallowRef<string | null>(null);

async function loadAttentionItems(schoolId: string) {
    attentionError.value = null;

    try {
        attentionItems.value = await fetchAttentionItems(schoolId);
    } catch (err) {
        attentionError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się pobrać spraw do obsługi.';
    }
}

async function loadDefaultOsk() {
    if (!isManager.value) return;

    defaultOskError.value = null;

    const result = await fetchDefaultDrivingSchool();

    if (result.outcome === 'empty_response') {
        defaultOskError.value = 'Nie udało się pobrać domyślnego OSK.';

        return;
    }

    if (result.outcome === 'not_configured') {
        await navigateTo('/manager/osk');

        return;
    }

    if (result.outcome === 'unreadable') {
        defaultOskError.value = 'Nie udało się wczytać danych OSK.';

        return;
    }

    defaultOsk.value = result.school;
    await loadAttentionItems(result.school.id);
}

onMounted(() => {
    loadDefaultOsk();
});
</script>

<template>
    <div class="space-y-5 md:space-y-6">
        <div
            class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
            <div class="space-y-1.5">
                <h1
                    class="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-3xl"
                >
                    Witaj{{ session?.userName ? `, ${session.userName}` : '' }}
                </h1>
                <p class="text-muted-foreground text-sm leading-relaxed">
                    {{
                        isManager
                            ? 'Twój panel zarządzania szkołą jazdy.'
                            : isInstructorOrStudent
                              ? 'Twój panel w szkole jazdy.'
                              : 'Panel aplikacji.'
                    }}
                </p>
            </div>
        </div>

        <template v-if="isManager">
            <div
                v-if="isDefaultLoading"
                class="border-border bg-card text-muted-foreground rounded-2xl border p-5 text-sm shadow-sm"
                role="status"
            >
                Wczytywanie danych OSK…
            </div>

            <p
                v-else-if="defaultOskError"
                class="border-destructive/30 bg-destructive/5 text-destructive rounded-2xl border p-5 text-sm"
                role="alert"
            >
                {{ defaultOskError }}
            </p>

            <template v-else-if="defaultOsk">
                <div class="space-y-4 md:space-y-5">
                    <ManagerDefaultSchoolCard :school="defaultOsk" />

                    <ManagerAttentionItemsPanel
                        :items="attentionItems.items"
                        :hidden-count="attentionItems.hiddenCount"
                        :is-loading="isAttentionLoading"
                        :error="attentionError"
                        @retry="loadAttentionItems(defaultOsk.id)"
                    />

                    <ManagerDashboardAvailabilitySection
                        :school-id="defaultOsk.id"
                    />
                </div>
            </template>
        </template>

        <template v-else-if="isInstructorOrStudent">
            <UserDrivingSchoolsSection :schools="sessionDrivingSchools" />
        </template>

        <template v-else>
            <p class="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Szkielet aplikacji z lewym panelem nawigacji. Treść modułów i
                statystyki możesz dodać tutaj później.
            </p>
        </template>
    </div>
</template>
