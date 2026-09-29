<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next';
import AppUserIdentity from '~/components/app/AppUserIdentity.vue';
import {
    formatCourseKindLabel,
    type CourseListItem,
} from '~/types/courses/course';
import {
    formatInstructorCell,
    getCourseInstructorInitials,
} from '~/utils/courses/managerCoursesList';
defineProps<{ courses: CourseListItem[]; activeSchoolId: string }>();
</script>
<template>
    <table class="hidden w-full table-fixed text-left text-sm @3xl:table">
        <caption class="sr-only">
            Kursy: kategoria, typ, liczba godzin i instruktor.
        </caption>
        <thead
            class="border-border bg-muted/30 text-muted-foreground border-b text-xs"
        >
            <tr>
                <th scope="col" class="w-[28%] px-5 py-3 font-medium">Kurs</th>
                <th scope="col" class="w-[10%] px-3 py-3 font-medium">
                    Kategoria
                </th>
                <th scope="col" class="w-[18%] px-3 py-3 font-medium">Typ</th>
                <th scope="col" class="w-[8%] px-3 py-3 text-right font-medium">
                    Godziny
                </th>
                <th scope="col" class="w-[30%] px-3 py-3 font-medium">
                    Instruktor
                </th>
                <th scope="col" class="w-[6%] px-1 py-3">
                    <span class="sr-only">Akcje</span>
                </th>
            </tr>
        </thead>
        <tbody class="divide-border divide-y">
            <tr
                v-for="course in courses"
                :key="course.id"
                class="hover:bg-muted/30 focus-within:bg-muted/30 transition-colors"
            >
                <th scope="row" class="px-5 py-4 text-left font-normal">
                    <NuxtLink
                        :to="{
                            path: `/manager/courses/${course.id}`,
                        }"
                        class="text-foreground hover:text-primary dark:hover:text-primary-300 focus-visible:ring-ring block rounded-sm font-semibold wrap-anywhere underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                        >{{ course.name }}</NuxtLink
                    >
                </th>
                <td class="px-3 py-4">
                    <StatusBadge
                        :label="course.category"
                        tone="neutral"
                        subtle
                    />
                </td>
                <td class="px-3 py-4">
                    <StatusBadge
                        :label="formatCourseKindLabel(course.type)"
                        :tone="
                            course.type === 'PRACTICAL'
                                ? 'info'
                                : course.type === 'THEORY_GROUP'
                                  ? 'warning'
                                  : 'success'
                        "
                        subtle
                    />
                </td>
                <td class="px-3 py-4 text-right font-medium tabular-nums">
                    {{ course.totalHours }}
                    <span class="text-muted-foreground font-normal">h</span>
                </td>
                <td class="px-3 py-3">
                    <AppUserIdentity
                        v-if="course.instructor"
                        :avatar-src="course.instructor.avatarUrl"
                        :initials="getCourseInstructorInitials(course)"
                        subtitle="Instruktor OSK"
                        :avatar-size="36"
                    >
                        <template #name>
                            <NuxtLink
                                :to="{
                                    path: `/manager/instructors/${course.instructor.id}`,
                                    query: { schoolId: activeSchoolId },
                                }"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-foreground hover:text-primary dark:hover:text-primary-300 focus-visible:ring-ring block rounded-sm font-semibold wrap-anywhere underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                                :aria-label="`Otwórz szczegóły instruktora ${course.instructor.name}`"
                                >{{ course.instructor.name }}</NuxtLink
                            >
                        </template>
                    </AppUserIdentity>
                    <span
                        v-else
                        class="text-muted-foreground text-sm wrap-anywhere"
                        >{{ formatInstructorCell(course) }}</span
                    >
                </td>
                <td class="px-1 py-4">
                    <UiTooltip
                        ><UiTooltipTrigger as-child>
                            <UiButton
                                as-child
                                variant="ghost"
                                size="icon"
                                class="size-9"
                            >
                                <NuxtLink
                                    :to="{
                                        path: `/manager/courses/${course.id}`,
                                    }"
                                    :aria-label="`Szczegóły kursu: ${course.name}`"
                                    ><ArrowUpRight
                                        class="size-4"
                                        aria-hidden="true"
                                /></NuxtLink>
                            </UiButton> </UiTooltipTrigger
                        ><UiTooltipContent
                            >Szczegóły kursu</UiTooltipContent
                        ></UiTooltip
                    >
                </td>
            </tr>
        </tbody>
    </table>
</template>
