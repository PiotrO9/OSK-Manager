<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type { ScheduleLessonItem } from '~/types/schedule';
import type { EventStatusCode } from '~/types/instructorEvent';
import { isScheduleInstructorEvent } from '~/utils/scheduleInstructorEvent';
import {
    INSTRUCTOR_EVENT_STATUS_LABELS,
    INSTRUCTOR_EVENT_STATUS_OPTIONS,
    instructorEventStatusBadgeVariant,
    labelForInstructorEventStatusRaw,
    normalizeInstructorEventStatus,
} from '~/utils/instructorEventStatusDisplay';
import {
    formatDateOnly,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
} from '~/utils/weeklyCalendarDates';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager-or-instructor'],
});

usePageMeta({
    title: () => 'Wydarzenia',
    description: () =>
        'Dzienny widok wydarzeń instruktora — zajęcia grupowe i bloki czasu.',
});

const { session } = useAuthSession();
const { fetchSchoolSchedule, isLoading: isSchoolLoading } =
    useSchoolScheduleApi();
const { fetchMySchedule } = useScheduleApi();

const isManager = computed(() => {
    const r = session.value?.role?.trim().toUpperCase();

    return r === 'MANAGER' || r === 'ADMIN';
});

const schoolId = computed((): string => {
    const id = session.value?.defaultOskId;

    return typeof id === 'string' ? id.trim() : '';
});

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const events = ref<ScheduleLessonItem[]>([]);

const selectedDate = ref<string>(formatDateOnly(new Date()));
const selectedStatus = ref<'ALL' | EventStatusCode>('ALL');
const isCalendarOpen = ref(false);

const calendarSelected = computed<CalendarDate>(() =>
    parseDate(selectedDate.value),
);

type StatusFilterOption = 'ALL' | EventStatusCode;

const STATUS_FILTER_OPTIONS: readonly StatusFilterOption[] = [
    'ALL',
    ...INSTRUCTOR_EVENT_STATUS_OPTIONS,
];

function statusFilterLabel(opt: StatusFilterOption): string {
    if (opt === 'ALL') {
        return 'Wszystkie';
    }

    return INSTRUCTOR_EVENT_STATUS_LABELS[opt];
}

const filteredEvents = computed(() =>
    events.value.filter(
        (e) =>
            selectedStatus.value === 'ALL' || e.status === selectedStatus.value,
    ),
);

const selectedDateLabel = computed(() => {
    const d = new Date(`${selectedDate.value}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return selectedDate.value;
    }

    const today = formatDateOnly(new Date());
    const yesterday = formatDateOnly(new Date(Date.now() - 86_400_000));
    const tomorrow = formatDateOnly(new Date(Date.now() + 86_400_000));

    const label = new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);

    if (selectedDate.value === today) {
        return `Dzisiaj — ${label}`;
    }

    if (selectedDate.value === yesterday) {
        return `Wczoraj — ${label}`;
    }

    if (selectedDate.value === tomorrow) {
        return `Jutro — ${label}`;
    }

    return label;
});

let loadSeq = 0;

async function loadEvents(): Promise<void> {
    const day = selectedDate.value;
    const seq = ++loadSeq;

    errorMessage.value = null;
    isLoading.value = true;

    try {
        let raw: ScheduleLessonItem[];

        if (isManager.value) {
            const sid = schoolId.value;

            if (!sid) {
                errorMessage.value =
                    'Brak identyfikatora szkoły. Ustaw domyślną OSK w swoim profilu lub dodaj ?schoolId= do adresu.';
                events.value = [];

                return;
            }

            raw = await fetchSchoolSchedule(sid, day, day);
        } else {
            raw = await fetchMySchedule(day, day);
        }

        if (seq !== loadSeq) {
            return;
        }

        events.value = raw.filter(isScheduleInstructorEvent);
    } catch (err: unknown) {
        if (seq !== loadSeq) {
            return;
        }

        events.value = [];
        errorMessage.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać wydarzeń.',
        );
    } finally {
        if (seq === loadSeq) {
            isLoading.value = false;
        }
    }
}

watch(selectedDate, () => {
    void loadEvents();
});

onMounted(() => {
    void loadEvents();
});

function handlePrevDay(): void {
    const d = new Date(`${selectedDate.value}T00:00:00`);

    d.setDate(d.getDate() - 1);
    selectedDate.value = formatDateOnly(d);
}

function handleNextDay(): void {
    const d = new Date(`${selectedDate.value}T00:00:00`);

    d.setDate(d.getDate() + 1);
    selectedDate.value = formatDateOnly(d);
}

function handleTodayClick(): void {
    selectedDate.value = formatDateOnly(new Date());
}

function handleCalendarUpdate(val: DateValue | DateValue[]): void {
    const single = Array.isArray(val) ? val[0] : val;

    if (!single) {
        return;
    }

    selectedDate.value = formatDateOnly(toDate(single));
    isCalendarOpen.value = false;
}

function handleStatusFilterSelect(opt: StatusFilterOption): void {
    selectedStatus.value = opt;
}

function handleStatusChanged(payload: { id: string; status: string }): void {
    const idx = events.value.findIndex((e) => e.id === payload.id);

    if (idx < 0) {
        return;
    }

    const row = events.value[idx];

    if (!row) {
        return;
    }

    const copy = events.value.slice();

    copy[idx] = { ...row, status: payload.status };
    events.value = copy;
}

function isoToHm(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(d);
}

function displayInstructorName(item: ScheduleLessonItem): string {
    const ins = item.instructor;

    if (!ins) {
        return '—';
    }

    return `${ins.firstName} ${ins.lastName}`.trim() || '—';
}

function displayParticipantCount(item: ScheduleLessonItem): string {
    if (typeof item.participantCount === 'number') {
        const cap =
            typeof item.capacity === 'number' ? `/${item.capacity}` : '';

        return `${item.participantCount}${cap}`;
    }

    if (typeof item.capacity === 'number') {
        return `0/${item.capacity}`;
    }

    return '—';
}

function eventTypeBadgeClasses(type: string): string {
    const t = String(type).trim().toUpperCase();

    if (t === 'THEORY') {
        return 'border-violet-500/40 bg-violet-500/15 text-violet-800 dark:text-violet-200';
    }

    if (t === 'DRIVE') {
        return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200';
    }

    return '';
}

function eventTypeLabel(type: string): string {
    const t = String(type).trim().toUpperCase();

    if (t === 'THEORY') {
        return 'Teoria';
    }

    if (t === 'DRIVE') {
        return 'Jazda';
    }

    return type;
}
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                {{ isManager ? 'Wydarzenia' : 'Moje wydarzenia' }}
            </h1>
            <p class="text-muted-foreground text-sm">
                {{
                    isManager
                        ? 'Dzienne zestawienie bloków czasu instruktorów. Możesz zmieniać status każdego wydarzenia.'
                        : 'Twoje bloki czasu w wybranym dniu.'
                }}
            </p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="inline-flex items-center gap-1"
                    aria-label="Poprzedni dzień"
                    :disabled="isLoading"
                    @click="handlePrevDay"
                >
                    <ChevronLeft class="size-4" aria-hidden="true" />
                    Poprzedni
                </UiButton>

                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Dzisiaj"
                    :disabled="isLoading"
                    @click="handleTodayClick"
                >
                    Dzisiaj
                </UiButton>

                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="inline-flex items-center gap-1"
                    aria-label="Następny dzień"
                    :disabled="isLoading"
                    @click="handleNextDay"
                >
                    Następny
                    <ChevronRight class="size-4" aria-hidden="true" />
                </UiButton>
            </div>

            <p
                class="text-foreground min-w-0 flex-1 text-center text-sm font-medium capitalize"
                aria-live="polite"
            >
                {{ selectedDateLabel }}
            </p>

            <UiPopover v-model:open="isCalendarOpen">
                <UiPopoverTrigger as-child>
                    <UiButton
                        type="button"
                        variant="outline"
                        size="sm"
                        :disabled="isLoading"
                        aria-label="Wybierz dzień w kalendarzu"
                    >
                        Wybierz dzień
                    </UiButton>
                </UiPopoverTrigger>
                <UiPopoverContent class="w-auto p-0" align="end">
                    <UiCalendar
                        :week-starts-on="1"
                        :min-value="WEEK_PICKER_CALENDAR_MIN"
                        :max-value="WEEK_PICKER_CALENDAR_MAX"
                        :model-value="calendarSelected"
                        locale="pl-PL"
                        @update:model-value="handleCalendarUpdate"
                    />
                </UiPopoverContent>
            </UiPopover>
        </div>

        <div
            class="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filtruj po statusie"
        >
            <span class="text-muted-foreground text-sm">Status:</span>
            <button
                v-for="opt in STATUS_FILTER_OPTIONS"
                :key="opt"
                type="button"
                class="focus-visible:ring-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                :class="
                    selectedStatus === opt
                        ? 'bg-foreground text-background border-transparent'
                        : 'border-border text-muted-foreground hover:text-foreground bg-background'
                "
                :aria-pressed="selectedStatus === opt"
                @click="handleStatusFilterSelect(opt)"
            >
                {{ statusFilterLabel(opt) }}
            </button>
        </div>

        <p
            v-if="isLoading || isSchoolLoading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie wydarzeń…
        </p>

        <p
            v-else-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ errorMessage }}
        </p>

        <template v-else>
            <div
                v-if="filteredEvents.length === 0"
                class="text-muted-foreground rounded-xl border py-10 text-center text-sm"
                role="status"
            >
                {{
                    events.length === 0
                        ? 'Brak wydarzeń w wybranym dniu.'
                        : 'Brak wydarzeń spełniających wybrany filtr statusu.'
                }}
            </div>

            <div v-else class="overflow-x-auto rounded-lg border">
                <table
                    class="w-full min-w-[640px] border-collapse text-sm"
                    aria-label="Lista wydarzeń w wybranym dniu"
                >
                    <thead>
                        <tr class="bg-muted/50 border-b text-left">
                            <th scope="col" class="px-3 py-2 font-medium">
                                Godzina
                            </th>
                            <th scope="col" class="px-3 py-2 font-medium">
                                Typ
                            </th>
                            <th
                                v-if="isManager"
                                scope="col"
                                class="px-3 py-2 font-medium"
                            >
                                Instruktor
                            </th>
                            <th scope="col" class="px-3 py-2 font-medium">
                                Kursanci
                            </th>
                            <th scope="col" class="px-3 py-2 font-medium">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="event in filteredEvents"
                            :key="event.id"
                            class="border-border border-t"
                        >
                            <td class="px-3 py-2 whitespace-nowrap">
                                <span class="font-medium tabular-nums">
                                    {{ isoToHm(event.startTime) }}
                                </span>
                                <span class="text-muted-foreground mx-1"
                                    >–</span
                                >
                                <span class="tabular-nums">
                                    {{ isoToHm(event.endTime) }}
                                </span>
                            </td>
                            <td class="px-3 py-2">
                                <UiBadge
                                    variant="outline"
                                    class="text-xs font-medium"
                                    :class="eventTypeBadgeClasses(event.type)"
                                >
                                    {{ eventTypeLabel(event.type) }}
                                </UiBadge>
                            </td>
                            <td
                                v-if="isManager"
                                class="px-3 py-2 whitespace-nowrap"
                            >
                                {{ displayInstructorName(event) }}
                            </td>
                            <td class="px-3 py-2 whitespace-nowrap">
                                {{ displayParticipantCount(event) }}
                            </td>
                            <td class="px-3 py-2 align-top" @click.stop>
                                <ManagerEventStatusSelect
                                    v-if="isManager"
                                    :event-id="event.id"
                                    :status="event.status"
                                    compact
                                    @status-changed="handleStatusChanged"
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
                                    class="shrink-0 text-xs font-normal"
                                >
                                    {{
                                        labelForInstructorEventStatusRaw(
                                            event.status,
                                        )
                                    }}
                                </UiBadge>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p class="text-muted-foreground text-xs">
                Wyświetlono {{ filteredEvents.length }}
                {{
                    filteredEvents.length === events.length
                        ? ''
                        : `z ${events.length}`
                }}
                {{ events.length === 1 ? 'wydarzenie' : 'wydarzeń' }}.
            </p>
        </template>
    </div>
</template>
