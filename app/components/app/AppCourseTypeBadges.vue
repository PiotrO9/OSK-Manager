<script setup lang="ts">
import type { Component } from 'vue';
import {
    Bike,
    BusFront,
    CarFront,
    CircleHelp,
    Tractor,
    Truck,
} from 'lucide-vue-next';
import type { CourseTypeOption } from '~/types/courses/courseType';

interface Props {
    courseTypes: readonly CourseTypeOption[];
    groupLabel: string;
    emptyLabel: string;
}

const props = defineProps<Props>();

const iconsByCourseType: Record<string, Component> = {
    AM: Bike,
    A: Bike,
    A1: Bike,
    A2: Bike,
    B: CarFront,
    B1: CarFront,
    BE: CarFront,
    C: Truck,
    C1: Truck,
    CE: Truck,
    C1E: Truck,
    D: BusFront,
    D1: BusFront,
    DE: BusFront,
    D1E: BusFront,
    T: Tractor,
};

function courseTypeCode(courseType: CourseTypeOption): string {
    return courseType.code.trim() || courseType.name.trim();
}

function iconForCourseType(courseType: CourseTypeOption): Component {
    return (
        iconsByCourseType[courseTypeCode(courseType).toUpperCase()] ??
        CircleHelp
    );
}

function courseTypeLabel(courseType: CourseTypeOption): string {
    const code = courseTypeCode(courseType);
    const name = courseType.name.trim();

    return name && name !== code ? `${code} — ${name}` : code;
}
</script>

<template>
    <div
        v-if="props.courseTypes.length > 0"
        class="flex flex-wrap items-center gap-1.5"
        :aria-label="props.groupLabel"
    >
        <span
            v-for="courseType in props.courseTypes"
            :key="courseType.id"
            class="border-primary/25 bg-primary/5 text-primary dark:border-primary-300/30 dark:bg-primary-300/10 dark:text-primary-200 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold"
            :title="courseTypeLabel(courseType)"
            :aria-label="courseTypeLabel(courseType)"
        >
            <component
                :is="iconForCourseType(courseType)"
                class="size-3.5 shrink-0"
                aria-hidden="true"
            />
            <span>{{ courseTypeCode(courseType) }}</span>
        </span>
    </div>
    <StatusBadge v-else :label="props.emptyLabel" tone="neutral" subtle />
</template>
