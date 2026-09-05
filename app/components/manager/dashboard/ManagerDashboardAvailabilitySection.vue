<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next';

defineProps<{
    schoolId: string;
}>();
</script>

<template>
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
                    <CalendarDays class="size-5" aria-hidden="true" />
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
                        Wolne sloty wszystkich instruktorów przypisanych do
                        szkoły (widok tygodniowy).
                    </p>
                </div>
            </div>
        </div>

        <ManagerSchoolWeeklyAvailabilityCalendar :school-id="schoolId" />
    </section>
</template>
