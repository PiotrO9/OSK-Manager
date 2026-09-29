<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';
import AppUserIdentity from '~/components/app/AppUserIdentity.vue';
import ManagerInstructorQualificationBadges from './ManagerInstructorQualificationBadges.vue';
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
    <div class="divide-border divide-y @3xl:hidden">
        <article
            v-for="instructor in instructors"
            :key="instructor.id"
            class="space-y-4 p-4 sm:p-5"
        >
            <div class="flex items-start justify-between gap-3">
                <AppUserIdentity
                    :avatar-src="instructor.avatarUrl"
                    :initials="instructorInitials(instructor)"
                    :name="formatInstructorDisplayName(instructor)"
                    subtitle="Instruktor OSK"
                    :avatar-size="36"
                />
                <StatusBadge label="Konto" tone="success" subtle />
            </div>

            <dl class="space-y-2 text-sm">
                <div>
                    <dt class="sr-only">E-mail</dt>
                    <dd class="min-w-0 wrap-anywhere">
                        {{ instructor.email || 'Brak e-maila' }}
                    </dd>
                </div>
                <div>
                    <dt class="sr-only">Telefon</dt>
                    <dd class="text-muted-foreground tabular-nums">
                        {{ instructor.phone || 'Brak telefonu' }}
                    </dd>
                </div>
            </dl>

            <div class="flex flex-wrap items-center justify-between gap-2">
                <ManagerInstructorQualificationBadges
                    :qualifications="instructor.qualifiedCourseTypes ?? []"
                />
                <UiButton
                    as-child
                    variant="ghost"
                    class="text-primary dark:text-primary-300 h-11"
                >
                    <NuxtLink
                        :to="instructorDetailsTo(instructor)"
                        target="_blank"
                        rel="noopener noreferrer"
                        :aria-label="`Otwórz szczegóły instruktora ${formatInstructorDisplayName(instructor)}`"
                    >
                        Szczegóły
                        <ArrowUpRight class="size-4" aria-hidden="true" />
                    </NuxtLink>
                </UiButton>
            </div>
        </article>
    </div>
</template>
