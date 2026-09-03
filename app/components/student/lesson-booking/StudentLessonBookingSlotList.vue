<script setup lang="ts">
import { Clock, UserRound } from 'lucide-vue-next';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';

const props = defineProps<{
    slots: SchoolAvailabilitySlot[];
    isLoading: boolean;
    errorMessage: string | null;
    selectedCourseId: string;
    bookingSlotKey: string | null;
    weekStartDate: string;
}>();

const emit = defineEmits<{
    book: [slot: SchoolAvailabilitySlot];
}>();

const {
    bestDayLabel,
    groups,
    nonEmptyGroups,
    scheduleGridColumns,
    scheduleRows,
} = useStudentLessonBookingSlotList(props);

const instructorName = getStudentLessonBookingInstructorName;
const slotKey = getStudentLessonBookingSlotListSlotKey;
</script>

<template>
    <section class="space-y-4">
        <p v-if="!selectedCourseId" class="text-muted-foreground text-sm">
            Wybierz kurs, żeby zobaczyć dostępne terminy.
        </p>

        <ErrorState
            v-else-if="errorMessage"
            title="Nie udało się wczytać terminów"
            :description="errorMessage"
        />

        <div v-else-if="isLoading" class="space-y-3" role="status">
            <UiSkeleton class="h-16 rounded-xl" />
            <UiSkeleton class="h-16 rounded-xl" />
            <UiSkeleton class="h-16 rounded-xl" />
        </div>

        <EmptyState
            v-else-if="slots.length === 0"
            title="Brak wolnych terminów"
            description="W tym tygodniu nie ma dostępnych slotów dla wybranego kursu."
        />

        <div v-else class="space-y-3">
            <div class="hidden overflow-hidden rounded-2xl border md:block">
                <div class="overflow-x-auto">
                    <div class="min-w-[700px]">
                        <div
                            class="bg-muted/40 border-border grid border-b"
                            :style="{
                                gridTemplateColumns: scheduleGridColumns,
                            }"
                        >
                            <div
                                class="text-muted-foreground flex h-16 items-end px-3 pb-3 text-xs font-semibold"
                            >
                                Godz.
                            </div>
                            <div
                                v-for="group in groups"
                                :key="group.date"
                                class="border-border flex flex-col items-center justify-center border-l px-2 py-3 text-center"
                                :class="
                                    group.isToday
                                        ? 'bg-sky-50 text-sky-900'
                                        : ''
                                "
                            >
                                <p class="text-xs font-extrabold capitalize">
                                    {{ group.shortLabel }}
                                </p>
                                <p
                                    v-if="group.isToday"
                                    class="text-xs font-semibold text-sky-700"
                                >
                                    dziś
                                </p>
                            </div>
                        </div>

                        <div
                            v-for="row in scheduleRows"
                            :key="row.hour"
                            class="border-border grid min-h-24 border-b last:border-b-0"
                            :style="{
                                gridTemplateColumns: scheduleGridColumns,
                            }"
                        >
                            <div
                                class="text-muted-foreground flex items-start justify-end px-3 py-3 text-xs font-semibold"
                            >
                                {{ row.label }}
                            </div>
                            <div
                                v-for="cell in row.cells"
                                :key="cell.key"
                                class="border-border min-h-24 space-y-2 border-l p-2"
                            >
                                <button
                                    v-for="slot in cell.slots"
                                    :key="slotKey(slot)"
                                    type="button"
                                    class="w-full rounded-xl border border-sky-300 bg-sky-50 p-2 text-left text-sky-950 shadow-sm transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    :disabled="
                                        bookingSlotKey !== null &&
                                        bookingSlotKey !== slotKey(slot)
                                    "
                                    @click="emit('book', slot)"
                                >
                                    <span class="block text-sm font-extrabold">
                                        {{
                                            bookingSlotKey === slotKey(slot)
                                                ? 'Rezerwowanie'
                                                : 'Dostępny'
                                        }}
                                    </span>
                                    <span
                                        class="mt-0.5 block truncate text-xs font-semibold text-sky-700"
                                    >
                                        {{ instructorName(slot) }}
                                    </span>
                                    <span class="mt-0.5 block text-xs">
                                        {{ slot.startTime }}-{{ slot.endTime }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-4 md:hidden">
                <div
                    v-for="group in nonEmptyGroups"
                    :key="group.date"
                    class="space-y-2"
                >
                    <h3
                        class="text-foreground text-sm font-semibold capitalize"
                    >
                        {{ group.label }}
                    </h3>

                    <article
                        v-for="slot in group.slots"
                        :key="slotKey(slot)"
                        class="border-border flex flex-col gap-3 rounded-xl border p-3"
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
                            class="w-full"
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

            <div v-if="bestDayLabel" class="flex justify-end">
                <UiBadge
                    variant="outline"
                    class="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700"
                >
                    {{ bestDayLabel }}
                </UiBadge>
            </div>
        </div>
    </section>
</template>
