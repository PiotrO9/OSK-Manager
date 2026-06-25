<script setup lang="ts">
import {
    BookOpen,
    CheckCircle2,
    GraduationCap,
    Settings2,
} from 'lucide-vue-next';
import { formatCourseKindLabel, type CourseDetail } from '~/types/course';

defineProps<{
    course: CourseDetail;
    courseInitials: string;
    courseSubtitle: string;
    courseCategoryLabel: string;
    instructorName: string;
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardContent class="space-y-5 p-5">
            <div class="flex items-start gap-4 xl:flex-col">
                <div
                    class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xl font-extrabold text-sky-700"
                    aria-hidden="true"
                >
                    {{ courseInitials }}
                </div>
                <div class="min-w-0">
                    <h2 class="text-foreground truncate text-xl font-extrabold">
                        {{ course.name }}
                    </h2>
                    <p class="text-muted-foreground mt-1 text-sm">
                        {{ courseSubtitle }}
                    </p>
                </div>
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
                        <GraduationCap class="size-4" aria-hidden="true" />
                        Instruktor
                    </dt>
                    <dd
                        class="max-w-[170px] truncate text-right text-sm font-bold"
                    >
                        {{ instructorName }}
                    </dd>
                </div>
            </dl>
        </UiCardContent>
    </UiCard>
</template>
