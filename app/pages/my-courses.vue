<script setup lang="ts">
import { CalendarPlus } from 'lucide-vue-next';
import {
    formatCourseKindLabel,
    type CurrentUserCourseItem,
} from '~/types/courses/course';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Moje kursy',
    description: () => 'Lista kursów przypisanych do zalogowanego użytkownika.',
});

const { session } = useAuthSession();
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

const isStudent = computed(() => session.value?.role === 'STUDENT');

const {
    activeCourses,
    averageProgress,
    completedCourses,
    featuredCourse,
    totalHours,
    visibleCoursesLabel,
} = useMyCoursesPresentation(courses);
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Moje kursy"
            description="Postęp szkolenia, godziny i przypisane kursy."
        >
            <template v-if="isStudent" #actions>
                <UiButton
                    as-child
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        to="/book-lesson"
                        aria-label="Przejdz do rezerwacji jazdy"
                    >
                        <CalendarPlus class="mr-2 size-4" aria-hidden="true" />
                        Dodaj jazde
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div class="grid gap-3 lg:grid-cols-3">
            <section
                class="border-border bg-background min-h-40 rounded-2xl border p-5 shadow-sm"
            >
                <StatusBadge
                    :label="
                        featuredCourse
                            ? formatCourseKindLabel(featuredCourse.type)
                            : 'Brak kursu'
                    "
                    tone="info"
                    subtle
                />
                <div class="mt-6 space-y-4">
                    <div class="space-y-1">
                        <p class="text-foreground text-2xl font-extrabold">
                            {{
                                featuredCourse
                                    ? formatMyCoursesProgressLabel(
                                          featuredCourse,
                                      )
                                    : '0%'
                            }}
                        </p>
                        <p class="text-muted-foreground text-sm">
                            {{
                                featuredCourse
                                    ? featuredCourse.name
                                    : 'Postęp kursu'
                            }}
                        </p>
                    </div>
                    <div
                        class="bg-muted h-2 w-full overflow-hidden rounded-full"
                        role="progressbar"
                        :aria-valuenow="featuredCourse?.progress ?? 0"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label="Postęp wyróżnionego kursu"
                    >
                        <div
                            class="bg-primary h-full rounded-full"
                            :style="{
                                width: featuredCourse
                                    ? formatMyCoursesProgressLabel(
                                          featuredCourse,
                                      )
                                    : '0%',
                            }"
                        />
                    </div>
                </div>
            </section>

            <section
                class="border-border bg-background min-h-40 rounded-2xl border p-5 shadow-sm"
            >
                <StatusBadge
                    :label="
                        activeCourses.length > 0 ? 'Aktywny' : 'Bez aktywnych'
                    "
                    :tone="activeCourses.length > 0 ? 'success' : 'neutral'"
                    subtle
                />
                <div class="mt-6 space-y-1">
                    <p class="text-foreground text-2xl font-extrabold">
                        {{ activeCourses.length }}
                    </p>
                    <p class="text-muted-foreground text-sm">
                        Aktywne kursy na Twoim koncie
                    </p>
                </div>
            </section>

            <section
                class="border-border bg-background min-h-40 rounded-2xl border p-5 shadow-sm"
            >
                <StatusBadge label="Godziny" tone="warning" subtle />
                <div class="mt-6 space-y-1">
                    <p class="text-foreground text-2xl font-extrabold">
                        {{ totalHours }} h
                    </p>
                    <p class="text-muted-foreground text-sm">
                        Łączny zakres przypisanych kursów
                    </p>
                </div>
            </section>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">Kursy</p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ courses.length }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Ukończone
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ completedCourses.length }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Sredni postep
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ averageProgress }}%
                </p>
            </div>
        </div>

        <MyCoursesList
            :courses="courses"
            :is-loading="isLoading"
            :error-message="errorMessage"
            :visible-courses-label="visibleCoursesLabel"
            @retry="loadCourses"
        />
    </div>
</template>
