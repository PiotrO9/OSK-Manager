<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';

defineProps<{
    instructorsCount: number;
    activeSchool: DrivingSchool | null;
    instructorsWithQualificationsCount: number;
    uniqueQualificationCodesCount: number;
}>();
</script>

<template>
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
        >
            <p class="text-muted-foreground text-sm font-medium">
                Instruktorzy
            </p>
            <p class="text-foreground mt-2 text-3xl font-extrabold">
                {{ instructorsCount }}
            </p>
        </div>
        <div
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
        >
            <p class="text-muted-foreground text-sm font-medium">OSK</p>
            <p class="text-foreground mt-2 text-3xl font-extrabold">
                {{ activeSchool ? '1' : '0' }}
            </p>
        </div>
        <div
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
        >
            <p class="text-muted-foreground text-sm font-medium">
                Z kwalifikacjami
            </p>
            <p class="text-foreground mt-2 text-3xl font-extrabold">
                {{ instructorsWithQualificationsCount }}
            </p>
        </div>
        <div
            class="border-border bg-background rounded-2xl border p-4 shadow-sm"
        >
            <p class="text-muted-foreground text-sm font-medium">Kategorie</p>
            <p class="text-foreground mt-2 text-3xl font-extrabold">
                {{ uniqueQualificationCodesCount }}
            </p>
        </div>
    </div>
</template>
