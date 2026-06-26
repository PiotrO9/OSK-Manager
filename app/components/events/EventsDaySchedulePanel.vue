<script setup lang="ts">
import {
    displayEventMeta,
    displayEventPrimary,
    displayParticipantCount,
    eventTypeBadgeClasses,
    eventTypeLabel,
    EVENTS_DAY_STATUS_FILTER_OPTIONS,
    isoToHm,
    statusFilterLabelForOption,
    type EventsDayStatusFilterOption,
    type EventsDayViewMode,
    type InstructorScheduleColumn,
    type InstructorScheduleRow,
} from '~/composables/events/useEventsDayPage';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    instructorEventStatusBadgeVariant,
    labelForInstructorEventStatusRaw,
    normalizeInstructorEventStatus,
} from '~/utils/events/instructorEventStatusDisplay';

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
    managerScheduleColumns: InstructorScheduleColumn[];
    managerScheduleGridColumns: string;
    managerScheduleRows: InstructorScheduleRow[];
    pageDescription: string;
    selectedStatus: EventsDayStatusFilterOption;
    sortedFilteredEvents: ScheduleLessonItem[];
    visibleEventsLabel: string;
}>();

defineEmits<{
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
                    Wydarzenia dnia
                </UiCardTitle>
                <UiCardDescription>
                    {{ pageDescription }}
                </UiCardDescription>
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
                title="Nie udaĹ‚o siÄ™ wczytaÄ‡ wydarzeĹ„"
                :description="errorMessage"
                @retry="$emit('retry')"
            />

            <EmptyState
                v-else-if="
                    filteredEvents.length === 0 &&
                    (effectiveViewMode !== 'grid' ||
                        managerScheduleColumns.length === 0)
                "
                :title="
                    events.length === 0
                        ? 'Brak wydarzeĹ„ w wybranym dniu'
                        : 'Brak wydarzeĹ„ dla wybranego statusu'
                "
                :description="
                    events.length === 0
                        ? 'ZmieĹ„ dzieĹ„ lub wrĂłÄ‡ do dzisiejszego widoku.'
                        : 'Wybierz inny status, aby zobaczyÄ‡ pozostaĹ‚e wydarzenia.'
                "
            />

            <div
                v-else-if="effectiveViewMode === 'grid'"
                class="overflow-hidden rounded-2xl border"
            >
                <div class="overflow-x-auto">
                    <div class="min-w-[920px]">
                        <div
                            class="bg-muted/40 border-border sticky top-0 z-10 grid border-b"
                            :style="{
                                gridTemplateColumns: managerScheduleGridColumns,
                            }"
                        >
                            <div
                                class="text-muted-foreground flex h-20 items-end px-3 pb-3 text-xs font-semibold"
                            >
                                Godz.
                            </div>
                            <div
                                v-for="column in managerScheduleColumns"
                                :key="column.id"
                                class="border-border flex min-w-0 flex-col items-center justify-center gap-2 border-l px-3 py-3 text-center"
                            >
                                <div
                                    class="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-700"
                                >
                                    {{ column.initials }}
                                </div>
                                <p
                                    class="text-foreground max-w-full truncate text-sm font-bold"
                                    :title="column.name"
                                >
                                    {{ column.name }}
                                </p>
                            </div>
                        </div>

                        <div
                            v-for="row in managerScheduleRows"
                            :key="row.hour"
                            class="border-border grid min-h-24 border-b last:border-b-0"
                            :style="{
                                gridTemplateColumns: managerScheduleGridColumns,
                            }"
                        >
                            <div
                                class="text-muted-foreground flex items-start justify-end px-3 py-3 text-xs font-semibold"
                            >
                                {{ row.label }}
                            </div>

                            <div
                                v-for="cell in row.cells"
                                :key="cell.key"
                                class="border-border min-h-24 space-y-2 border-l p-2"
                            >
                                <article
                                    v-for="event in cell.events"
                                    :key="event.id"
                                    class="rounded-xl border border-sky-200 bg-sky-50/80 p-3 text-sky-950 shadow-sm"
                                >
                                    <div
                                        class="flex items-start justify-between gap-2"
                                    >
                                        <p class="text-sm font-extrabold">
                                            {{ isoToHm(event.startTime) }}
                                            -
                                            {{ isoToHm(event.endTime) }}
                                        </p>
                                        <UiBadge
                                            variant="outline"
                                            class="bg-background/70 rounded-full text-[10px] font-semibold"
                                            :class="
                                                eventTypeBadgeClasses(
                                                    event.type,
                                                )
                                            "
                                        >
                                            {{ eventTypeLabel(event.type) }}
                                        </UiBadge>
                                    </div>
                                    <p
                                        class="mt-1 text-xs font-medium text-sky-700"
                                    >
                                        {{ displayParticipantCount(event) }}
                                        kursantĂłw
                                    </p>
                                    <div
                                        class="mt-3 flex items-center justify-between gap-2"
                                        @click.stop
                                    >
                                        <ManagerEventStatusSelect
                                            :event-id="event.id"
                                            :status="event.status"
                                            compact
                                            @status-changed="
                                                $emit('statusChanged', $event)
                                            "
                                        />
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                <p
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
                                v-if="isManager"
                                :event-id="event.id"
                                :status="event.status"
                                compact
                                @status-changed="$emit('statusChanged', $event)"
                            />
                            <UiBadge
                                v-else
                                :variant="
                                    instructorEventStatusBadgeVariant(
                                        normalizeInstructorEventStatus(
                                            event.status,
                                        ),
                                    )
                                "
                                class="shrink-0 rounded-full text-xs font-normal"
                            >
                                {{
                                    labelForInstructorEventStatusRaw(
                                        event.status,
                                    )
                                }}
                            </UiBadge>
                        </div>
                    </div>
                </article>
            </div>
        </UiCardContent>
    </UiCard>
</template>
