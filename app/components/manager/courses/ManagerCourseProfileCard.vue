<script setup lang="ts">
import { computed } from 'vue';
import {
    BookOpen,
    CheckCircle2,
    GraduationCap,
    Settings2,
    UsersRound,
} from 'lucide-vue-next';
import {
    formatCourseKindLabel,
    type CourseDetail,
} from '~/types/courses/course';
import { formatCapacityText } from '~/utils/courses/managerCourseDetailPage';

const props = defineProps<{
    course: CourseDetail;
    courseSubtitle: string;
    courseCategoryLabel: string;
    instructorName: string;
    instructorProfileId: string;
}>();

const instructorDetailsRoute = computed(() => {
    const instructorId = props.instructorProfileId.trim();

    if (!instructorId) return null;

    return {
        path: `/manager/instructors/${instructorId}`,
    };
});
</script>

<template>
    <UiCard class="gap-0 overflow-hidden rounded-lg py-0 shadow-xs">
        <UiCardContent class="space-y-5 p-5">
            <div class="min-w-0">
                <h2 class="text-foreground truncate text-xl font-semibold">
                    {{ course.name }}
                </h2>
                <p class="text-muted-foreground mt-1 text-sm">
                    {{ courseSubtitle }}
                </p>
            </div>

            <dl class="divide-border divide-y">
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <CheckCircle2 class="size-4" aria-hidden="true" />
                        Status
                    </dt>
                    <dd class="text-right text-sm font-bold">Aktywny</dd>
                </div>
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <BookOpen class="size-4" aria-hidden="true" />
                        Kategoria
                    </dt>
                    <dd
                        class="max-w-[170px] truncate text-right text-sm font-bold"
                    >
                        {{ courseCategoryLabel }}
                    </dd>
                </div>
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <Settings2 class="size-4" aria-hidden="true" />
                        Typ
                    </dt>
                    <dd class="text-right text-sm font-bold">
                        {{ formatCourseKindLabel(course.type) }}
                    </dd>
                </div>
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <UsersRound class="size-4" aria-hidden="true" />
                        Limit
                    </dt>
                    <dd class="text-right text-sm font-bold">
                        {{ formatCapacityText(course.capacity) }}
                    </dd>
                </div>
                <div class="flex items-center justify-between gap-4 py-3">
                    <dt
                        class="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <GraduationCap class="size-4" aria-hidden="true" />
                        Instruktor
                    </dt>
                    <dd class="max-w-[170px] min-w-0 text-right text-sm">
                        <NuxtLink
                            v-if="instructorDetailsRoute"
                            :to="instructorDetailsRoute"
                            class="text-foreground hover:text-primary dark:hover:text-primary-300 focus-visible:ring-ring block truncate rounded-sm font-bold underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                            :aria-label="`Otwórz szczegóły instruktora ${instructorName}`"
                        >
                            {{ instructorName }}
                        </NuxtLink>
                        <span v-else class="block truncate font-bold">
                            {{ instructorName }}
                        </span>
                    </dd>
                </div>
            </dl>
        </UiCardContent>
    </UiCard>
</template>
