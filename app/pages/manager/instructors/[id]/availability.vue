<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';
import { getMonday } from '~/utils/weeklyCalendarDates';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();

function getInstructorId(): string {
    const raw = route.params.id;

    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

const instructorId = computed(getInstructorId);

usePageMeta({
    title: () => 'Dostępność instruktora',
    description: () =>
        'Konfiguracja tygodniowego harmonogramu pracy instruktora.',
});

function formatCurrentWeekLabel(): string {
    const monday = getMonday(new Date());
    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    const monthLabel = new Intl.DateTimeFormat('pl-PL', {
        month: 'long',
    }).format(sunday);

    return `${monday.getDate()}-${sunday.getDate()} ${monthLabel}`;
}

const weekLabel = computed(formatCurrentWeekLabel);

const scheduleHref = computed(() => {
    const id = instructorId.value;

    return id ? `/manager/instructors/${id}/schedule` : '/manager/instructors';
});

const backHref = computed(() => {
    const id = instructorId.value;

    return id ? `/manager/instructors/${id}` : '/manager/instructors';
});
</script>

<template>
    <div class="space-y-5">
        <div
            class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >
            <div class="space-y-1.5">
                <h1
                    class="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-3xl"
                >
                    Dostępność instruktora
                </h1>
                <p class="text-muted-foreground text-sm">
                    Tygodniowe godziny pracy i podgląd osi dnia.
                </p>
            </div>

            <div class="flex flex-wrap gap-2">
                <UiButton
                    type="button"
                    variant="outline"
                    class="bg-card h-10 rounded-xl px-4 font-semibold shadow-xs"
                    aria-label="Aktualny tydzień dostępności"
                >
                    <CalendarDays class="size-4" aria-hidden="true" />
                    {{ weekLabel }}
                </UiButton>

                <UiButton as-child class="h-10 rounded-xl px-4 shadow-lg">
                    <NuxtLink
                        :to="scheduleHref"
                        aria-label="Przejdź do dodawania jazdy lub bloku czasu"
                    >
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj jazdę
                    </NuxtLink>
                </UiButton>
            </div>
        </div>

        <template v-if="instructorId">
            <div class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <section
                    class="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
                    aria-labelledby="availability-editor-heading"
                >
                    <div class="border-border border-b px-4 py-4 md:px-5">
                        <h2
                            id="availability-editor-heading"
                            class="text-foreground text-lg font-bold tracking-tight"
                        >
                            Godziny dostępności
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            MVP: jeden przedział godzin na dzień.
                        </p>
                    </div>

                    <ManagerInstructorAvailabilityEditor
                        :instructor-id="instructorId"
                    />
                </section>

                <section
                    class="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
                    aria-labelledby="availability-week-heading"
                >
                    <div class="border-border border-b px-4 py-4 md:px-5">
                        <h2
                            id="availability-week-heading"
                            class="text-foreground text-lg font-bold tracking-tight"
                        >
                            Podgląd tygodnia
                        </h2>
                        <p class="text-muted-foreground mt-1 text-sm">
                            Ten sam język wizualny co sloty dashboardu.
                        </p>
                    </div>

                    <ManagerInstructorWeeklyCalendar
                        :instructor-id="instructorId"
                        compact
                    />
                </section>
            </div>
        </template>

        <p v-else class="text-destructive text-sm" role="alert">
            Nieprawidłowy identyfikator instruktora.
        </p>

        <UiButton as-child variant="link" class="h-auto px-0">
            <NuxtLink
                :to="backHref"
                aria-label="Wróć do szczegółów instruktora"
            >
                Wróć do szczegółów instruktora
            </NuxtLink>
        </UiButton>
    </div>
</template>
