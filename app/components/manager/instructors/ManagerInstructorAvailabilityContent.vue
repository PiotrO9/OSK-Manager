<script setup lang="ts">
import { CalendarDays, RotateCcw, Save, Workflow } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';

const props = defineProps<{
    instructorId: string;
    backTo: RouteLocationRaw;
    scheduleTo: RouteLocationRaw;
}>();

type AvailabilityMobileView = 'editor' | 'calendar';

const {
    rows,
    loadError,
    formError,
    isLoading,
    isSaving,
    calendarRefreshKey,
    dirtyDayCount,
    activeDayCount,
    totalDurationLabel,
    hasDirtyChanges,
    canSave,
    getRowError,
    loadAvailability,
    resetDraft,
    saveChanges,
    updateDayEnabled,
    updateStartTime,
    updateEndTime,
} = useManagerInstructorAvailabilityPage(() => props.instructorId);

const mobileView = shallowRef<AvailabilityMobileView>('editor');

const mobileViews: Array<{ value: AvailabilityMobileView; label: string }> = [
    { value: 'editor', label: 'Godziny pracy' },
    { value: 'calendar', label: 'Wolne terminy' },
];

function isMobileViewActive(value: AvailabilityMobileView): boolean {
    return mobileView.value === value;
}
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Dostępność instruktora"
            eyebrow="Instruktorzy"
            description="Tygodniowy wzorzec pracy i podgląd wolnych terminów generowanych z zapisanej dostępności."
        >
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="h-10 rounded-lg px-4 font-semibold shadow-xs"
                >
                    <NuxtLink
                        :to="props.scheduleTo"
                        aria-label="Przejdź do terminarza instruktora"
                    >
                        <CalendarDays class="mr-2 size-4" aria-hidden="true" />
                        Terminarz
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div
            class="border-border bg-card grid max-w-6xl gap-3 rounded-lg border p-3 shadow-xs xl:grid-cols-[minmax(0,1fr)_auto]"
        >
            <div class="grid gap-3 sm:grid-cols-3">
                <div class="border-border bg-background rounded-md border p-3">
                    <p class="text-muted-foreground text-xs font-medium">
                        Aktywne dni
                    </p>
                    <p class="text-foreground mt-1 text-xl font-bold">
                        {{ activeDayCount }}/7
                    </p>
                </div>
                <div class="border-border bg-background rounded-md border p-3">
                    <p class="text-muted-foreground text-xs font-medium">
                        Godziny tygodniowo
                    </p>
                    <p class="text-foreground mt-1 text-xl font-bold">
                        {{ totalDurationLabel }}
                    </p>
                </div>
                <div class="border-border bg-background rounded-md border p-3">
                    <p class="text-muted-foreground text-xs font-medium">
                        Niezapisane dni
                    </p>
                    <p class="text-foreground mt-1 text-xl font-bold">
                        {{ dirtyDayCount }}
                    </p>
                </div>
            </div>

            <div
                class="flex flex-wrap items-center gap-2 xl:justify-end"
                role="toolbar"
                aria-label="Akcje dostępności instruktora"
            >
                <UiButton
                    type="button"
                    variant="outline"
                    class="h-10 rounded-lg px-4 font-semibold"
                    :disabled="!hasDirtyChanges || isSaving"
                    @click="resetDraft"
                >
                    <RotateCcw class="mr-2 size-4" aria-hidden="true" />
                    Cofnij
                </UiButton>
                <UiButton
                    type="button"
                    class="h-10 rounded-lg px-4 font-semibold shadow-xs"
                    :disabled="!canSave"
                    :aria-busy="isSaving"
                    @click="saveChanges"
                >
                    <Save class="mr-2 size-4" aria-hidden="true" />
                    {{ isSaving ? 'Zapisywanie...' : 'Zapisz zmiany' }}
                </UiButton>
            </div>
        </div>

        <div
            class="border-border bg-muted/20 flex rounded-lg border p-1 md:hidden"
            role="tablist"
            aria-label="Widok dostępności na małym ekranie"
        >
            <button
                v-for="view in mobileViews"
                :key="view.value"
                type="button"
                class="focus-visible:ring-ring h-10 flex-1 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                :class="
                    isMobileViewActive(view.value)
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground'
                "
                role="tab"
                :aria-selected="isMobileViewActive(view.value)"
                @click="mobileView = view.value"
            >
                {{ view.label }}
            </button>
        </div>

        <div class="grid min-w-0 gap-5 2xl:grid-cols-[minmax(380px,460px)_1fr]">
            <section
                class="min-w-0"
                :class="mobileView === 'editor' ? 'block' : 'hidden md:block'"
                aria-labelledby="availability-editor-heading"
            >
                <div class="mb-3 flex min-w-0 items-start gap-3">
                    <div
                        class="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
                        aria-hidden="true"
                    >
                        <Workflow class="size-4" />
                    </div>
                    <div class="min-w-0">
                        <h2
                            id="availability-editor-heading"
                            class="text-foreground text-lg leading-6 font-bold"
                        >
                            Godziny pracy
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Jeden przedział na dzień. Zmiany trafiają do API po
                            wspólnym zapisie.
                        </p>
                    </div>
                </div>

                <ManagerInstructorAvailabilityEditor
                    :rows="rows"
                    :load-error="loadError"
                    :form-error="formError"
                    :is-loading="isLoading"
                    :is-saving="isSaving"
                    :get-row-error="getRowError"
                    @retry="loadAvailability"
                    @update-enabled="updateDayEnabled"
                    @update-start-time="updateStartTime"
                    @update-end-time="updateEndTime"
                />
            </section>

            <section
                class="min-w-0"
                :class="mobileView === 'calendar' ? 'block' : 'hidden md:block'"
                aria-labelledby="availability-calendar-heading"
            >
                <div
                    class="mb-3 flex min-w-0 items-start justify-between gap-3"
                >
                    <div class="min-w-0">
                        <h2
                            id="availability-calendar-heading"
                            class="text-foreground text-lg leading-6 font-bold"
                        >
                            Wolne terminy
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Podgląd zapisanej dostępności. Odświeża się po
                            udanym zapisie.
                        </p>
                    </div>
                    <StatusBadge
                        v-if="hasDirtyChanges"
                        label="Podgląd sprzed zapisu"
                        tone="warning"
                        subtle
                    />
                </div>

                <ManagerInstructorWeeklyCalendar
                    :instructor-id="props.instructorId"
                    :refresh-key="calendarRefreshKey"
                    compact
                    show-compact-header
                />
            </section>
        </div>

        <UiButton as-child variant="link" class="h-auto px-0">
            <NuxtLink
                :to="props.backTo"
                aria-label="Wróć do szczegółów instruktora"
            >
                Wróć do szczegółów instruktora
            </NuxtLink>
        </UiButton>
    </div>
</template>
