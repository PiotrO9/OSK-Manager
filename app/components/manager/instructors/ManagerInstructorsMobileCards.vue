<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';

defineProps<{
    instructors: InstructorListItem[];
    instructorDetailsTo: (instructor: InstructorListItem) => RouteLocationRaw;
    instructorQualificationLabel: (instructor: InstructorListItem) => string;
    instructorInitials: (instructor: InstructorListItem) => string;
}>();
</script>

<template>
    <div class="space-y-3 md:hidden">
        <article
            v-for="instructor in instructors"
            :key="instructor.id"
            class="border-border rounded-2xl border p-4"
        >
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <p class="truncate font-extrabold">
                        {{ formatInstructorDisplayName(instructor) }}
                    </p>
                    <p class="text-muted-foreground mt-1 text-sm break-all">
                        {{ instructor.email || '—' }}
                    </p>
                </div>
                <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700"
                >
                    {{ instructorInitials(instructor) }}
                </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
                <UiBadge
                    variant="outline"
                    class="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                    Konto
                </UiBadge>
                <UiBadge variant="outline" class="bg-muted/40 rounded-full">
                    {{ instructorQualificationLabel(instructor) }}
                </UiBadge>
            </div>

            <div class="mt-4">
                <UiButton
                    as-child
                    variant="outline"
                    size="sm"
                    class="w-full rounded-xl"
                >
                    <NuxtLink
                        :to="instructorDetailsTo(instructor)"
                        :aria-label="`Otwórz szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                    >
                        Szczegóły
                    </NuxtLink>
                </UiButton>
            </div>
        </article>
    </div>
</template>
