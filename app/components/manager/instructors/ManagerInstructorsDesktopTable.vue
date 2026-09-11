<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import AppListAvatar from '~/components/app/AppListAvatar.vue';
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
    <table class="hidden w-full table-fixed text-left text-sm @3xl:table">
        <caption class="sr-only">
            Instruktorzy: dane kontaktowe, kwalifikacje i akcje.
        </caption>
        <thead
            class="border-border bg-muted/30 text-muted-foreground border-b text-xs"
        >
            <tr>
                <th scope="col" class="w-[32%] px-5 py-3 font-medium">
                    Instruktor
                </th>
                <th scope="col" class="w-[30%] px-4 py-3 font-medium">
                    Kontakt
                </th>
                <th scope="col" class="w-[16%] px-4 py-3 font-medium">
                    Kwalifikacje
                </th>
                <th
                    scope="col"
                    class="w-[22%] px-5 py-3 text-right font-medium"
                >
                    Akcje
                </th>
            </tr>
        </thead>
        <tbody class="divide-border divide-y">
            <tr
                v-for="instructor in instructors"
                :key="instructor.id"
                class="group hover:bg-muted/30 focus-within:bg-muted/30 transition-colors"
            >
                <th scope="row" class="px-5 py-3 text-left font-normal">
                    <div class="flex min-w-0 items-center gap-3">
                        <AppListAvatar
                            :src="instructor.avatarUrl"
                            :initials="instructorInitials(instructor)"
                            :size="36"
                        />
                        <div class="min-w-0 space-y-1">
                            <NuxtLink
                                :to="instructorDetailsTo(instructor)"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-foreground hover:text-primary dark:hover:text-primary-300 focus-visible:ring-ring block rounded-sm font-semibold wrap-anywhere underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                                :aria-label="`Otwórz szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                                >{{
                                    formatInstructorDisplayName(instructor)
                                }}</NuxtLink
                            >
                            <p class="text-muted-foreground text-xs">
                                Instruktor OSK
                            </p>
                        </div>
                    </div>
                </th>
                <td class="px-4 py-3">
                    <div class="space-y-1.5 text-xs">
                        <p class="text-foreground wrap-anywhere">
                            {{ instructor.email || 'Brak e-maila' }}
                        </p>
                        <p class="text-muted-foreground tabular-nums">
                            {{ instructor.phone || 'Brak telefonu' }}
                        </p>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <StatusBadge
                        :label="instructorQualificationLabel(instructor)"
                        :tone="
                            (instructor.qualifiedCourseTypes ?? []).length > 0
                                ? 'info'
                                : 'neutral'
                        "
                        subtle
                    />
                </td>
                <td class="px-3 py-3 text-right">
                    <UiButton
                        as-child
                        variant="ghost"
                        size="sm"
                        class="text-primary dark:text-primary-300 h-9 gap-1.5 px-2"
                    >
                        <NuxtLink
                            :to="instructorDetailsTo(instructor)"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="`Otwórz szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                        >
                            Szczegóły
                        </NuxtLink>
                    </UiButton>
                </td>
            </tr>
        </tbody>
    </table>
</template>
