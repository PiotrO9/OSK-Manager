<script setup lang="ts">
import { BookOpen, Car } from 'lucide-vue-next';
import type { ScheduleLessonItem, SchedulePersonRef } from '~/types/schedule';

interface ScheduleDayGroup {
    date: string;
    label: string;
    items: ScheduleLessonItem[];
}

const props = withDefaults(
    defineProps<{
        items: readonly ScheduleLessonItem[];
        isLoading?: boolean;
        errorMessage?: string | null;
        emptyMessage?: string;
        studentLessonCancelEnabled?: boolean;
        cancellingLessonId?: string | null;
    }>(),
    {
        isLoading: false,
        errorMessage: null,
        emptyMessage: 'Brak zaplanowanych jazd i wykładów w tym tygodniu.',
        studentLessonCancelEnabled: false,
        cancellingLessonId: null,
    },
);

const emit = defineEmits<{
    'request-cancel-lesson': [item: ScheduleLessonItem];
}>();

const groups = computed<ScheduleDayGroup[]>(() => {
    const map = new Map<string, ScheduleLessonItem[]>();

    for (const item of props.items) {
        const dateKey = dateKeyFromIso(item.startTime);

        if (!dateKey) {
            continue;
        }

        const groupItems = map.get(dateKey) ?? [];

        groupItems.push(item);
        map.set(dateKey, groupItems);
    }

    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, items]) => ({
            date,
            label: formatDateLabel(date),
            items: [...items].sort((a, b) =>
                a.startTime.localeCompare(b.startTime),
            ),
        }));
});

function dateKeyFromIso(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso.slice(0, 10);
    }

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(dateKey: string): string {
    const d = new Date(`${dateKey}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return dateKey;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

function formatTime(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

function displayTimeRange(item: ScheduleLessonItem): string {
    return `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`;
}

function isTheory(item: ScheduleLessonItem): boolean {
    return item.type.trim().toUpperCase() === 'THEORY';
}

function isPractice(item: ScheduleLessonItem): boolean {
    return item.type.trim().toUpperCase() === 'PRACTICE';
}

function eventTypeLabel(item: ScheduleLessonItem): string {
    if (isTheory(item)) {
        return 'Wykład';
    }

    if (isPractice(item)) {
        return 'Jazda';
    }

    return item.type;
}

function statusLabel(raw: string): string {
    const normalized = raw.trim().toUpperCase();

    if (normalized === 'SCHEDULED' || normalized === 'PLANNED') {
        return 'Zaplanowane';
    }

    if (normalized === 'COMPLETED' || normalized === 'DONE') {
        return 'Zakończone';
    }

    if (normalized === 'CANCELLED') {
        return 'Anulowane';
    }

    return raw;
}

function displayPerson(person: SchedulePersonRef | undefined): string {
    if (!person) {
        return '';
    }

    return `${person.firstName} ${person.lastName}`.trim();
}

function itemDescription(item: ScheduleLessonItem): string {
    const parts: string[] = [];
    const instructor = displayPerson(item.instructor);

    if (instructor) {
        parts.push(`Instruktor: ${instructor}`);
    }

    if (item.vehicle && isPractice(item)) {
        const name = item.vehicle.name.trim();
        const reg = item.vehicle.registrationNumber.trim();
        const vehicle = name && reg ? `${name} (${reg})` : name || reg;

        if (vehicle) {
            parts.push(`Pojazd: ${vehicle}`);
        }
    }

    if (isTheory(item) && item.participantCount != null) {
        parts.push(`Uczestnicy: ${item.participantCount}`);
    }

    return parts.join(' · ');
}

function isStudentCancellableLesson(item: ScheduleLessonItem): boolean {
    return (
        props.studentLessonCancelEnabled &&
        item.kind === 'lesson' &&
        isPractice(item) &&
        item.status.trim().toUpperCase() === 'SCHEDULED'
    );
}

function handleCancelClick(item: ScheduleLessonItem): void {
    emit('request-cancel-lesson', item);
}
</script>

<template>
    <div class="space-y-4">
        <p v-if="isLoading" class="text-muted-foreground text-sm" role="status">
            Wczytywanie...
        </p>

        <p
            v-else-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ errorMessage }}
        </p>

        <p
            v-else-if="groups.length === 0"
            class="text-muted-foreground rounded-lg border px-4 py-6 text-center text-sm"
            role="status"
        >
            {{ emptyMessage }}
        </p>

        <template v-else>
            <section
                v-for="group in groups"
                :key="group.date"
                class="border-border overflow-hidden rounded-lg border"
                :aria-label="`Harmonogram na ${group.label}`"
            >
                <header class="bg-muted/40 border-border border-b px-4 py-3">
                    <h2
                        class="text-foreground text-sm font-semibold capitalize"
                    >
                        {{ group.label }}
                    </h2>
                </header>

                <ul class="divide-border divide-y">
                    <li
                        v-for="item in group.items"
                        :key="item.id"
                        class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="flex min-w-0 gap-3">
                            <span
                                class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border"
                                :class="
                                    isTheory(item)
                                        ? 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-200'
                                        : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                                "
                                aria-hidden="true"
                            >
                                <BookOpen
                                    v-if="isTheory(item)"
                                    class="size-4"
                                />
                                <Car v-else class="size-4" />
                            </span>

                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2">
                                    <p
                                        class="text-foreground text-sm font-medium"
                                    >
                                        {{ displayTimeRange(item) }}
                                    </p>
                                    <UiBadge variant="secondary">
                                        {{ eventTypeLabel(item) }}
                                    </UiBadge>
                                    <UiBadge variant="outline">
                                        {{ statusLabel(item.status) }}
                                    </UiBadge>
                                </div>
                                <p
                                    v-if="itemDescription(item)"
                                    class="text-muted-foreground mt-1 text-sm"
                                >
                                    {{ itemDescription(item) }}
                                </p>
                            </div>
                        </div>

                        <UiButton
                            v-if="isStudentCancellableLesson(item)"
                            type="button"
                            variant="destructive"
                            size="sm"
                            class="shrink-0"
                            :disabled="cancellingLessonId === item.id"
                            :aria-busy="cancellingLessonId === item.id"
                            :aria-label="`Anuluj rezerwacje ${displayTimeRange(item)}`"
                            @click="handleCancelClick(item)"
                        >
                            {{
                                cancellingLessonId === item.id
                                    ? 'Anulowanie...'
                                    : 'Anuluj'
                            }}
                        </UiButton>
                    </li>
                </ul>
            </section>
        </template>
    </div>
</template>
