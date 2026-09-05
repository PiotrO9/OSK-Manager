<script setup lang="ts">
import type {
    InstructorScheduleColumn,
    InstructorScheduleRow,
} from '~/composables/events/useEventsDayPage';
import {
    displayParticipantCount,
    eventIsoToHm,
    eventTypeBadgeClasses,
    eventTypeLabel,
} from '~/utils/events/eventsDayPage';

defineProps<{
    columns: InstructorScheduleColumn[];
    gridColumns: string;
    rows: InstructorScheduleRow[];
    weekRangeLabel: string;
}>();

defineEmits<{
    statusChanged: [payload: { id: string; status: string }];
}>();
</script>

<template>
    <div class="overflow-hidden rounded-2xl border">
        <div class="overflow-x-auto">
            <div class="min-w-[920px]">
                <div
                    class="bg-muted/40 border-border sticky top-0 z-10 grid border-b"
                    :style="{ gridTemplateColumns: gridColumns }"
                >
                    <div
                        class="text-muted-foreground flex h-20 items-end px-3 pb-3 text-xs font-semibold"
                    >
                        Godz.
                    </div>
                    <div
                        v-for="column in columns"
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
                    v-for="row in rows"
                    :key="row.hour"
                    class="border-border grid min-h-24 border-b last:border-b-0"
                    :style="{ gridTemplateColumns: gridColumns }"
                    role="grid"
                    :aria-label="`Terminarz dostępności instruktorów, ${weekRangeLabel}`"
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
                            <div class="flex items-start justify-between gap-2">
                                <p class="text-sm font-extrabold">
                                    {{ eventIsoToHm(event.startTime) }}
                                    -
                                    {{ eventIsoToHm(event.endTime) }}
                                </p>
                                <UiBadge
                                    variant="outline"
                                    class="bg-background/70 rounded-full text-[10px] font-semibold"
                                    :class="eventTypeBadgeClasses(event.type)"
                                >
                                    {{ eventTypeLabel(event.type) }}
                                </UiBadge>
                            </div>
                            <p class="mt-1 text-xs font-medium text-sky-700">
                                {{ displayParticipantCount(event) }}
                                kursantów
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
</template>
