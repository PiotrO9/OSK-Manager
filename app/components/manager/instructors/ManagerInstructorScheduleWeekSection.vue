<script setup lang="ts">
import { CalendarDays, Pencil, Trash2, X } from 'lucide-vue-next';
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

    return buildScheduleManagerItemEditRoute(item, props.schoolId);
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
                        Tygodniowy harmonogram jazd, teorii i bloków.
                    </p>
                </div>
            </div>

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
        </div>

        <div class="space-y-3 p-2 sm:p-3">
            <div
                v-if="scheduleView === 'calendar'"
                id="instructor-schedule-calendar-panel"
                role="tabpanel"
                aria-labelledby="instructor-schedule-calendar-tab"
            >
                <ManagerSchoolScheduleCalendar
                    v-model:week-start="calendarWeekStart"
                    parent-schedule
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
                    :school-id="schoolId"
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
    </section>
</template>
