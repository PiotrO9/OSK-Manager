<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule';
import {
    buildScheduleManagerItemEditRoute,
    isScheduleManagerItemEditable,
} from '~/utils/scheduleManagerEditNavigation';
import { isScheduleBookedPracticalLesson } from '~/utils/scheduleBookedPracticalLesson';
import { isScheduleInstructorEvent } from '~/utils/scheduleInstructorEvent';
import {
    instructorEventStatusBadgeVariant,
    labelForInstructorEventStatusRaw,
    normalizeInstructorEventStatus,
} from '~/utils/instructorEventStatusDisplay';

const props = withDefaults(
    defineProps<{
        items: readonly ScheduleLessonItem[];
        emptyMessage?: string;
        /** Gdy true — klik w wiersz bloku czasu lub jazdy praktycznej prowadzi do edycji. */
        eventEditEnabled?: boolean;
        /** Gdy true — kolumna z przyciskiem „Usuń” dla bloków `instructor_event`. */
        eventDeleteEnabled?: boolean;
        /** Gdy true — select statusu (PATCH) dla wierszy `instructor_event` (uprawnienia managera). */
        eventStatusChangeEnabled?: boolean;
        studentLessonCancelEnabled?: boolean;
        cancellingLessonId?: string | null;
        /** Przekazywane do `/manager/events/:id/edit` jako `?schoolId=` (np. wybór pojazdu). */
        schoolId?: string;
    }>(),
    {
        emptyMessage: undefined,
        eventEditEnabled: false,
        eventDeleteEnabled: false,
        eventStatusChangeEnabled: false,
        studentLessonCancelEnabled: false,
        cancellingLessonId: null,
        schoolId: '',
    },
);

const emit = defineEmits<{
    'request-delete': [item: ScheduleLessonItem];
    'request-cancel-lesson': [item: ScheduleLessonItem];
    'status-changed': [payload: { id: string; status: string }];
}>();

const hasActionsColumn = computed(
    () => props.eventDeleteEnabled || props.studentLessonCancelEnabled,
);

function rowIsClickable(item: ScheduleLessonItem): boolean {
    return isScheduleManagerItemEditable(props.eventEditEnabled, item);
}

function handleRowClick(item: ScheduleLessonItem): void {
    if (!rowIsClickable(item)) {
        return;
    }

    const target = buildScheduleManagerItemEditRoute(
        item,
        props.schoolId ?? '',
    );

    if (!target) {
        return;
    }

    void navigateTo(target);
}

function handleRowKeydown(e: KeyboardEvent, item: ScheduleLessonItem): void {
    if (!rowIsClickable(item)) {
        return;
    }

    if (e.key !== 'Enter' && e.key !== ' ') {
        return;
    }

    e.preventDefault();
    handleRowClick(item);
}

function handleRequestDeleteClick(item: ScheduleLessonItem): void {
    emit('request-delete', item);
}

function handleRequestCancelLessonClick(item: ScheduleLessonItem): void {
    emit('request-cancel-lesson', item);
}

function isStudentCancellableLesson(item: ScheduleLessonItem): boolean {
    return (
        props.studentLessonCancelEnabled &&
        item.kind === 'lesson' &&
        item.type.trim().toUpperCase() === 'PRACTICE' &&
        item.status.trim().toUpperCase() === 'SCHEDULED'
    );
}

function rowTitle(item: ScheduleLessonItem): string | undefined {
    if (!rowIsClickable(item)) {
        return undefined;
    }

    if (isScheduleInstructorEvent(item)) {
        return 'Otwórz edycję bloku czasu';
    }

    if (isScheduleBookedPracticalLesson(item)) {
        return 'Otwórz edycję jazdy praktycznej';
    }

    return undefined;
}

function formatIsoLocal(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(d);
}

function displayPerson(
    p: { firstName: string; lastName: string } | undefined,
): string {
    if (!p) {
        return '—';
    }

    const s = `${p.firstName} ${p.lastName}`.trim();

    return s.length > 0 ? s : '—';
}

function displayVehicle(
    v: { name: string; registrationNumber: string } | undefined,
): string {
    if (!v) {
        return '—';
    }

    const name = v.name.trim();
    const reg = v.registrationNumber.trim();

    if (name && reg) {
        return `${name} (${reg})`;
    }

    return name || reg || '—';
}

function labelForLessonType(rawType: string): string {
    const normalized = rawType.trim().toUpperCase();

    if (normalized === 'PRACTICE') {
        return 'Jazda praktyczna';
    }

    if (normalized === 'THEORY') {
        return 'Teoria';
    }

    return rawType.trim() || '—';
}

function labelForLessonStatus(rawStatus: string): string {
    const normalized = rawStatus.trim().toUpperCase();

    if (normalized === 'SCHEDULED' || normalized === 'PLANNED') {
        return 'Zaplanowana';
    }

    if (normalized === 'COMPLETED' || normalized === 'FINISHED') {
        return 'Zrealizowana';
    }

    if (normalized === 'CANCELLED' || normalized === 'CANCELED') {
        return 'Anulowana';
    }

    if (normalized === 'NO_SHOW') {
        return 'Nie stawil sie';
    }

    return rawStatus.trim() || '—';
}
</script>

<template>
    <div
        class="border-border bg-background overflow-x-auto rounded-xl border shadow-xs"
    >
        <table
            class="w-full min-w-[760px] border-collapse text-sm"
            :aria-label="
                eventEditEnabled
                    ? 'Lista lekcji i bloków czasu; kliknij wiersz bloku lub jazdy praktycznej, aby edytować'
                    : 'Lista lekcji w wybranym zakresie dat'
            "
        >
            <thead>
                <tr
                    class="bg-muted/40 text-muted-foreground border-b text-left text-xs"
                >
                    <th scope="col" class="px-4 py-3 font-semibold">
                        Początek
                    </th>
                    <th scope="col" class="px-4 py-3 font-semibold">Koniec</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Typ</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" class="px-4 py-3 font-semibold">
                        Instruktor
                    </th>
                    <th scope="col" class="px-4 py-3 font-semibold">Kursant</th>
                    <th scope="col" class="px-4 py-3 font-semibold">Pojazd</th>
                    <th
                        v-if="hasActionsColumn"
                        scope="col"
                        class="px-4 py-3 font-semibold"
                    >
                        Akcje
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="props.items.length === 0">
                    <td
                        :colspan="hasActionsColumn ? 8 : 7"
                        class="text-muted-foreground px-4 py-10 text-center"
                        role="status"
                    >
                        {{
                            props.emptyMessage ??
                            'Brak lekcji w wybranym zakresie dat.'
                        }}
                    </td>
                </tr>
                <tr
                    v-for="item in props.items"
                    :key="item.id"
                    class="border-border border-t transition-colors"
                    :class="
                        rowIsClickable(item)
                            ? 'hover:bg-primary-50/50 focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                            : ''
                    "
                    :tabindex="rowIsClickable(item) ? 0 : undefined"
                    :role="rowIsClickable(item) ? 'link' : undefined"
                    :title="rowTitle(item)"
                    @click="handleRowClick(item)"
                    @keydown="handleRowKeydown($event, item)"
                >
                    <td class="px-4 py-3 whitespace-nowrap">
                        {{ formatIsoLocal(item.startTime) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        {{ formatIsoLocal(item.endTime) }}
                    </td>
                    <td class="px-4 py-3">
                        {{ labelForLessonType(item.type) }}
                    </td>
                    <td class="px-4 py-3 align-top" @click.stop>
                        <ManagerEventStatusSelect
                            v-if="
                                isScheduleInstructorEvent(item) &&
                                props.eventStatusChangeEnabled
                            "
                            :event-id="item.id"
                            :status="item.status"
                            compact
                            @status-changed="(p) => emit('status-changed', p)"
                        />
                        <UiBadge
                            v-else-if="isScheduleInstructorEvent(item)"
                            :variant="
                                instructorEventStatusBadgeVariant(
                                    normalizeInstructorEventStatus(item.status),
                                )
                            "
                            class="shrink-0 text-xs font-normal"
                        >
                            {{ labelForInstructorEventStatusRaw(item.status) }}
                        </UiBadge>
                        <span v-else>{{
                            labelForLessonStatus(item.status)
                        }}</span>
                    </td>
                    <td class="px-4 py-3">
                        {{ displayPerson(item.instructor) }}
                    </td>
                    <td class="px-4 py-3">
                        {{ displayPerson(item.student) }}
                    </td>
                    <td class="px-4 py-3">
                        {{ displayVehicle(item.vehicle) }}
                    </td>
                    <td
                        v-if="hasActionsColumn"
                        class="px-4 py-3 whitespace-nowrap"
                        @click.stop
                    >
                        <UiButton
                            v-if="isScheduleInstructorEvent(item)"
                            type="button"
                            variant="destructive"
                            size="sm"
                            class="shrink-0"
                            :aria-label="`Usuń blok czasu ${formatIsoLocal(item.startTime)} — ${formatIsoLocal(item.endTime)}`"
                            @click="handleRequestDeleteClick(item)"
                        >
                            Usuń
                        </UiButton>
                        <UiButton
                            v-else-if="isStudentCancellableLesson(item)"
                            type="button"
                            variant="destructive"
                            size="sm"
                            class="shrink-0"
                            :disabled="props.cancellingLessonId === item.id"
                            :aria-busy="props.cancellingLessonId === item.id"
                            :aria-label="`Anuluj rezerwację ${formatIsoLocal(item.startTime)} - ${formatIsoLocal(item.endTime)}`"
                            @click="handleRequestCancelLessonClick(item)"
                        >
                            {{
                                props.cancellingLessonId === item.id
                                    ? 'Anulowanie...'
                                    : 'Anuluj'
                            }}
                        </UiButton>
                        <span v-else class="text-muted-foreground">—</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
