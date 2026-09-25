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

const props = defineProps<{
    qualifications: readonly CourseTypeOption[];
}>();

const iconsByQualification: Record<string, Component> = {
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

function qualificationCode(qualification: CourseTypeOption): string {
    return qualification.code.trim() || qualification.name.trim();
}

function iconForQualification(qualification: CourseTypeOption): Component {
    return (
        iconsByQualification[qualificationCode(qualification).toUpperCase()] ??
        CircleHelp
    );
}

function qualificationLabel(qualification: CourseTypeOption): string {
    const code = qualificationCode(qualification);
    const name = qualification.name.trim();

    return name && name !== code ? `${code} — ${name}` : code;
}
</script>

<template>
    <div
        v-if="props.qualifications.length > 0"
        class="flex flex-wrap items-center gap-1.5"
        aria-label="Kwalifikacje instruktora"
    >
        <span
            v-for="qualification in props.qualifications"
            :key="qualification.id"
            class="border-primary/25 bg-primary/5 text-primary dark:border-primary-300/30 dark:bg-primary-300/10 dark:text-primary-200 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold"
            :title="qualificationLabel(qualification)"
            :aria-label="qualificationLabel(qualification)"
        >
            <component
                :is="iconForQualification(qualification)"
                class="size-3.5 shrink-0"
                aria-hidden="true"
            />
            <span>{{ qualificationCode(qualification) }}</span>
        </span>
    </div>
    <StatusBadge v-else label="Brak kwalifikacji" tone="neutral" subtle />
</template>
