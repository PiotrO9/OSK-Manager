<script setup lang="ts">
import { Clock, UserRound } from 'lucide-vue-next';
import type { SchoolAvailabilitySlot } from '~/types/schoolAvailabilitySlots';

const props = defineProps<{
    slots: SchoolAvailabilitySlot[];
    isLoading: boolean;
    errorMessage: string | null;
    selectedCourseId: string;
    bookingSlotKey: string | null;
}>();

const emit = defineEmits<{
    book: [slot: SchoolAvailabilitySlot];
}>();

interface SlotGroup {
    date: string;
    label: string;
    slots: SchoolAvailabilitySlot[];
}

function formatDateLabel(date: string): string {
    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(d);
}

function instructorName(slot: SchoolAvailabilitySlot): string {
    return `${slot.instructorFirstName} ${slot.instructorLastName}`.trim();
}

function slotKey(slot: SchoolAvailabilitySlot): string {
    return `${slot.date}|${slot.startTime}|${slot.endTime}|${slot.instructorId}`;
}

const groups = computed<SlotGroup[]>(() => {
    const byDate = new Map<string, SchoolAvailabilitySlot[]>();

    for (const slot of props.slots) {
        const list = byDate.get(slot.date) ?? [];

        list.push(slot);
        byDate.set(slot.date, list);
    }

    return Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, slots]) => ({
            date,
            label: formatDateLabel(date),
            slots: [...slots].sort((a, b) => {
                const byTime = a.startTime.localeCompare(b.startTime);

                if (byTime !== 0) {
                    return byTime;
                }

                return instructorName(a).localeCompare(instructorName(b));
            }),
        }));
});
</script>

<template>
    <section class="border-border rounded-lg border p-4 md:p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
            <div class="min-w-0">
                <h2 class="text-foreground text-sm font-medium">
                    Dostepne sloty
                </h2>
                <p class="text-muted-foreground text-sm">
                    {{ slots.length }} terminow w wybranym zakresie
                </p>
            </div>
            <UiBadge v-if="isLoading" variant="secondary">Ladowanie</UiBadge>
        </div>

        <p v-if="!selectedCourseId" class="text-muted-foreground text-sm">
            Wybierz kurs, zeby zobaczyc dostepne terminy.
        </p>

        <p
            v-else-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ errorMessage }}
        </p>

        <p
            v-else-if="isLoading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie terminow...
        </p>

        <p
            v-else-if="groups.length === 0"
            class="text-muted-foreground text-sm"
        >
            Brak wolnych terminow w tym tygodniu.
        </p>

        <div v-else class="space-y-5">
            <div v-for="group in groups" :key="group.date" class="space-y-2">
                <h3 class="text-foreground text-sm font-semibold capitalize">
                    {{ group.label }}
                </h3>

                <div class="grid gap-2">
                    <article
                        v-for="slot in group.slots"
                        :key="slotKey(slot)"
                        class="border-border flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="min-w-0 space-y-1">
                            <div
                                class="text-foreground flex items-center gap-2 text-sm font-medium"
                            >
                                <Clock
                                    class="size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                <span>
                                    {{ slot.startTime }} - {{ slot.endTime }}
                                </span>
                            </div>
                            <div
                                class="text-muted-foreground flex items-center gap-2 text-sm"
                            >
                                <UserRound
                                    class="size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                <span class="truncate">
                                    {{ instructorName(slot) }}
                                </span>
                            </div>
                        </div>

                        <UiButton
                            type="button"
                            size="sm"
                            class="w-full sm:w-auto"
                            :disabled="
                                bookingSlotKey !== null &&
                                bookingSlotKey !== slotKey(slot)
                            "
                            @click="emit('book', slot)"
                        >
                            {{
                                bookingSlotKey === slotKey(slot)
                                    ? 'Rezerwowanie'
                                    : 'Zarezerwuj'
                            }}
                        </UiButton>
                    </article>
                </div>
            </div>
        </div>
    </section>
</template>
