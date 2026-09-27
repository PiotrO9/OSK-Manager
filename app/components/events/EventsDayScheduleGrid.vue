<script setup lang="ts">
import type {
    InstructorScheduleColumn,
    InstructorScheduleRow,
} from '~/composables/events/useEventsDayPage';
import ProfileAvatar from '~/components/app/ProfileAvatar.vue';
import {
    displayParticipantCountLabel,
    eventIsoToHm,
    eventTypeBadgeClasses,
    eventTypeLabel,
    eventsDayStatusCode,
    eventsDayStatusLabel,
} from '~/utils/events/eventsDayPage';
import {
    EVENTS_DAY_HOUR_HEIGHT_PX,
    getEventsDayPositionedEvents,
} from '~/utils/events/eventsDayScheduleGrid';
import { buildEventsDayEditRoute } from '~/utils/events/eventsDayNavigation';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import { instructorEventStatusBadgeVariant } from '~/utils/events/instructorEventStatusDisplay';

const props = defineProps<{
    columns: InstructorScheduleColumn[];
    rows: InstructorScheduleRow[];
    schoolId: string;
    selectedDate: string;
}>();

defineEmits<{
    statusChanged: [payload: { id: string; status: string }];
}>();

const timelineHeightPx = computed(
    () => props.rows.length * EVENTS_DAY_HOUR_HEIGHT_PX,
);
const startHour = computed(() => props.rows[0]?.hour ?? 7);
const positionedColumns = computed(() =>
    props.columns.map((column) => ({
        ...column,
        positionedEvents: getEventsDayPositionedEvents(
            column.events,
            startHour.value,
        ),
    })),
);
const gridTemplateColumns = computed(
    () =>
        `72px ${positionedColumns.value
            .map((column) => {
                const lanes = Math.max(
                    1,
                    ...column.positionedEvents.map((event) => event.laneCount),
                );
                const minWidth =
                    column.events.length === 0
                        ? 150
                        : Math.max(190, lanes * 150);

                return `minmax(${minWidth}px, 1fr)`;
            })
            .join(' ')}`,
);
</script>

<template>
    <div class="overflow-hidden rounded-2xl border">
        <div class="overflow-x-auto">
            <div class="min-w-[920px]">
                <div
                    class="bg-muted/40 border-border grid border-b"
                    :style="{ gridTemplateColumns }"
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
                        <ProfileAvatar
                            :src="column.avatarUrl"
                            :initials="column.initials"
                            :size="40"
                            class="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-700"
                        />
                        <p
                            class="text-foreground max-w-full truncate text-sm font-bold"
                            :title="column.name"
                        >
                            {{ column.name }}
                        </p>
                    </div>
                </div>

                <div
                    class="grid"
                    :style="{
                        gridTemplateColumns,
                        height: `${timelineHeightPx}px`,
                    }"
                    role="group"
                    :aria-label="`Harmonogram wydarzeń na ${selectedDate}`"
                >
                    <div class="text-muted-foreground text-xs font-semibold">
                        <div
                            v-for="row in rows"
                            :key="row.hour"
                            class="border-border flex justify-end border-b px-3 py-3 tabular-nums"
                            :style="{
                                height: `${EVENTS_DAY_HOUR_HEIGHT_PX}px`,
                            }"
                        >
                            {{ row.label }}
                        </div>
                    </div>

                    <div
                        v-for="column in positionedColumns"
                        :key="column.id"
                        class="border-border relative min-w-0 border-l"
                        :style="{ height: `${timelineHeightPx}px` }"
                    >
                        <div
                            class="pointer-events-none absolute inset-0"
                            aria-hidden="true"
                        >
                            <div
                                v-for="row in rows"
                                :key="row.hour"
                                class="border-border/70 border-b"
                                :style="{
                                    height: `${EVENTS_DAY_HOUR_HEIGHT_PX}px`,
                                }"
                            />
                        </div>

                        <article
                            v-for="positioned in column.positionedEvents"
                            :key="positioned.event.id"
                            class="absolute z-10 box-border overflow-hidden rounded-lg border border-sky-200 bg-sky-50 p-2 text-sky-950 shadow-sm focus-within:z-20 hover:z-20 hover:shadow-md"
                            :style="{
                                top: `${positioned.topPx + 2}px`,
                                height: `${Math.max(28, positioned.heightPx - 4)}px`,
                                left: `calc(${(positioned.lane / positioned.laneCount) * 100}% + 3px)`,
                                width: `calc(${100 / positioned.laneCount}% - 6px)`,
                            }"
                        >
                            <div
                                class="flex min-w-0 flex-wrap items-center gap-1.5"
                            >
                                <NuxtLink
                                    v-if="
                                        buildEventsDayEditRoute(
                                            positioned.event,
                                            schoolId,
                                            selectedDate,
                                        )
                                    "
                                    :to="
                                        buildEventsDayEditRoute(
                                            positioned.event,
                                            schoolId,
                                            selectedDate,
                                        )!
                                    "
                                    class="focus-visible:ring-ring min-w-0 rounded-sm text-xs font-bold tabular-nums underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                                    :aria-label="`Edytuj ${isScheduleInstructorEvent(positioned.event) ? 'wydarzenie' : 'jazdę'} ${eventIsoToHm(positioned.event.startTime)}–${eventIsoToHm(positioned.event.endTime)}`"
                                >
                                    {{
                                        eventIsoToHm(
                                            positioned.event.startTime,
                                        )
                                    }}–{{
                                        eventIsoToHm(positioned.event.endTime)
                                    }}
                                </NuxtLink>
                                <span
                                    v-else
                                    class="text-xs font-bold tabular-nums"
                                >
                                    {{
                                        eventIsoToHm(
                                            positioned.event.startTime,
                                        )
                                    }}–{{
                                        eventIsoToHm(positioned.event.endTime)
                                    }}
                                </span>
                                <UiBadge
                                    variant="outline"
                                    class="bg-background/70 rounded-full text-[10px] font-semibold"
                                    :class="
                                        eventTypeBadgeClasses(
                                            positioned.event.type,
                                        )
                                    "
                                >
                                    {{ eventTypeLabel(positioned.event.type) }}
                                </UiBadge>
                            </div>
                            <p
                                class="mt-1 truncate text-xs font-medium text-sky-700"
                            >
                                {{
                                    displayParticipantCountLabel(
                                        positioned.event,
                                    )
                                }}
                            </p>
                            <ManagerEventStatusSelect
                                v-if="
                                    isScheduleInstructorEvent(
                                        positioned.event,
                                    ) && positioned.heightPx >= 90
                                "
                                class="mt-2"
                                :event-id="positioned.event.id"
                                :status="positioned.event.status"
                                compact
                                @status-changed="$emit('statusChanged', $event)"
                            />
                            <UiBadge
                                v-else
                                :variant="
                                    instructorEventStatusBadgeVariant(
                                        eventsDayStatusCode(positioned.event),
                                    )
                                "
                                class="mt-1 rounded-full text-[10px] font-normal"
                            >
                                {{ eventsDayStatusLabel(positioned.event) }}
                            </UiBadge>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
