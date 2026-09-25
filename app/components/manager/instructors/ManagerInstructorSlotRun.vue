<script setup lang="ts">
import type { AvailabilitySlot } from '~/types/instructors/instructorSlots';
import {
    getManagerInstructorSlotHeightPx,
    getManagerInstructorSlotTopPx,
    type ManagerInstructorSlotRun,
} from '~/utils/instructors/managerInstructorWeeklyCalendar';

const props = defineProps<{
    run: ManagerInstructorSlotRun;
    baseHour: number;
    bookable: boolean;
    isLoading: boolean;
}>();

const emit = defineEmits<{
    selectSlot: [slot: AvailabilitySlot];
}>();

const runTop = computed(() =>
    getManagerInstructorSlotTopPx(props.run.startTime, props.baseHour),
);
const runHeight = computed(() => getManagerInstructorSlotHeightPx(props.run));

function slotStyle(slot: AvailabilitySlot) {
    return {
        top: `${getManagerInstructorSlotTopPx(slot.startTime, props.baseHour) - runTop.value}px`,
        height: `${getManagerInstructorSlotHeightPx(slot)}px`,
    };
}
</script>

<template>
    <div
        class="absolute right-1.5 left-1.5 overflow-hidden rounded-lg border border-sky-400 bg-sky-50 text-xs leading-tight text-sky-950 shadow-sm shadow-sky-100"
        :style="{ top: `${runTop}px`, height: `${runHeight}px` }"
        role="group"
        :aria-label="`Wolny przedział ${props.run.date}, ${props.run.startTime} do ${props.run.endTime}`"
    >
        <div class="pointer-events-none absolute inset-x-2 top-1 z-10">
            <span class="block font-extrabold">Wolny</span>
            <span class="block truncate tabular-nums">
                {{ props.run.startTime }}–{{ props.run.endTime }}
            </span>
        </div>
        <button
            v-for="slot in props.bookable ? props.run.slots : []"
            :key="`${slot.date}-${slot.startTime}-${slot.endTime}`"
            type="button"
            class="focus-visible:ring-ring absolute inset-x-0 cursor-pointer bg-transparent transition-colors hover:bg-sky-100/50 focus-visible:z-20 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
            :style="slotStyle(slot)"
            :title="`Zarezerwuj jazdę ${slot.startTime}-${slot.endTime}`"
            :aria-label="`Zarezerwuj jazdę ${slot.date}, ${slot.startTime} do ${slot.endTime}`"
            :disabled="props.isLoading"
            @click="emit('selectSlot', slot)"
        />
    </div>
</template>
