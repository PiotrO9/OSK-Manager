<script setup lang="ts">
import type { Component } from 'vue';
import { Bike, BusFront, CarFront, Tractor, Truck } from 'lucide-vue-next';

const props = defineProps<{
    categoryCode?: string | null;
}>();

const iconsByCategory: Record<string, Component> = {
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

const categoryCode = computed(
    () => props.categoryCode?.trim().toUpperCase() ?? '',
);
const icon = computed(() => iconsByCategory[categoryCode.value] ?? CarFront);
const iconLabel = computed(() =>
    categoryCode.value
        ? `Pojazd dla kategorii ${categoryCode.value}`
        : 'Pojazd',
);
</script>

<template>
    <component
        :is="icon"
        :aria-label="iconLabel"
        :title="iconLabel"
        aria-hidden="true"
    />
</template>
