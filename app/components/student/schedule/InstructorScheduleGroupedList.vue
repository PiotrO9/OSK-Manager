<script setup lang="ts">
import { CalendarDays, CarFront } from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    INSTRUCTOR_EVENT_STATUS_LABELS,
    INSTRUCTOR_EVENT_STATUS_OPTIONS,
    normalizeInstructorEventStatus,
} from '~/utils/events/instructorEventStatusDisplay';
import {
    buildStudentScheduleDayGroups,
    displayStudentScheduleTimeRange,
    formatStudentScheduleTime,
    getStudentScheduleStatusLabel,
    getStudentScheduleStatusTone,
} from '~/utils/schedule/studentScheduleGroupedList';

const props = withDefaults(
    defineProps<{
        items: readonly ScheduleLessonItem[];
        isLoading?: boolean;
        errorMessage?: string | null;
        savingEventId?: string | null;
    }>(),
    { isLoading: false, errorMessage: null, savingEventId: null },
);

const emit = defineEmits<{
    'event-status-change': [payload: { id: string; status: string }];
}>();

const groups = computed(() => buildStudentScheduleDayGroups(props.items));
</script>

<template>
    <div class="space-y-4">
        <LoadingState v-if="isLoading" title="Wczytywanie lekcji..." />
        <ErrorState v-else-if="errorMessage" :description="errorMessage" />
        <EmptyState
            v-else-if="groups.length === 0"
            title="Brak lekcji"
            description="Brak zaplanowanych lekcji i wydarzeń w tym tygodniu."
        />

        <section
            v-for="group in groups"
            v-else
            :key="group.date"
            class="space-y-2"
            :aria-label="`Harmonogram na ${group.label}`"
        >
            <h3
                class="text-muted-foreground px-1 text-xs font-semibold uppercase"
            >
                {{ group.label }}
            </h3>
            <ul class="space-y-2">
                <li
                    v-for="item in group.items"
                    :key="item.id"
                    class="border-border bg-background flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="flex min-w-0 items-start gap-3">
                        <span
                            class="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md"
                            aria-hidden="true"
                        >
                            <CalendarDays
                                v-if="item.kind === 'instructor_event'"
                                class="size-4"
                            />
                            <CarFront v-else class="size-4" />
                        </span>
                        <div class="min-w-0">
                            <p class="text-foreground text-sm font-semibold">
                                {{
                                    formatStudentScheduleTime(item.startTime)
                                }}–{{ formatStudentScheduleTime(item.endTime) }}
                                <span v-if="item.kind === 'instructor_event'">
                                    · Wydarzenie</span
                                >
                                <span v-else-if="item.student">
                                    · {{ item.student.firstName }}
                                    {{ item.student.lastName }}</span
                                >
                                <span v-else> · Jazda</span>
                            </p>
                            <p
                                class="text-muted-foreground mt-1 text-xs tabular-nums"
                            >
                                {{ displayStudentScheduleTimeRange(item) }}
                                <span v-if="item.participantCount != null">
                                    ·
                                    {{ item.participantCount }}
                                    uczestników</span
                                >
                            </p>
                        </div>
                    </div>

                    <div class="flex shrink-0 items-center gap-2">
                        <template v-if="item.kind === 'instructor_event'">
                            <UiSelect
                                :model-value="
                                    normalizeInstructorEventStatus(item.status)
                                "
                                :disabled="savingEventId === item.id"
                                :aria-label="`Zmień status wydarzenia ${displayStudentScheduleTimeRange(item)}`"
                                @update:model-value="
                                    (status) =>
                                        emit('event-status-change', {
                                            id: item.id,
                                            status: String(status),
                                        })
                                "
                            >
                                <UiSelectTrigger
                                    class="h-9 min-w-36"
                                    @click.stop
                                >
                                    <UiSelectValue />
                                </UiSelectTrigger>
                                <UiSelectContent>
                                    <UiSelectItem
                                        v-for="status in INSTRUCTOR_EVENT_STATUS_OPTIONS"
                                        :key="status"
                                        :value="status"
                                    >
                                        {{
                                            INSTRUCTOR_EVENT_STATUS_LABELS[
                                                status
                                            ]
                                        }}
                                    </UiSelectItem>
                                </UiSelectContent>
                            </UiSelect>
                            <span
                                v-if="savingEventId === item.id"
                                class="text-muted-foreground text-xs"
                                role="status"
                                >Zapisywanie…</span
                            >
                        </template>
                        <StatusBadge
                            v-else
                            :label="getStudentScheduleStatusLabel(item.status)"
                            :tone="getStudentScheduleStatusTone(item.status)"
                            subtle
                        />
                    </div>
                </li>
            </ul>
        </section>
    </div>
</template>
