<script setup lang="ts">
import { Users } from 'lucide-vue-next';
import type { StudentRegisterPayload } from '~/components/manager/students/ManagerStudentFormDialog.vue';
import type { DrivingSchool } from '~/types/drivingSchool';
import type { CourseListItem } from '~/types/course';
import type { StudentListItem } from '~/types/student';
import {
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Kursanci',
    description: () => 'Lista i rejestracja kursantów w szkołach jazdy.',
});

const route = useRoute();
const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
const { fetchList: fetchCoursesList } = useCoursesApi();
const { fetchList: fetchStudentsPage } = useStudentsApi();
const { addToast } = useAppToast();

const REGISTER_GENERIC_FALLBACK = 'Nie udało się utworzyć konta kursanta.';

const SELECT_CONTROL_CLASS =
    'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full max-w-md rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

const PAGE_LIMIT = 20;

function resolveStudentRegisterError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak uprawnień do tej operacji.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (status === 400 || status === 409) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane lub konflikt.');
    }

    return getApiFetchErrorMessage(err, REGISTER_GENERIC_FALLBACK);
}

function resolveStudentsListError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do listy kursantów dla wybranej szkoły.';
    }

    if (status === 404) {
        return 'Nie znaleziono wybranego kursu lub kurs nie należy do tej OSK.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(
        err,
        'Nie udało się pobrać listy kursantów.',
    );
}

const schools = ref<DrivingSchool[]>([]);
const schoolsLoadError = ref<string | null>(null);
const isSchoolsLoading = ref(false);

const activeSchoolId = ref('');
const courses = ref<CourseListItem[]>([]);
const isCoursesLoading = ref(false);
const coursesLoadError = ref<string | null>(null);

const activeCourseId = ref('');
const currentPage = ref(1);

const students = ref<StudentListItem[]>([]);
const studentsPagination = ref<{
    total: number;
    totalPages: number;
} | null>(null);
const isStudentsLoading = ref(false);
const studentsLoadError = ref<string | null>(null);

const formDialogOpen = ref(false);
const isFormSaving = ref(false);
const apiError = ref<string | null>(null);

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

const prefillSchoolId = computed((): string | null => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    if (!isUuid(t)) return null;

    return t;
});

function resolveInitialActiveSchoolId(): string {
    const pre = prefillSchoolId.value;

    if (pre && schools.value.some((s) => s.id === pre)) {
        return pre;
    }

    return schools.value[0]?.id ?? '';
}

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

async function loadCoursesForFilter() {
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
        coursesLoadError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się pobrać listy kursów.';
    } finally {
        isCoursesLoading.value = false;
    }
}

async function loadStudents() {
    const sid = activeSchoolId.value.trim();

    if (!sid) {
        students.value = [];
        studentsPagination.value = null;

        return;
    }

    studentsLoadError.value = null;
    isStudentsLoading.value = true;

    try {
        const courseIdTrimmed = activeCourseId.value.trim();
        const page = await fetchStudentsPage({
            schoolId: sid,
            page: currentPage.value,
            limit: PAGE_LIMIT,
            ...(courseIdTrimmed.length > 0
                ? { courseId: courseIdTrimmed }
                : {}),
        });

        students.value = page.items;
        studentsPagination.value = {
            total: page.total,
            totalPages: page.totalPages,
        };
    } catch (err) {
        students.value = [];
        studentsPagination.value = null;
        studentsLoadError.value = resolveStudentsListError(err);
    } finally {
        isStudentsLoading.value = false;
    }
}

async function handleActiveSchoolChange() {
    activeCourseId.value = '';
    currentPage.value = 1;
    studentsLoadError.value = null;

    await Promise.all([loadCoursesForFilter(), loadStudents()]);
}

async function handleCourseFilterChange() {
    currentPage.value = 1;
    await loadStudents();
}

function handlePrevPage() {
    if (currentPage.value <= 1 || isStudentsLoading.value) return;

    currentPage.value -= 1;
    void loadStudents();
}

function handleNextPage() {
    const max = studentsPagination.value?.totalPages ?? 0;

    if (currentPage.value >= max || isStudentsLoading.value) return;

    currentPage.value += 1;
    void loadStudents();
}

onMounted(async () => {
    await loadSchools();
    activeSchoolId.value = resolveInitialActiveSchoolId();

    if (prefillSchoolId.value) {
        apiError.value = null;
        formDialogOpen.value = true;
    }

    if (activeSchoolId.value) {
        await Promise.all([loadCoursesForFilter(), loadStudents()]);
    }
});

function handleOpenCreateDialog() {
    apiError.value = null;
    formDialogOpen.value = true;

    if (schools.value.length === 0 && !isSchoolsLoading.value) {
        loadSchools();
    }
}

function handleFormDialogOpenChange(open: boolean) {
    formDialogOpen.value = open;

    if (!open) {
        apiError.value = null;
    }
}

async function handleStudentSubmit(payload: StudentRegisterPayload) {
    if (isFormSaving.value) return;

    apiError.value = null;
    isFormSaving.value = true;

    try {
        const raw = await $fetch<unknown>(
            resolveBffEndpoint('/api/auth/register'),
            {
                method: 'POST',
                credentials: 'include',
                body: {
                    role: 'STUDENT',
                    email: payload.email,
                    password: payload.password,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    schoolId: payload.schoolId,
                },
            },
        );

        unwrapApiSuccessData(raw);

        addToast({
            title: 'Kursant został utworzony',
            variant: 'success',
        });

        formDialogOpen.value = false;

        if (schools.value.some((s) => s.id === payload.schoolId)) {
            activeSchoolId.value = payload.schoolId;
        }

        activeCourseId.value = '';
        currentPage.value = 1;

        if (activeSchoolId.value) {
            await Promise.all([loadCoursesForFilter(), loadStudents()]);
        }

        await navigateTo('/manager/students', { replace: true });
    } catch (err) {
        const message = resolveStudentRegisterError(err);

        apiError.value = message;

        addToast({
            title: 'Nie udało się utworzyć konta',
            description: message,
            variant: 'error',
        });
    } finally {
        isFormSaving.value = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Kursanci
            </h1>
            <p class="text-muted-foreground text-sm">
                Przeglądaj kursantów wybranej OSK z paginacją i filtrem po
                kursie. Dodawanie konta odbywa się przyciskiem poniżej;
                formularz można otworzyć z parametru
                <span class="font-mono">?schoolId=</span>.
            </p>
        </div>

        <UiButton
            type="button"
            class="inline-flex items-center gap-2"
            aria-label="Otwórz formularz dodawania kursanta"
            @click="handleOpenCreateDialog"
        >
            <Users class="size-4 shrink-0" aria-hidden="true" />
            Dodaj kursanta
        </UiButton>

        <div
            class="border-border rounded-lg border p-4 md:p-6"
            :aria-busy="isSchoolsLoading || isStudentsLoading"
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
                    szkół, aby wyświetlić listę kursantów.
                </p>

                <template v-else>
                    <div v-if="schools.length > 1" class="mb-4 space-y-2">
                        <UiLabel for="students-page-school"
                            >Szkoła jazdy</UiLabel
                        >
                        <select
                            id="students-page-school"
                            v-model="activeSchoolId"
                            :class="SELECT_CONTROL_CLASS"
                            :disabled="isStudentsLoading || isCoursesLoading"
                            aria-label="Wybierz szkołę jazdy do podglądu listy kursantów"
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

                    <div v-if="activeSchoolId" class="mb-4 space-y-2">
                        <UiLabel for="students-page-course-filter"
                            >Filtr: kurs (opcjonalnie)</UiLabel
                        >
                        <select
                            id="students-page-course-filter"
                            v-model="activeCourseId"
                            :class="SELECT_CONTROL_CLASS"
                            :disabled="isStudentsLoading || isCoursesLoading"
                            aria-label="Wybierz kurs do filtrowania listy kursantów lub pozostaw wszystkie kursy"
                            @change="handleCourseFilterChange"
                        >
                            <option value="">Wszystkie kursy</option>
                            <option
                                v-for="c in courses"
                                :key="c.id"
                                :value="c.id"
                            >
                                {{ c.name }} ({{ c.category }})
                            </option>
                        </select>
                        <p
                            v-if="isCoursesLoading"
                            class="text-muted-foreground text-sm"
                            role="status"
                        >
                            Wczytywanie kursów do filtra…
                        </p>
                        <p
                            v-else-if="coursesLoadError"
                            class="text-destructive text-sm"
                            role="alert"
                            aria-live="polite"
                        >
                            {{ coursesLoadError }}
                        </p>
                    </div>

                    <template v-if="studentsLoadError">
                        <p
                            class="text-destructive text-sm"
                            role="alert"
                            aria-live="polite"
                        >
                            {{ studentsLoadError }}
                        </p>
                    </template>
                    <template v-else-if="isStudentsLoading">
                        <p class="text-muted-foreground text-sm" role="status">
                            Wczytywanie listy kursantów…
                        </p>
                    </template>
                    <template v-else-if="students.length > 0">
                        <div class="overflow-x-auto rounded-md border">
                            <table
                                class="w-full min-w-[560px] text-left text-sm"
                            >
                                <thead
                                    class="bg-muted/50 text-muted-foreground border-b"
                                >
                                    <tr>
                                        <th
                                            scope="col"
                                            class="px-4 py-3 font-medium"
                                        >
                                            Imię
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-4 py-3 font-medium"
                                        >
                                            Nazwisko
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-4 py-3 font-medium"
                                        >
                                            E-mail
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-border divide-y">
                                    <tr
                                        v-for="student in students"
                                        :key="student.id"
                                        class="hover:bg-muted/30"
                                    >
                                        <td class="text-foreground px-4 py-3">
                                            {{ student.firstName }}
                                        </td>
                                        <td class="text-foreground px-4 py-3">
                                            {{ student.lastName }}
                                        </td>
                                        <td
                                            class="text-muted-foreground px-4 py-3 break-all"
                                        >
                                            {{ student.email }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>
                    <template v-else>
                        <p class="text-muted-foreground text-sm" role="status">
                            Brak kursantów
                        </p>
                    </template>

                    <div
                        v-if="
                            activeSchoolId &&
                            studentsPagination &&
                            studentsPagination.totalPages > 1 &&
                            !studentsLoadError
                        "
                        class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <p class="text-muted-foreground text-sm tabular-nums">
                            Strona {{ currentPage }} z
                            {{ studentsPagination.totalPages }} ({{
                                studentsPagination.total
                            }}
                            kursantów)
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <UiButton
                                type="button"
                                variant="outline"
                                :disabled="
                                    currentPage <= 1 || isStudentsLoading
                                "
                                aria-label="Poprzednia strona listy kursantów"
                                @click="handlePrevPage"
                            >
                                Poprzednia
                            </UiButton>
                            <UiButton
                                type="button"
                                variant="outline"
                                :disabled="
                                    currentPage >=
                                        studentsPagination.totalPages ||
                                    isStudentsLoading
                                "
                                aria-label="Następna strona listy kursantów"
                                @click="handleNextPage"
                            >
                                Następna
                            </UiButton>
                        </div>
                    </div>
                </template>
            </template>
        </div>

        <ManagerStudentFormDialog
            :open="formDialogOpen"
            :schools="schools"
            :is-schools-loading="isSchoolsLoading"
            :schools-load-error="schoolsLoadError"
            :is-saving="isFormSaving"
            :api-error="apiError"
            :prefill-school-id="prefillSchoolId"
            @update:open="handleFormDialogOpenChange"
            @submit="handleStudentSubmit"
        />
    </div>
</template>
