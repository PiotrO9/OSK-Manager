<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';
import EventsDayNavigation from '~/components/events/EventsDayNavigation.vue';
import EventsDayScheduleGrid from '~/components/events/EventsDayScheduleGrid.vue';
import EventsStatusFilter from '~/components/events/EventsStatusFilter.vue';
import EventsViewModeToggle from '~/components/events/EventsViewModeToggle.vue';
import type {
    EventsDayViewMode,
    InstructorScheduleColumn,
    InstructorScheduleRow,
} from '~/composables/events/useEventsDayPage';
import {
    EVENTS_DAY_STATUS_FILTER_OPTIONS,
    displayEventMeta,
    displayEventPrimary,
    eventTypeBadgeClasses,
    eventTypeLabel,
    eventsDayStatusCode,
    eventsDayStatusLabel,
    statusFilterLabelForOption,
    type EventsDayStatusFilterOption,
} from '~/utils/events/eventsDayPage';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { buildEventsDayEditRoute } from '~/utils/events/eventsDayNavigation';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import { instructorEventStatusBadgeVariant } from '~/utils/events/instructorEventStatusDisplay';

defineProps<{
    attentionEvents: ScheduleLessonItem[];
    effectiveViewMode: EventsDayViewMode;
    errorMessage: string | null;
    events: ScheduleLessonItem[];
    filteredEvents: ScheduleLessonItem[];
    isCompactViewport: boolean;
    isInstructorsLoading: boolean;
    isLoading: boolean;
    isManager: boolean;
    isSchoolLoading: boolean;
    schoolId: string;
    selectedDate: string;
    selectedDateLabel: string;
    managerScheduleColumns: InstructorScheduleColumn[];
    managerScheduleRows: InstructorScheduleRow[];
    selectedStatus: EventsDayStatusFilterOption;
    sortedFilteredEvents: ScheduleLessonItem[];
    visibleEventsLabel: string;
}>();

defineEmits<{
    previous: [];
    today: [];
    next: [];
    retry: [];
    selectStatus: [option: string];
    statusChanged: [payload: { id: string; status: string }];
}>();

const viewMode = defineModel<EventsDayViewMode>('viewMode', {
    required: true,
});
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader
            class="border-border flex flex-row items-start justify-between gap-4 border-b p-5 pt-0"
        >
            <div class="space-y-1">
                <UiCardTitle class="text-xl font-extrabold">
                    Plan dnia
                </UiCardTitle>
            </div>
            <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <EventsViewModeToggle
                    v-model="viewMode"
                    :disabled="!isManager || isCompactViewport"
                />

                <UiBadge
                    v-if="filteredEvents.length > 0"
                    variant="outline"
                    class="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                >
                    {{ visibleEventsLabel }}
                </UiBadge>
            </div>
        </UiCardHeader>

        <UiCardContent class="space-y-4 px-4 py-0">
            <EventsStatusFilter
                :options="EVENTS_DAY_STATUS_FILTER_OPTIONS"
                :selected="selectedStatus"
                :label-for-option="statusFilterLabelForOption"
                @select="$emit('selectStatus', $event)"
            />
            <EventsDayNavigation
                :selected-date-label="selectedDateLabel"
                :is-loading="isLoading"
                @previous="$emit('previous')"
                @today="$emit('today')"
                @next="$emit('next')"
            />
            <div
                v-if="isLoading || isSchoolLoading || isInstructorsLoading"
                class="space-y-3"
                role="status"
            >
                <UiSkeleton class="h-16 rounded-xl" />
                <UiSkeleton class="h-16 rounded-xl" />
                <UiSkeleton class="h-16 rounded-xl" />
            </div>

            <ErrorState
                v-else-if="errorMessage"
                title="Nie udało się wczytać wydarzeń"
                :description="errorMessage"
                @retry="$emit('retry')"
            />

            <EmptyState
                v-else-if="filteredEvents.length === 0"
                :title="
                    events.length === 0
                        ? 'Brak wydarzeń w wybranym dniu'
                        : 'Brak wydarzeń dla wybranego statusu'
                "
                :description="
                    events.length === 0
                        ? 'Zmień dzień lub wróć do dzisiejszego widoku.'
                        : 'Wybierz inny status, aby zobaczyć pozostałe wydarzenia.'
                "
            />

            <EventsDayScheduleGrid
                v-else-if="effectiveViewMode === 'grid'"
                :columns="managerScheduleColumns"
                :rows="managerScheduleRows"
                :school-id="schoolId"
                :selected-date="selectedDate"
                @status-changed="$emit('statusChanged', $event)"
            />

            <div v-else class="space-y-3">
                <article
                    v-for="event in sortedFilteredEvents"
                    :key="event.id"
                    class="border-border bg-background hover:bg-muted/20 rounded-xl border p-4 transition-colors"
                >
                    <div
                        class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
                    >
                        <div class="min-w-0 space-y-2">
                            <div
                                class="flex min-w-0 flex-wrap items-center gap-2"
                            >
                                <NuxtLink
                                    v-if="
                                        isManager &&
                                        buildEventsDayEditRoute(
                                            event,
                                            schoolId,
                                            selectedDate,
                                        )
                                    "
                                    :to="
                                        buildEventsDayEditRoute(
                                            event,
                                            schoolId,
                                            selectedDate,
                                        )!
                                    "
                                    class="text-foreground focus-visible:ring-ring min-w-0 rounded-sm font-extrabold underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                                    :aria-label="`Edytuj ${isScheduleInstructorEvent(event) ? 'wydarzenie' : 'jazdę'} o ${displayEventPrimary(event, false)}`"
                                >
                                    {{ displayEventPrimary(event, isManager) }}
                                    <ArrowUpRight
                                        class="ml-1 inline size-3.5 align-baseline"
                                        aria-hidden="true"
                                    />
                                </NuxtLink>
                                <p
                                    v-else
                                    class="text-foreground min-w-0 font-extrabold"
                                >
                                    {{ displayEventPrimary(event, isManager) }}
                                </p>
                                <UiBadge
                                    variant="outline"
                                    class="rounded-full text-xs font-semibold"
                                    :class="eventTypeBadgeClasses(event.type)"
                                >
                                    {{ eventTypeLabel(event.type) }}
                                </UiBadge>
                            </div>
                            <p
                                class="text-muted-foreground text-sm leading-relaxed"
                            >
                                {{ displayEventMeta(event) }}
                            </p>
                        </div>

                        <div
                            class="flex shrink-0 items-center justify-start md:justify-end"
                            @click.stop
                        >
                            <ManagerEventStatusSelect
                                v-if="
                                    isManager &&
                                    isScheduleInstructorEvent(event)
                                "
                                :event-id="event.id"
                                :status="event.status"
                                compact
                                @status-changed="$emit('statusChanged', $event)"
                            />
                            <UiBadge
                                v-else
                                :variant="
                                    instructorEventStatusBadgeVariant(
                                        eventsDayStatusCode(event),
                                    )
                                "
                                class="shrink-0 rounded-full text-xs font-normal"
                            >
                                {{ eventsDayStatusLabel(event) }}
                            </UiBadge>
                        </div>
                    </div>
                </article>
            </div>
        </UiCardContent>
    </UiCard>
</template>
