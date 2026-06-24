<script setup lang="ts">
import { BookOpen, Car } from 'lucide-vue-next';
import type { StatusTone } from '~/components/app/ui/types';
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
        emptyMessage: 'Brak zaplanowanych jazd i wykladow w tym tygodniu.',
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
        return 'Teoria';
    }

    if (isPractice(item)) {
        return 'Jazda praktyczna';
    }

    return item.type;
}

function statusLabel(raw: string): string {
    const normalized = raw.trim().toUpperCase();

    if (normalized === 'SCHEDULED' || normalized === 'PLANNED') {
        return 'Plan';
    }

    if (normalized === 'COMPLETED' || normalized === 'DONE') {
        return 'Zakończone';
    }

    if (normalized === 'CANCELLED' || normalized === 'CANCELED') {
        return 'Anulowane';
    }

    if (normalized === 'NO_SHOW') {
        return 'Nieobecnosc';
    }

    return raw;
}

function statusTone(raw: string): StatusTone {
    const normalized = raw.trim().toUpperCase();

    if (normalized === 'SCHEDULED' || normalized === 'PLANNED') {
        return 'info';
    }

    if (normalized === 'COMPLETED' || normalized === 'DONE') {
        return 'success';
    }

    if (normalized === 'CANCELLED' || normalized === 'CANCELED') {
        return 'danger';
    }

    if (normalized === 'NO_SHOW') {
        return 'warning';
    }

    return 'neutral';
}

function displayPerson(person: SchedulePersonRef | undefined): string {
    if (!person) {
        return '';
    }

    return `${person.firstName} ${person.lastName}`.trim();
}

function itemTitle(item: ScheduleLessonItem): string {
    const person = displayPerson(item.instructor);

    if (person) {
        return `${eventTypeLabel(item)} - ${person}`;
    }

    return eventTypeLabel(item);
}

function itemDescription(item: ScheduleLessonItem): string {
    const parts: string[] = [];

    if (item.vehicle && isPractice(item)) {
        const name = item.vehicle.name.trim();
        const reg = item.vehicle.registrationNumber.trim();
        const vehicle = name && reg ? `${name} (${reg})` : name || reg;

        if (vehicle) {
            parts.push(vehicle);
        }
    } else if (isTheory(item) && item.participantCount != null) {
        parts.push(`${item.participantCount} uczestnikow`);
    } else {
        parts.push('Sala lub pojazd przypisany');
    }

    return parts.join(' - ');
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
        <LoadingState v-if="isLoading" title="Wczytywanie lekcji..." />

        <ErrorState v-else-if="errorMessage" :description="errorMessage" />

        <EmptyState
            v-else-if="groups.length === 0"
            title="Brak lekcji"
            :description="emptyMessage"
        />

        <template v-else>
            <section
                v-for="group in groups"
                :key="group.date"
                class="space-y-2"
                :aria-label="`Harmonogram na ${group.label}`"
            >
                <h3
                    class="text-muted-foreground px-1 text-xs font-semibold tracking-wide uppercase"
                >
                    {{ group.label }}
                </h3>

                <ul class="space-y-2">
                    <li
                        v-for="item in group.items"
                        :key="item.id"
                        class="border-border bg-background hover:bg-muted/30 flex flex-col gap-3 rounded-xl border px-3 py-3 transition sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="flex min-w-0 gap-3">
                            <span
                                class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border"
                                :class="
                                    isTheory(item)
                                        ? 'border-violet-200 bg-violet-50 text-violet-700'
                                        : 'border-sky-200 bg-sky-50 text-sky-700'
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
                                <div
                                    class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
                                >
                                    <p
                                        class="text-foreground text-sm leading-5 font-bold"
                                    >
                                        {{ formatTime(item.startTime) }} -
                                        {{ itemTitle(item) }}
                                    </p>
                                    <StatusBadge
                                        :label="statusLabel(item.status)"
                                        :tone="statusTone(item.status)"
                                        subtle
                                    />
                                </div>
                                <p
                                    class="text-muted-foreground mt-1 text-sm leading-5"
                                >
                                    {{ itemDescription(item) }}
                                </p>
                                <p
                                    class="text-muted-foreground mt-1 text-xs tabular-nums"
                                >
                                    {{ displayTimeRange(item) }}
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
                            :aria-label="`Anuluj rezerwację ${displayTimeRange(item)}`"
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
