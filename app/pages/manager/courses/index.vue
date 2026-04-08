<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next';
import type { DrivingSchool } from '~/types/drivingSchool';
import { formatCourseKindLabel, type CourseListItem } from '~/types/course';
import { getApiErrorStatusCode } from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Kursy',
    description: () => 'Lista kursów w wybranej szkole jazdy.',
});

const SELECT_SCHOOL_CLASS =
    'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-md rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

function resolveCoursesListError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do listy kursów dla wybranej szkoły.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(err, 'Nie udało się pobrać listy kursów.');
}

const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
const { fetchList: fetchCoursesList } = useCoursesApi();

const schools = ref<DrivingSchool[]>([]);
const schoolsLoadError = ref<string | null>(null);
const isSchoolsLoading = ref(false);

const activeSchoolId = ref('');
const courses = ref<CourseListItem[]>([]);
const isCoursesLoading = ref(false);
const coursesLoadError = ref<string | null>(null);

async function loadSchools() {
    schoolsLoadError.value = null;
    isSchoolsLoading.value = true;

    try {
        schools.value = await fetchSchoolsList();
    } catch (e) {
        schoolsLoadError.value =
            e instanceof Error ? e.message : 'Nie udało się pobrać listy OSK.';
    } finally {
        isSchoolsLoading.value = false;
    }
}

function resolveInitialActiveSchoolId(): string {
    return schools.value[0]?.id ?? '';
}

async function loadCourses() {
    const sid = activeSchoolId.value.trim();

    if (!sid) {
        courses.value = [];

        return;
    }

    coursesLoadError.value = null;
    isCoursesLoading.value = true;

    try {
        courses.value = await fetchCoursesList(sid);
    } catch (err) {
        courses.value = [];
        coursesLoadError.value = resolveCoursesListError(err);
    } finally {
        isCoursesLoading.value = false;
    }
}

async function handleActiveSchoolChange() {
    coursesLoadError.value = null;
    await loadCourses();
}

onMounted(async () => {
    await loadSchools();
    activeSchoolId.value = resolveInitialActiveSchoolId();

    if (activeSchoolId.value) {
        await loadCourses();
    }
});

function formatInstructorCell(course: CourseListItem): string {
    const name = course.instructor?.name?.trim();

    if (name && name.length > 0) {
        return name;
    }

    return 'Brak instruktora';
}
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Kursy
            </h1>
            <p class="text-muted-foreground text-sm">
                Lista kursów przypisanych do wybranej szkoły jazdy (MVP — bez
                paginacji i filtrów).
            </p>
        </div>

        <div
            class="border-border rounded-lg border p-4 md:p-6"
            :aria-busy="isSchoolsLoading"
        >
            <p
                v-if="isSchoolsLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie listy szkół jazdy…
            </p>

            <template v-else>
                <p
                    v-if="schoolsLoadError"
                    class="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {{ schoolsLoadError }}
                </p>

                <p
                    v-else-if="schools.length === 0"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Nie masz jeszcze żadnej szkoły jazdy. Dodaj OSK w panelu
                    szkół, aby wyświetlić listę kursów.
                </p>

                <template v-else>
                    <div
                        v-if="activeSchoolId"
                        class="mb-4 flex flex-wrap items-center gap-3"
                    >
                        <UiButton as-child :disabled="isCoursesLoading">
                            <NuxtLink
                                :to="{
                                    path: '/manager/courses/new',
                                    query: { schoolId: activeSchoolId },
                                }"
                                class="inline-flex items-center justify-center gap-2"
                                :class="
                                    isCoursesLoading
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                "
                                :aria-disabled="isCoursesLoading"
                                aria-label="Utwórz nowy kurs w wybranej szkole"
                            >
                                Dodaj kurs
                            </NuxtLink>
                        </UiButton>
                    </div>

                    <div v-if="schools.length > 1" class="mb-4 space-y-2">
                        <UiLabel for="courses-page-school"
                            >Szkoła jazdy (lista kursów)</UiLabel
                        >
                        <select
                            id="courses-page-school"
                            v-model="activeSchoolId"
                            :class="SELECT_SCHOOL_CLASS"
                            :disabled="isCoursesLoading"
                            aria-label="Wybierz szkołę jazdy do podglądu listy kursów"
                            @change="handleActiveSchoolChange"
                        >
                            <option
                                v-for="s in schools"
                                :key="s.id"
                                :value="s.id"
                            >
                                {{ s.name
                                }}{{
                                    s.city && s.city.length > 0
                                        ? ` (${s.city})`
                                        : ''
                                }}
                            </option>
                        </select>
                    </div>

                    <template v-if="coursesLoadError">
                        <p
                            class="text-destructive text-sm"
                            role="alert"
                            aria-live="polite"
                        >
                            {{ coursesLoadError }}
                        </p>
                    </template>
                    <template v-else-if="isCoursesLoading">
                        <p class="text-muted-foreground text-sm" role="status">
                            Wczytywanie listy kursów…
                        </p>
                    </template>
                    <template v-else-if="courses.length > 0">
                        <div class="overflow-x-auto rounded-md border">
                            <table
                                class="w-full min-w-[640px] text-left text-sm"
                            >
                                <thead
                                    class="bg-muted/50 text-muted-foreground border-b"
                                >
                                    <tr>
                                        <th
                                            scope="col"
                                            class="px-4 py-3 font-medium"
                                        >
                                            Nazwa
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-4 py-3 font-medium"
                                        >
                                            Kategoria
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-4 py-3 font-medium"
                                        >
                                            Typ
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-4 py-3 font-medium tabular-nums"
                                        >
                                            Godziny
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-4 py-3 font-medium"
                                        >
                                            Instruktor
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-border divide-y">
                                    <tr
                                        v-for="course in courses"
                                        :key="course.id"
                                        class="hover:bg-muted/30"
                                    >
                                        <td class="text-foreground px-4 py-3">
                                            <NuxtLink
                                                :to="`/manager/courses/${course.id}`"
                                                class="focus-visible:ring-ring inline-flex items-center gap-2 rounded-sm underline-offset-2 outline-none hover:underline focus-visible:ring-2"
                                                :aria-label="`Szczegóły kursu: ${course.name}`"
                                            >
                                                <BookOpen
                                                    class="text-muted-foreground size-4 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {{ course.name }}
                                            </NuxtLink>
                                        </td>
                                        <td
                                            class="text-muted-foreground px-4 py-3"
                                        >
                                            {{ course.category }}
                                        </td>
                                        <td class="px-4 py-3">
                                            <UiBadge
                                                variant="secondary"
                                                class="shrink-0"
                                            >
                                                {{
                                                    formatCourseKindLabel(
                                                        course.type,
                                                    )
                                                }}
                                            </UiBadge>
                                        </td>
                                        <td
                                            class="text-muted-foreground px-4 py-3 tabular-nums"
                                        >
                                            {{ course.totalHours }}
                                        </td>
                                        <td
                                            class="text-muted-foreground px-4 py-3"
                                        >
                                            {{ formatInstructorCell(course) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>
                    <template v-else>
                        <p class="text-muted-foreground text-sm" role="status">
                            Brak kursów dla tej szkoły.
                        </p>
                    </template>
                </template>
            </template>
        </div>
    </div>
</template>
