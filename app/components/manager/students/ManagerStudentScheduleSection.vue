<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    displayScheduleVehicle,
    formatScheduleLessonDateTime,
    labelForScheduleLessonStatus,
    labelForScheduleLessonType,
} from '~/utils/schedule/managerScheduleLessonTable';

defineProps<{
    dateFrom: string;
    dateTo: string;
    weekStart: Date;
    items: readonly ScheduleLessonItem[];
    isLoading: boolean;
    error: string | null;
}>();

const emit = defineEmits<{
    prevWeek: [];
    nextWeek: [];
}>();

function formatShortDate(value: string): string {
    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
    }).format(d);
}

function formatScheduleWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

function displayPerson(
    person: ScheduleLessonItem['instructor'] | undefined,
): string {
    if (!person) {
        return '-';
    }

    const name = [person.firstName, person.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' ');

    return name.length > 0 ? name : '-';
}
</script>

<template>
    <section
        aria-labelledby="student-schedule-heading"
        class="border-border bg-card min-w-0 rounded-lg border shadow-xs"
    >
        <div
            class="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
            <div class="space-y-1">
                <h2
                    id="student-schedule-heading"
                    class="text-foreground text-base font-semibold"
                >
                    Terminarz lekcji
                </h2>
                <p class="text-muted-foreground text-sm">
                    Lekcje przypisane do kursanta w wybranym tygodniu.
                </p>
            </div>
            <StatusBadge
                :label="`${formatShortDate(dateFrom)} - ${formatShortDate(dateTo)}`"
                tone="neutral"
                subtle
                class="w-fit"
            />
        </div>
        <div class="p-5">
            <div
                class="mb-4 flex flex-wrap items-center gap-2"
                role="group"
                aria-label="Nawigacja tygodnia terminarza"
            >
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="rounded-lg"
                    aria-label="Poprzedni tydzień"
                    @click="emit('prevWeek')"
                >
                    Poprzedni
                </UiButton>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="rounded-lg"
                    aria-label="Następny tydzień"
                    @click="emit('nextWeek')"
                >
                    Następny
                </UiButton>
                <span class="text-muted-foreground text-sm">
                    Tydzień od
                    {{ formatScheduleWeekLabel(weekStart) }}
                </span>
            </div>
            <p
                v-if="isLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie lekcji...
            </p>
            <p v-else-if="error" class="text-destructive text-sm" role="alert">
                {{ error }}
            </p>
            <template v-else>
                <div class="hidden md:block">
                    <ManagerScheduleLessonTable :items="items" />
                </div>
                <div class="md:hidden">
                    <p
                        v-if="items.length === 0"
                        class="border-border bg-background text-muted-foreground rounded-lg border px-4 py-8 text-center text-sm"
                        role="status"
                    >
                        Brak lekcji w wybranym zakresie dat.
                    </p>
                    <ul v-else class="space-y-3" role="list">
                        <li
                            v-for="item in items"
                            :key="item.id"
                            class="border-border bg-background rounded-lg border p-4"
                        >
                            <div
                                class="flex min-w-0 items-start justify-between gap-3"
                            >
                                <div class="min-w-0">
                                    <p
                                        class="text-foreground text-sm font-semibold wrap-break-word"
                                    >
                                        {{
                                            formatScheduleLessonDateTime(
                                                item.startTime,
                                            )
                                        }}
                                        -
                                        {{
                                            formatScheduleLessonDateTime(
                                                item.endTime,
                                            )
                                        }}
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-1 text-xs"
                                    >
                                        {{
                                            labelForScheduleLessonType(
                                                item.type,
                                            )
                                        }}
                                    </p>
                                </div>
                                <StatusBadge
                                    :label="
                                        labelForScheduleLessonStatus(
                                            item.status,
                                        )
                                    "
                                    tone="neutral"
                                    subtle
                                />
                            </div>
                            <dl class="mt-4 grid gap-3 text-sm">
                                <div>
                                    <dt class="text-muted-foreground text-xs">
                                        Instruktor
                                    </dt>
                                    <dd class="text-foreground mt-1">
                                        {{ displayPerson(item.instructor) }}
                                    </dd>
                                </div>
                                <div>
                                    <dt class="text-muted-foreground text-xs">
                                        Pojazd
                                    </dt>
                                    <dd class="text-foreground mt-1">
                                        {{
                                            displayScheduleVehicle(item.vehicle)
                                        }}
                                    </dd>
                                </div>
                            </dl>
                        </li>
                    </ul>
                </div>
            </template>
        </div>
    </section>
</template>
