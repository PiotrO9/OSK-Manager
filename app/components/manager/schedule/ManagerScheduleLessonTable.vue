<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule';
import { isScheduleInstructorEvent } from '~/utils/scheduleInstructorEvent';

const props = withDefaults(
    defineProps<{
        items: readonly ScheduleLessonItem[];
        emptyMessage?: string;
        /** Gdy true — klik w wiersz bloku czasu (`kind=instructor_event`) prowadzi do edycji. */
        eventEditEnabled?: boolean;
        /** Przekazywane do `/manager/events/:id/edit` jako `?schoolId=` (np. wybór pojazdu). */
        schoolId?: string;
    }>(),
    {
        eventEditEnabled: false,
        schoolId: '',
    },
);

function rowIsClickable(item: ScheduleLessonItem): boolean {
    return props.eventEditEnabled && isScheduleInstructorEvent(item);
}

function buildEventEditRoute(item: ScheduleLessonItem): {
    path: string;
    query?: { schoolId: string };
} {
    const sid = props.schoolId?.trim();

    return {
        path: `/manager/events/${encodeURIComponent(item.id)}/edit`,
        ...(sid ? { query: { schoolId: sid } } : {}),
    };
}

function handleRowClick(item: ScheduleLessonItem): void {
    if (!rowIsClickable(item)) {
        return;
    }

    void navigateTo(buildEventEditRoute(item));
}

function handleRowKeydown(e: KeyboardEvent, item: ScheduleLessonItem): void {
    if (!rowIsClickable(item)) {
        return;
    }

    if (e.key !== 'Enter' && e.key !== ' ') {
        return;
    }

    e.preventDefault();
    void navigateTo(buildEventEditRoute(item));
}

function rowTitle(item: ScheduleLessonItem): string | undefined {
    if (!rowIsClickable(item)) {
        return undefined;
    }

    return 'Otwórz edycję bloku czasu';
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
</script>

<template>
    <div class="overflow-x-auto rounded-lg border">
        <table
            class="w-full min-w-[640px] border-collapse text-sm"
            :aria-label="
                eventEditEnabled
                    ? 'Lista lekcji i bloków czasu; kliknij wiersz bloku, aby edytować'
                    : 'Lista lekcji w wybranym zakresie dat'
            "
        >
            <thead>
                <tr class="bg-muted/50 border-b text-left">
                    <th scope="col" class="px-3 py-2 font-medium">Początek</th>
                    <th scope="col" class="px-3 py-2 font-medium">Koniec</th>
                    <th scope="col" class="px-3 py-2 font-medium">Typ</th>
                    <th scope="col" class="px-3 py-2 font-medium">Status</th>
                    <th scope="col" class="px-3 py-2 font-medium">
                        Instruktor
                    </th>
                    <th scope="col" class="px-3 py-2 font-medium">Kursant</th>
                    <th scope="col" class="px-3 py-2 font-medium">Pojazd</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="props.items.length === 0">
                    <td
                        colspan="7"
                        class="text-muted-foreground px-3 py-6 text-center"
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
                    class="border-border border-t"
                    :class="
                        rowIsClickable(item)
                            ? 'hover:bg-muted/50 focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                            : ''
                    "
                    :tabindex="rowIsClickable(item) ? 0 : undefined"
                    :role="rowIsClickable(item) ? 'link' : undefined"
                    :title="rowTitle(item)"
                    @click="handleRowClick(item)"
                    @keydown="handleRowKeydown($event, item)"
                >
                    <td class="px-3 py-2 whitespace-nowrap">
                        {{ formatIsoLocal(item.startTime) }}
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap">
                        {{ formatIsoLocal(item.endTime) }}
                    </td>
                    <td class="px-3 py-2">{{ item.type }}</td>
                    <td class="px-3 py-2">{{ item.status }}</td>
                    <td class="px-3 py-2">
                        {{ displayPerson(item.instructor) }}
                    </td>
                    <td class="px-3 py-2">
                        {{ displayPerson(item.student) }}
                    </td>
                    <td class="px-3 py-2">
                        {{ displayVehicle(item.vehicle) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
