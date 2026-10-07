<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';

const props = defineProps<{
    schools: readonly DrivingSchool[];
}>();

const heading = computed(() =>
    props.schools.length <= 1 ? 'Twoja szkoła jazdy' : 'Twoje szkoły jazdy',
);
</script>

<template>
    <div class="space-y-4">
        <h2 class="text-foreground text-lg font-semibold tracking-tight">
            {{ heading }}
        </h2>

        <p
            v-if="schools.length === 0"
            class="text-muted-foreground max-w-2xl text-sm leading-relaxed"
            role="status"
        >
            Nie masz jeszcze przypisanej szkoły jazdy. Gdy administrator doda
            Cię do szkoły, zobaczysz ją tutaj.
        </p>

        <div v-else class="space-y-4">
            <div
                v-for="school in schools"
                :key="school.id"
                class="border-border bg-card rounded-2xl border p-5 shadow-sm"
                :aria-label="`Szkoła jazdy: ${school.name}`"
            >
                <SchoolContext
                    :school="school"
                    label="Twój ośrodek"
                    show-address
                />
            </div>
        </div>
    </div>
</template>
