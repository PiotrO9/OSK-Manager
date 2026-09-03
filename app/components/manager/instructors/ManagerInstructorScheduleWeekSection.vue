<script setup lang="ts">
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { formatManagerInstructorScheduleWeekLabel } from '~/utils/instructors/managerInstructorSchedulePage';

defineProps<{
    weekStart: Date;
    scheduleWeekLabel: string;
    scheduleResultLabel: string;
    isScheduleLoading: boolean;
    scheduleError: string | null;
    items: ScheduleLessonItem[];
    schoolId: string;
}>();

const emit = defineEmits<{
    prevWeek: [];
    nextWeek: [];
    refresh: [];
    requestDelete: [item: ScheduleLessonItem];
    statusChanged: [payload: { id: string; status: string }];
}>();
</script>

<template>
    <section
        class="border-border bg-card overflow-hidden rounded-xl border shadow-xs"
        aria-labelledby="schedule-week-heading"
    >
        <div
            class="border-border flex flex-col gap-4 border-b p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
        >
            <div class="flex min-w-0 gap-3">
                <div
                    class="bg-primary-50 text-primary-600 flex size-10 shrink-0 items-center justify-center rounded-xl"
                    aria-hidden="true"
                >
                    <CalendarDays class="size-5" />
                </div>
                <div class="min-w-0">
                    <h2
                        id="schedule-week-heading"
                        class="text-foreground text-lg font-semibold"
                    >
                        Terminarz
                    </h2>
                    <p
                        class="text-muted-foreground mt-1 text-sm leading-relaxed"
                    >
                        Tydzien od
                        {{
                            formatManagerInstructorScheduleWeekLabel(weekStart)
                        }}.
                    </p>
                </div>
            </div>

            <ActionGroup
                label="Nawigacja tygodnia"
                align="end"
                density="compact"
            >
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="gap-2"
                    aria-label="Poprzedni tydzien"
                    @click="emit('prevWeek')"
                >
                    <ArrowLeft class="size-4" aria-hidden="true" />
                    Poprzedni
                </UiButton>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="gap-2"
                    aria-label="Nastepny tydzien"
                    @click="emit('nextWeek')"
                >
                    Nastepny
                    <ArrowRight class="size-4" aria-hidden="true" />
                </UiButton>
            </ActionGroup>
        </div>

        <div class="space-y-4 p-4 sm:p-5">
            <FilterBar
                title="Filtry zapytania API"
                :result-label="scheduleResultLabel"
                :is-loading="isScheduleLoading"
            >
                <StatusBadge label="Instruktor" tone="info" subtle />
                <StatusBadge :label="scheduleWeekLabel" tone="neutral" subtle />
                <StatusBadge label="Sortuj: godzina" tone="neutral" subtle />
                <template #actions>
                    <UiButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="emit('refresh')"
                    >
                        Odswiez
                    </UiButton>
                </template>
            </FilterBar>

            <LoadingState
                v-if="isScheduleLoading"
                title="Wczytywanie terminarza"
                description="Pobieram lekcje i bloki z wybranego tygodnia."
            />
            <ErrorState
                v-else-if="scheduleError"
                title="Nie udało się wczytać terminarza"
                :description="scheduleError"
                @retry="emit('refresh')"
            />
            <ManagerScheduleLessonTable
                v-else
                :items="items"
                event-edit-enabled
                event-delete-enabled
                event-status-change-enabled
                :school-id="schoolId"
                @request-delete="emit('requestDelete', $event)"
                @status-changed="emit('statusChanged', $event)"
            />
        </div>
    </section>
</template>
