<script setup lang="ts">
import {
    CalendarCheck,
    CalendarDays,
    Clock3,
    GraduationCap,
} from 'lucide-vue-next';
import type { CurrentUserCourseItem } from '~/types/courses/course';

defineProps<{
    selectedCourse: CurrentUserCourseItem | null;
    selectedCourseTypeLabel: string;
    selectedCourseProgressLabel: string;
    weekLabel: string;
    availableSlotsLabel: string;
    successMessage: string | null;
}>();
</script>

<template>
    <UiCard class="self-start overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5 pt-0">
            <UiCardTitle class="text-xl font-extrabold">
                Wybrany kurs
            </UiCardTitle>
            <UiCardDescription>
                Kontekst rezerwacji przed wyborem slotu.
            </UiCardDescription>
        </UiCardHeader>

        <UiCardContent class="space-y-3 px-4 py-0">
            <div class="border-border rounded-xl border p-4">
                <div class="flex items-start gap-3">
                    <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"
                    >
                        <GraduationCap class="size-5" aria-hidden="true" />
                    </div>
                    <div class="min-w-0">
                        <p class="truncate font-extrabold">
                            {{ selectedCourse?.name ?? 'Nie wybrano kursu' }}
                        </p>
                        <p class="text-muted-foreground text-sm">
                            {{ selectedCourseTypeLabel }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="border-border rounded-xl border p-4">
                <div class="flex items-start gap-3">
                    <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                    >
                        <Clock3 class="size-5" aria-hidden="true" />
                    </div>
                    <div>
                        <p class="font-extrabold">Saldo godzin</p>
                        <p class="text-muted-foreground text-sm">
                            {{ selectedCourseProgressLabel }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="border-border rounded-xl border p-4">
                <div class="flex items-start gap-3">
                    <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600"
                    >
                        <CalendarDays class="size-5" aria-hidden="true" />
                    </div>
                    <div>
                        <p class="font-extrabold">TydzieĹ„</p>
                        <p class="text-muted-foreground text-sm">
                            {{ weekLabel }}
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-sky-950"
            >
                <p class="font-extrabold">
                    {{ availableSlotsLabel }}
                </p>
                <p class="text-sm text-sky-700">
                    Rezerwacja dziaĹ‚a bezpoĹ›rednio na wybranym slocie.
                </p>
            </div>

            <div
                v-if="successMessage"
                class="border-border bg-muted/40 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                role="status"
            >
                <div class="flex min-w-0 items-center gap-3">
                    <span
                        class="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                        aria-hidden="true"
                    >
                        <CalendarCheck class="size-4" />
                    </span>
                    <p class="text-foreground text-sm font-medium">
                        {{ successMessage }}
                    </p>
                </div>
                <UiButton as-child size="sm" variant="outline">
                    <NuxtLink to="/my-lessons">Moje lekcje</NuxtLink>
                </UiButton>
            </div>
        </UiCardContent>
    </UiCard>
</template>
