<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

defineProps<{
    school: DrivingSchool;
}>();
</script>

<template>
    <div
        class="border-border bg-card overflow-hidden rounded-2xl border p-4 shadow-sm md:p-5"
        :aria-label="`Karta domyślnego OSK: ${school.name}`"
    >
        <div
            class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
            <SchoolContext
                :school="school"
                label="Domyślny ośrodek"
                show-address
            />

            <NuxtLink
                to="/manager/osk"
                class="border-border text-foreground hover:bg-muted/60 focus-visible:ring-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border bg-white px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-transparent"
            >
                Zarządzaj szkołami
                <ChevronRight class="size-4" aria-hidden="true" />
            </NuxtLink>
        </div>
    </div>
</template>
