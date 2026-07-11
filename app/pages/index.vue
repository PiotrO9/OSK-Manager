<script setup lang="ts">
import { Building2, CalendarDays, MapPin, ExternalLink } from 'lucide-vue-next';
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
                    <div
                        class="border-border bg-card overflow-hidden rounded-2xl border p-4 shadow-sm md:p-5"
                        :aria-label="`Karta domyślnego OSK: ${defaultOsk.name}`"
                    >
                        <div
                            class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                        >
                            <div class="flex min-w-0 items-start gap-4">
                                <div
                                    class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-xl md:size-11"
                                >
                                    <Building2
                                        class="size-5"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div class="min-w-0 flex-1 space-y-1">
                                    <p
                                        class="text-foreground truncate text-lg font-semibold tracking-tight"
                                    >
                                        {{ defaultOsk.name }}
                                    </p>

                                    <p
                                        v-if="
                                            defaultOsk.city ||
                                            defaultOsk.address
                                        "
                                        class="text-muted-foreground flex items-center gap-1.5 text-sm"
                                    >
                                        <MapPin
                                            class="size-3.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        <span class="min-w-0 truncate">
                                            <span v-if="defaultOsk.city">{{
                                                defaultOsk.city
                                            }}</span>
                                            <span
                                                v-if="
                                                    defaultOsk.city &&
                                                    defaultOsk.address
                                                "
                                            >
                                                ·
                                            </span>
                                            <span v-if="defaultOsk.address">{{
                                                defaultOsk.address
                                            }}</span>
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <NuxtLink
                                to="/manager/osk"
                                class="border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-primary inline-flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-transparent"
                                aria-label="Przejdź do listy szkół jazdy"
                            >
                                <ExternalLink
                                    class="size-4"
                                    aria-hidden="true"
                                />
                            </NuxtLink>
                        </div>
                    </div>

                    <ManagerAttentionItemsPanel
                        :items="attentionItems.items"
                        :hidden-count="attentionItems.hiddenCount"
                        :is-loading="isAttentionLoading"
                        :error="attentionError"
                        @retry="loadAttentionItems(defaultOsk.id)"
                    />

                    <section
                        class="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
                        aria-labelledby="dashboard-school-availability-heading"
                    >
                        <div
                            class="border-border flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between md:p-5"
                        >
                            <div class="flex min-w-0 items-start gap-3">
                                <div
                                    class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-xl"
                                >
                                    <CalendarDays
                                        class="size-5"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div class="min-w-0 space-y-1">
                                    <h2
                                        id="dashboard-school-availability-heading"
                                        class="text-foreground text-xl leading-tight font-semibold tracking-tight"
                                    >
                                        Dostępność instruktorów
                                    </h2>
                                    <p
                                        class="text-muted-foreground max-w-2xl text-sm leading-relaxed"
                                    >
                                        Wolne sloty wszystkich instruktorów
                                        przypisanych do szkoły (widok
                                        tygodniowy).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ManagerSchoolWeeklyAvailabilityCalendar
                            :school-id="defaultOsk.id"
                        />
                    </section>
                </div>
            </template>
        </template>

        <template v-else-if="isInstructorOrStudent">
            <div class="space-y-4">
                <h2
                    class="text-foreground text-lg font-semibold tracking-tight"
                >
                    {{
                        sessionDrivingSchools.length <= 1
                            ? 'Twoja szkoła jazdy'
                            : 'Twoje szkoły jazdy'
                    }}
                </h2>

                <p
                    v-if="sessionDrivingSchools.length === 0"
                    class="text-muted-foreground max-w-2xl text-sm leading-relaxed"
                    role="status"
                >
                    Nie masz jeszcze przypisanej szkoły jazdy. Gdy administrator
                    doda Cię do szkoły, zobaczysz ją tutaj.
                </p>

                <div v-else class="space-y-4">
                    <div
                        v-for="school in sessionDrivingSchools"
                        :key="school.id"
                        class="border-border bg-card rounded-2xl border p-5 shadow-sm"
                        :aria-label="`Szkoła jazdy: ${school.name}`"
                    >
                        <div class="flex items-start gap-4">
                            <div
                                class="bg-primary-50 text-primary-600 flex size-11 shrink-0 items-center justify-center rounded-xl"
                            >
                                <Building2 class="size-5" aria-hidden="true" />
                            </div>

                            <div class="min-w-0 flex-1 space-y-1">
                                <p
                                    class="text-foreground truncate text-lg font-semibold"
                                >
                                    {{ school.name }}
                                </p>

                                <p
                                    v-if="school.city || school.address"
                                    class="text-muted-foreground flex items-center gap-1.5 text-sm"
                                >
                                    <MapPin
                                        class="size-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span class="min-w-0 truncate">
                                        <span v-if="school.city">{{
                                            school.city
                                        }}</span>
                                        <span
                                            v-if="school.city && school.address"
                                        >
                                            ·
                                        </span>
                                        <span v-if="school.address">{{
                                            school.address
                                        }}</span>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <p class="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Szkielet aplikacji z lewym panelem nawigacji. Treść modułów i
                statystyki możesz dodać tutaj później.
            </p>
        </template>
    </div>
</template>
