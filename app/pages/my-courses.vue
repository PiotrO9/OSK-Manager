<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next';
import {
    formatCourseParticipantStatusLabel,
    type CurrentUserCourseItem,
} from '~/types/course';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Moje kursy',
    description: () => 'Lista kursów przypisanych do zalogowanego użytkownika.',
});

const { fetchMyCourses } = useCoursesApi();

const courses = ref<CurrentUserCourseItem[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

async function loadCourses(): Promise<void> {
    errorMessage.value = null;
    isLoading.value = true;

    try {
        courses.value = await fetchMyCourses();
    } catch (err: unknown) {
        courses.value = [];
        errorMessage.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać listy kursów.',
        );
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    void loadCourses();
});

function statusVariant(
    status: CurrentUserCourseItem['status'],
): 'default' | 'secondary' {
    return status === 'ACTIVE' ? 'default' : 'secondary';
}

function progressLabel(course: CurrentUserCourseItem): string {
    return `${course.progress}%`;
}
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Moje kursy
            </h1>
            <p class="text-muted-foreground text-sm">
                Lista kursów przypisanych do Twojego konta.
            </p>
        </div>

        <div
            class="border-border rounded-lg border p-4 md:p-6"
            :aria-busy="isLoading"
        >
            <p
                v-if="isLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie listy kursów...
            </p>

            <p
                v-else-if="errorMessage"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ errorMessage }}
            </p>

            <div v-else-if="courses.length > 0" class="space-y-3">
                <article
                    v-for="course in courses"
                    :key="course.id"
                    class="border-border flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="flex min-w-0 flex-1 items-start gap-3">
                        <span
                            class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                            aria-hidden="true"
                        >
                            <BookOpen class="size-4" />
                        </span>
                        <div class="min-w-0 flex-1 space-y-3">
                            <h2
                                class="text-foreground truncate text-sm font-medium"
                            >
                                {{ course.name }}
                            </h2>

                            <div class="space-y-1.5">
                                <div
                                    class="flex items-center justify-between gap-3"
                                >
                                    <span
                                        class="text-muted-foreground text-xs font-medium"
                                    >
                                        Postęp kursu
                                    </span>
                                    <span
                                        class="text-foreground text-xs font-semibold tabular-nums"
                                    >
                                        {{ progressLabel(course) }}
                                    </span>
                                </div>
                                <div
                                    class="bg-muted h-2 w-full overflow-hidden rounded-full"
                                    role="progressbar"
                                    :aria-valuenow="course.progress"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    :aria-label="`Postęp kursu ${course.name}`"
                                >
                                    <div
                                        class="bg-primary h-full rounded-full"
                                        :style="{
                                            width: progressLabel(course),
                                        }"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <UiBadge
                        :variant="statusVariant(course.status)"
                        class="w-fit shrink-0"
                    >
                        {{ formatCourseParticipantStatusLabel(course.status) }}
                    </UiBadge>
                </article>
            </div>

            <p v-else class="text-muted-foreground text-sm" role="status">
                Brak kursów
            </p>
        </div>
    </div>
</template>
