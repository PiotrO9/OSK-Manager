<script setup lang="ts">
import { Pencil, Trash2, X } from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import { buildScheduleManagerItemEditRoute } from '~/utils/schedule/scheduleManagerEditNavigation';
import {
    displaySchedulePerson,
    displayScheduleVehicle,
    formatScheduleLessonDateTime,
    labelForScheduleLessonStatus,
    labelForScheduleLessonType,
} from '~/utils/schedule/managerScheduleLessonTable';

type ScheduleViewMode = 'calendar' | 'list';

const props = defineProps<{
    weekStart: Date;
    isScheduleLoading: boolean;
    scheduleError: string | null;
    items: ScheduleLessonItem[];
    schoolId: string;
}>();

const emit = defineEmits<{
    weekStartChanged: [value: Date];
    refresh: [];
    requestDelete: [item: ScheduleLessonItem];
    statusChanged: [payload: { id: string; status: string }];
}>();

const selectedItemId = shallowRef<string | null>(null);
const scheduleView = shallowRef<ScheduleViewMode>('calendar');

const calendarWeekStart = computed({
    get: () => props.weekStart,
    set: (value: Date) => emit('weekStartChanged', value),
});

const selectedItem = computed(() => {
    const id = selectedItemId.value;

    if (!id) {
        return null;
    }

    return props.items.find((item) => item.id === id) ?? null;
});

const selectedItemEditRoute = computed(() => {
    const item = selectedItem.value;

    if (!item) {
        return null;
    }

    return buildScheduleManagerItemEditRoute(item);
});

watch(
    () => props.items,
    () => {
        if (!selectedItem.value) {
            selectedItemId.value = null;
        }
    },
);

function handleBlockSelected(item: ScheduleLessonItem): void {
    selectedItemId.value = item.id;
}

function handleCloseSelection(): void {
    selectedItemId.value = null;
}

function handleDeleteSelected(): void {
    const item = selectedItem.value;

    if (!item || !isScheduleInstructorEvent(item)) {
        return;
    }

    emit('requestDelete', item);
}

function setScheduleView(value: ScheduleViewMode): void {
    scheduleView.value = value;
}
</script>

<template>
    <WeekCalendarPanel
        title="Terminarz"
        description="Tygodniowy harmonogram jazd, teorii i bloków."
        heading-id="schedule-week-heading"
    >
        <template #actions>
            <div
                class="grid w-full grid-cols-2 gap-2 sm:w-auto"
                role="tablist"
                aria-label="Widok terminarza instruktora"
            >
                <UiButton
                    id="instructor-schedule-calendar-tab"
                    type="button"
                    size="sm"
                    role="tab"
                    :variant="
                        scheduleView === 'calendar' ? 'default' : 'outline'
                    "
                    :aria-selected="scheduleView === 'calendar'"
                    aria-controls="instructor-schedule-calendar-panel"
                    @click="setScheduleView('calendar')"
                >
                    Kalendarz
                </UiButton>
                <UiButton
                    id="instructor-schedule-list-tab"
                    type="button"
                    size="sm"
                    role="tab"
                    :variant="scheduleView === 'list' ? 'default' : 'outline'"
                    :aria-selected="scheduleView === 'list'"
                    aria-controls="instructor-schedule-list-panel"
                    @click="setScheduleView('list')"
                >
                    Lista
                </UiButton>
            </div>
        </template>

        <div class="space-y-3">
            <div
                v-if="scheduleView === 'calendar'"
                id="instructor-schedule-calendar-panel"
                role="tabpanel"
                aria-labelledby="instructor-schedule-calendar-tab"
            >
                <ManagerSchoolScheduleCalendar
                    v-model:week-start="calendarWeekStart"
                    parent-schedule
                    group-same-start
                    event-action-mode="select"
                    compact-chrome
                    :school-id="schoolId"
                    :parent-items="items"
                    :parent-loading="isScheduleLoading"
                    :parent-error="scheduleError"
                    event-edit-enabled
                    :show-instructor-count="false"
                    :show-instructor-subtitle="false"
                    scope-badge-label="Ten instruktor"
                    schedule-count-badge-label="Wpisy"
                    empty-day-message="Brak wpisów"
                    @block-selected="handleBlockSelected"
                />
            </div>

            <div
                v-else
                id="instructor-schedule-list-panel"
                role="tabpanel"
                aria-labelledby="instructor-schedule-list-tab"
            >
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
                <LazyManagerScheduleLessonTable
                    v-else
                    :items="items"
                    empty-message="Brak wpisów w wybranym tygodniu."
                    event-edit-enabled
                    event-delete-enabled
                    event-status-change-enabled
                    @request-delete="emit('requestDelete', $event)"
                    @status-changed="emit('statusChanged', $event)"
                />
            </div>

            <div
                v-if="selectedItem"
                class="border-border bg-muted/20 rounded-lg border p-3 shadow-xs"
            >
                <div
                    class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                >
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <p class="text-foreground text-sm font-semibold">
                                {{
                                    labelForScheduleLessonType(
                                        selectedItem.type,
                                    )
                                }}
                            </p>
                            <UiBadge
                                v-if="!isScheduleInstructorEvent(selectedItem)"
                                variant="outline"
                                class="text-xs font-normal"
                            >
                                {{
                                    labelForScheduleLessonStatus(
                                        selectedItem.status,
                                    )
                                }}
                            </UiBadge>
                        </div>
                        <p class="text-muted-foreground mt-1 text-xs">
                            {{
                                formatScheduleLessonDateTime(
                                    selectedItem.startTime,
                                )
                            }}
                            -
                            {{
                                formatScheduleLessonDateTime(
                                    selectedItem.endTime,
                                )
                            }}
                        </p>
                        <div
                            class="text-muted-foreground mt-2 grid gap-1 text-xs sm:grid-cols-2"
                        >
                            <span
                                >Kursant:
                                {{
                                    displaySchedulePerson(selectedItem.student)
                                }}</span
                            >
                            <span
                                >Pojazd:
                                {{
                                    displayScheduleVehicle(selectedItem.vehicle)
                                }}</span
                            >
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <ManagerEventStatusSelect
                            v-if="isScheduleInstructorEvent(selectedItem)"
                            :event-id="selectedItem.id"
                            :status="selectedItem.status"
                            compact
                            @status-changed="emit('statusChanged', $event)"
                        />
                        <UiButton
                            v-if="selectedItemEditRoute"
                            as-child
                            type="button"
                            variant="outline"
                            size="sm"
                            class="gap-2"
                        >
                            <NuxtLink :to="selectedItemEditRoute">
                                <Pencil class="size-4" aria-hidden="true" />
                                Edytuj
                            </NuxtLink>
                        </UiButton>
                        <UiButton
                            v-if="isScheduleInstructorEvent(selectedItem)"
                            type="button"
                            variant="destructive"
                            size="sm"
                            class="gap-2"
                            @click="handleDeleteSelected"
                        >
                            <Trash2 class="size-4" aria-hidden="true" />
                            Usuń
                        </UiButton>
                        <UiButton
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Zamknij akcje bloku"
                            @click="handleCloseSelection"
                        >
                            <X class="size-4" aria-hidden="true" />
                        </UiButton>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="emit('refresh')"
                >
                    Odśwież
                </UiButton>
            </div>
        </div>
    </WeekCalendarPanel>
</template>
