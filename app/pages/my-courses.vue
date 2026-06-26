<script setup lang="ts">
import { BookOpen, CalendarPlus } from 'lucide-vue-next';
import {
    formatCourseKindLabel,
    formatCourseParticipantStatusLabel,
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

const activeCourses = computed(() =>
    courses.value.filter((course) => course.status === 'ACTIVE'),
);

const completedCourses = computed(() =>
    courses.value.filter((course) => course.status === 'FINISHED'),
);

const featuredCourse = computed<CurrentUserCourseItem | null>(() => {
    const candidates =
        activeCourses.value.length > 0 ? activeCourses.value : courses.value;

    return [...candidates].sort((a, b) => b.progress - a.progress)[0] ?? null;
});

const totalHours = computed(() =>
    courses.value.reduce((sum, course) => sum + course.totalHours, 0),
);

const averageProgress = computed(() => {
    if (courses.value.length === 0) {
        return 0;
    }

    const totalProgress = courses.value.reduce(
        (sum, course) => sum + course.progress,
        0,
    );

    return Math.round(totalProgress / courses.value.length);
});

const visibleCoursesLabel = computed(() => {
    const count = courses.value.length;

    if (count === 1) {
        return '1 wynik';
    }

    if (count > 1 && count < 5) {
        return `${count} wyniki`;
    }

    return `${count} wynikow`;
});

function statusTone(
    status: CurrentUserCourseItem['status'],
): 'success' | 'neutral' {
    return status === 'ACTIVE' ? 'success' : 'neutral';
}

function progressLabel(course: CurrentUserCourseItem): string {
    return `${course.progress}%`;
}
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
                                    ? progressLabel(featuredCourse)
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
                                    ? progressLabel(featuredCourse)
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

        <DataTableShell
            title="Lista kursów"
            description="Kursy przypisane do Twojego konta."
            :is-loading="isLoading"
            :error-message="errorMessage"
            empty-title="Brak kursów"
            empty-description="Nie masz jeszcze przypisanych kursów."
            @retry="loadCourses"
        >
            <template #toolbar>
                <StatusBadge
                    label="Filtry"
                    tone="neutral"
                    subtle
                    class="hidden sm:inline-flex"
                />
                <StatusBadge
                    :label="visibleCoursesLabel"
                    tone="neutral"
                    subtle
                />
            </template>

            <EmptyState
                v-if="courses.length === 0"
                title="Brak kursów"
                description="Nie masz jeszcze przypisanych kursów."
                class="m-4"
            />

            <table v-else class="w-full min-w-[760px] text-left text-sm">
                <thead class="bg-muted/40 text-muted-foreground border-b">
                    <tr>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Nazwa
                        </th>
                        <th scope="col" class="px-4 py-3 font-semibold">Typ</th>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Postęp
                        </th>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-border divide-y">
                    <tr
                        v-for="course in courses"
                        :key="course.id"
                        class="hover:bg-muted/30"
                    >
                        <td class="px-4 py-3">
                            <div class="flex min-w-0 items-center gap-3">
                                <span
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                                    aria-hidden="true"
                                >
                                    <BookOpen class="size-4" />
                                </span>
                                <div class="min-w-0">
                                    <p class="truncate font-extrabold">
                                        {{ course.name }}
                                    </p>
                                    <p
                                        class="text-muted-foreground text-xs tabular-nums"
                                    >
                                        {{ course.totalHours }} h
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            {{ formatCourseKindLabel(course.type) }}
                        </td>
                        <td class="px-4 py-3">
                            <div class="max-w-56 space-y-1.5">
                                <div
                                    class="flex items-center justify-between gap-3"
                                >
                                    <span
                                        class="text-muted-foreground text-xs font-medium"
                                    >
                                        Realizacja
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
                        </td>
                        <td class="px-4 py-3">
                            <StatusBadge
                                :label="
                                    formatCourseParticipantStatusLabel(
                                        course.status,
                                    )
                                "
                                :tone="statusTone(course.status)"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <template v-if="courses.length > 0" #mobile>
                <div class="space-y-3 p-4">
                    <article
                        v-for="course in courses"
                        :key="course.id"
                        class="border-border rounded-2xl border p-4"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0 space-y-1">
                                <p class="truncate font-extrabold">
                                    {{ course.name }}
                                </p>
                                <p class="text-muted-foreground text-sm">
                                    {{ formatCourseKindLabel(course.type) }} ·
                                    {{ course.totalHours }} h
                                </p>
                            </div>
                            <StatusBadge
                                :label="
                                    formatCourseParticipantStatusLabel(
                                        course.status,
                                    )
                                "
                                :tone="statusTone(course.status)"
                                class="shrink-0"
                            />
                        </div>

                        <div class="mt-4 space-y-2">
                            <div
                                class="flex items-center justify-between gap-3 text-xs"
                            >
                                <span class="text-muted-foreground font-medium">
                                    Postęp
                                </span>
                                <span
                                    class="text-foreground font-semibold tabular-nums"
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
                                    :style="{ width: progressLabel(course) }"
                                />
                            </div>
                        </div>
                    </article>
                </div>
            </template>
        </DataTableShell>
    </div>
</template>
