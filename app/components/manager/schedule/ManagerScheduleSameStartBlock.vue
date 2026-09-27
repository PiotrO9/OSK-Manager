<script setup lang="ts">
import { Layers3 } from 'lucide-vue-next';
import type { ScheduleSameStartGroup } from '~/utils/schedule/managerScheduleSameStartGroups';
import { formatScheduleSameStartGroupLabel } from '~/utils/schedule/managerScheduleSameStartGroups';
import { isTheoryLessonType } from '~/utils/schedule/managerScheduleCalendarUtils';

const props = defineProps<{
    group: ScheduleSameStartGroup;
    dayLabel: string;
}>();

const emit = defineEmits<{ select: [group: ScheduleSameStartGroup] }>();

const label = computed(() => formatScheduleSameStartGroupLabel(props.group));
const allTheory = computed(() =>
    props.group.items.every((item) => isTheoryLessonType(item.type)),
);
</script>

<template>
    <button
        type="button"
        class="schedule-same-start-block focus-visible:ring-ring absolute inset-x-1.5 flex cursor-pointer flex-col justify-center overflow-hidden rounded-md border px-2 py-1 text-left text-xs shadow-sm transition-colors hover:shadow-lg focus-visible:shadow-lg focus-visible:ring-2 focus-visible:outline-none"
        :class="
            allTheory
                ? 'border-warning-500/60 bg-warning-100 text-warning-950 hover:bg-warning-50 focus-visible:bg-warning-50'
                : 'border-primary-500/60 bg-primary-100 text-primary-950 hover:bg-primary-50 focus-visible:bg-primary-50'
        "
        :style="{
            top: `${group.topPx}px`,
            '--schedule-block-height': `${group.heightPx}px`,
        }"
        :aria-label="`${dayLabel}, ${label}. Pokaż wszystkie pozycje`"
        @click="emit('select', group)"
    >
        <span class="flex items-center gap-1 font-semibold tabular-nums">
            <Layers3 class="size-3.5 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ label }}</span>
        </span>
        <span class="mt-0.5 truncate opacity-80">Pokaż wszystkie</span>
    </button>
</template>

<style scoped>
.schedule-same-start-block {
    height: var(--schedule-block-height);
    min-height: var(--schedule-block-height);
}

.schedule-same-start-block:hover,
.schedule-same-start-block:focus-visible {
    z-index: 30;
    height: auto;
}

.schedule-same-start-block:hover .truncate,
.schedule-same-start-block:focus-visible .truncate {
    text-overflow: clip;
    white-space: normal;
    overflow-wrap: anywhere;
}
</style>
