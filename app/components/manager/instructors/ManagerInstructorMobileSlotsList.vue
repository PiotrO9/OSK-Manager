<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';
import type { AvailabilitySlot } from '~/types/instructors/instructorSlots';
import type {
    ConnectedInstructorSlot,
    ManagerInstructorWeekDay,
} from '~/utils/instructors/managerInstructorWeeklyCalendar';

const props = defineProps<{
    days: { day: ManagerInstructorWeekDay; slots: ConnectedInstructorSlot[] }[];
    bookable: boolean;
    isLoading: boolean;
}>();

const emit = defineEmits<{
    selectSlot: [slot: AvailabilitySlot];
}>();
</script>

<template>
    <div class="space-y-4 sm:hidden">
        <div
            v-if="props.isLoading"
            class="space-y-3"
            role="status"
            aria-live="polite"
        >
            <span class="sr-only">Ładowanie wolnych terminów</span>
            <UiSkeleton class="h-6 w-32" />
            <UiSkeleton class="h-16 w-full" />
            <UiSkeleton class="h-16 w-full" />
        </div>

        <div
            v-else-if="props.days.length === 0"
            class="border-border bg-muted/20 rounded-xl border px-4 py-8 text-center"
            role="status"
        >
            <p class="text-foreground text-sm font-semibold">
                Brak wolnych terminów w tym tygodniu
            </p>
            <p class="text-muted-foreground mt-1 text-xs">
                Sprawdź kolejny tydzień, aby zobaczyć następne terminy.
            </p>
        </div>

        <template v-else>
            <section
                v-for="entry in props.days"
                :key="entry.day.dateStr"
                class="space-y-2"
                :aria-label="entry.day.header"
            >
                <div class="flex items-center justify-between gap-2">
                    <h3
                        class="text-foreground text-sm font-semibold capitalize"
                    >
                        {{ entry.day.header }}
                        <span
                            v-if="entry.day.isToday"
                            class="text-primary ml-1"
                        >
                            · dziś
                        </span>
                    </h3>
                    <span class="text-muted-foreground text-xs tabular-nums">
                        Wolnych terminów: {{ entry.slots.length }}
                    </span>
                </div>

                <div class="flex flex-col">
                    <template
                        v-for="connected in entry.slots"
                        :key="`${connected.slot.date}-${connected.slot.startTime}-${connected.slot.endTime}`"
                    >
                        <button
                            v-if="props.bookable"
                            type="button"
                            class="focus-visible:ring-ring relative flex min-h-14 w-full items-center justify-between gap-3 border border-sky-400 bg-sky-50 px-4 py-3 text-left text-sky-950 transition-colors hover:bg-sky-100 focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
                            :class="[
                                connected.joinsPrevious
                                    ? 'rounded-t-none border-t-0'
                                    : 'mt-2 rounded-t-lg first:mt-0',
                                connected.joinsNext
                                    ? 'rounded-b-none'
                                    : 'rounded-b-lg',
                            ]"
                            :aria-label="`Zarezerwuj lekcję ${connected.slot.date}, ${connected.slot.startTime} do ${connected.slot.endTime}`"
                            @click="emit('selectSlot', connected.slot)"
                        >
                            <span class="font-semibold tabular-nums">
                                {{ connected.slot.startTime }}–{{
                                    connected.slot.endTime
                                }}
                            </span>
                            <span
                                class="flex items-center gap-1 text-xs font-medium"
                            >
                                Dodaj lekcję
                                <ArrowUpRight
                                    class="size-4"
                                    aria-hidden="true"
                                />
                            </span>
                        </button>
                        <div
                            v-else
                            class="flex min-h-14 items-center border border-sky-400 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-950"
                            :class="[
                                connected.joinsPrevious
                                    ? 'rounded-t-none border-t-0'
                                    : 'mt-2 rounded-t-lg first:mt-0',
                                connected.joinsNext
                                    ? 'rounded-b-none'
                                    : 'rounded-b-lg',
                            ]"
                            role="group"
                            :aria-label="`Wolny slot ${connected.slot.startTime} do ${connected.slot.endTime}`"
                        >
                            {{ connected.slot.startTime }}–{{
                                connected.slot.endTime
                            }}
                        </div>
                    </template>
                </div>
            </section>
        </template>
    </div>
</template>
