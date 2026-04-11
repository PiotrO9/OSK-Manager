<script setup lang="ts">
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
    title: () => 'Terminarz slotów',
    description: () =>
        'Tygodniowy widok dostępnych slotów czasowych instruktora.',
});
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Terminarz — wolne sloty
            </h1>
            <p class="text-muted-foreground text-sm">
                Widok tygodniowy dostępnych slotów (60 min). Nawiguj między
                tygodniami lub wybierz datę w kalendarzu.
            </p>
        </div>

        <ManagerInstructorWeeklyCalendar
            v-if="instructorId"
            :instructor-id="instructorId"
        />

        <p v-else class="text-destructive text-sm" role="alert">
            Nieprawidłowy identyfikator instruktora.
        </p>

        <NuxtLink
            :to="`/manager/instructors/${instructorId}`"
            class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Wróć do szczegółów instruktora"
        >
            Wróć do szczegółów instruktora
        </NuxtLink>
    </div>
</template>
