<script setup lang="ts">
import {
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    UserPlus,
} from 'lucide-vue-next';
import type { StudentRegisterPayload } from '~/components/manager/students/ManagerStudentFormDialog.vue';
import type { DrivingSchool } from '~/types/drivingSchool';
import type { CourseListItem } from '~/types/course';
import {
    formatStudentDisplayName,
    type StudentListItem,
} from '~/types/student';
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
const { fetchList: fetchStudentsPage, assignToCourse } = useStudentsApi();
const { addToast } = useAppToast();

const REGISTER_GENERIC_FALLBACK = 'Nie udało się utworzyć konta kursanta.';

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

function resolveAssignToCourseError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 409) {
        return 'Ten kursant jest już zapisany na wybrany kurs.';
    }

    if (status === 403) {
        return 'Brak uprawnień do przypisania w tej szkole.';
    }

    if (status === 404) {
        return 'Nie znaleziono kursu lub kursanta.';
    }

    if (status === 400) {
        return getApiFetchErrorMessage(err, 'Nieprawidłowe dane żądania.');
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(
        err,
        'Nie udało się zapisać kursanta na kurs.',
    );
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

const assignDialogOpen = ref(false);
const assignTargetStudent = ref<StudentListItem | null>(null);
const isAssignSaving = ref(false);
const assignApiError = ref<string | null>(null);

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

function readQueryTruthyFlag(raw: unknown): boolean {
    if (raw === undefined || raw === null) {
        return false;
    }

    const v = Array.isArray(raw) ? raw[0] : raw;

    if (typeof v !== 'string') {
        return false;
    }

    const t = v.trim().toLowerCase();

    return t === '1' || t === 'true' || t === 'yes';
}

/** Otwarcie modala rejestracji z URL — nie wystarczy sam `schoolId` (np. powrót ze szczegółów). */
const openRegisterFormFromQuery = computed((): boolean => {
    return readQueryTruthyFlag(route.query.register);
});

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

    if (openRegisterFormFromQuery.value) {
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

const assignTargetDisplayName = computed(() => {
    const s = assignTargetStudent.value;

    if (!s) {
        return '';
    }

    return formatStudentDisplayName(s);
});

const activeSchool = computed(
    () =>
        schools.value.find((school) => school.id === activeSchoolId.value) ??
        null,
);

const activeCourse = computed(
    () =>
        courses.value.find((course) => course.id === activeCourseId.value) ??
        null,
);

const totalStudentsCount = computed(
    () => studentsPagination.value?.total ?? students.value.length,
);

const activeStudentsOnPage = computed(
    () => students.value.filter((student) => student.isActive).length,
);

const studentsWithPkkOnPage = computed(
    () =>
        students.value.filter(
            (student) =>
                student.pkkNumber !== null && student.pkkNumber.length > 0,
        ).length,
);

const visibleStudentsLabel = computed(() => {
    const total = studentsPagination.value?.total ?? students.value.length;

    if (total === students.value.length) {
        return `${students.value.length} wyników`;
    }

    return `${students.value.length} z ${total} wyników`;
});

function formatStudentCreatedAt(value: string): string {
    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return 'Brak daty';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
}

function studentStatusLabel(student: StudentListItem): string {
    return student.isActive ? 'Aktywny' : 'Nieaktywny';
}

function studentStatusClasses(student: StudentListItem): string {
    return student.isActive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-slate-50 text-slate-600';
}

function handleOpenAssignCourse(student: StudentListItem) {
    assignTargetStudent.value = student;
    assignApiError.value = null;
    assignDialogOpen.value = true;

    if (!activeSchoolId.value.trim()) {
        return;
    }

    if (courses.value.length === 0 && !isCoursesLoading.value) {
        void loadCoursesForFilter();
    }
}

function handleAssignDialogOpenChange(open: boolean) {
    assignDialogOpen.value = open;

    if (!open) {
        assignTargetStudent.value = null;
        assignApiError.value = null;
    }
}

async function handleAssignCourseSubmit(courseId: string) {
    const student = assignTargetStudent.value;

    if (!student || isAssignSaving.value) {
        return;
    }

    assignApiError.value = null;
    isAssignSaving.value = true;

    try {
        await assignToCourse({ userId: student.userId, courseId });

        addToast({
            title: 'Kursant zapisany na kurs',
            variant: 'success',
        });

        assignDialogOpen.value = false;
        assignTargetStudent.value = null;

        await loadStudents();
    } catch (err) {
        const message = resolveAssignToCourseError(err);

        assignApiError.value = message;

        addToast({
            title: 'Nie udało się zapisać na kurs',
            description: message,
            variant: 'error',
        });
    } finally {
        isAssignSaving.value = false;
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
    <div class="space-y-5">
        <PageHeader
            title="Kursanci"
            description="Lista kursantów, filtry OSK i szybkie przypisanie kursu."
        >
            <template #actions>
                <UiButton
                    type="button"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                    aria-label="Otwórz formularz dodawania kursanta"
                    @click="handleOpenCreateDialog"
                >
                    <UserPlus class="mr-2 size-4" aria-hidden="true" />
                    Dodaj kursanta
                </UiButton>
            </template>
        </PageHeader>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Kursanci
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ totalStudentsCount }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Na stronie
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ students.length }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Aktywni na stronie
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ activeStudentsOnPage }}
                </p>
            </div>
            <div
                class="border-border bg-background rounded-2xl border p-4 shadow-sm"
            >
                <p class="text-muted-foreground text-sm font-medium">
                    Z numerem PKK
                </p>
                <p class="text-foreground mt-2 text-3xl font-extrabold">
                    {{ studentsWithPkkOnPage }}
                </p>
            </div>
        </div>

        <UiCard class="overflow-hidden rounded-2xl shadow-sm">
            <UiCardHeader class="border-border border-b p-5 pt-0">
                <div
                    class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"
                >
                    <div class="space-y-1">
                        <UiCardTitle class="text-xl font-extrabold">
                            Lista kursantów
                        </UiCardTitle>
                        <UiCardDescription>
                            {{ visibleStudentsLabel }}
                            <span v-if="activeSchool">
                                · {{ activeSchool.name }}
                            </span>
                        </UiCardDescription>
                    </div>
                    <UiBadge
                        v-if="activeCourse"
                        variant="outline"
                        class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                    >
                        Kurs: {{ activeCourse.name }}
                    </UiBadge>
                </div>
            </UiCardHeader>

            <UiCardContent
                class="space-y-4 px-4 py-0"
                :aria-busy="isSchoolsLoading || isStudentsLoading"
            >
                <div
                    class="border-border bg-muted/20 grid gap-3 rounded-2xl border p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                >
                    <div v-if="schools.length > 1" class="space-y-1.5">
                        <UiLabel for="students-page-school"
                            >Szkoła jazdy</UiLabel
                        >
                        <UiSelect
                            v-model="activeSchoolId"
                            :disabled="isStudentsLoading || isCoursesLoading"
                            @update:model-value="handleActiveSchoolChange"
                        >
                            <UiSelectTrigger
                                id="students-page-school"
                                class="bg-background h-11 w-full rounded-xl"
                                aria-label="Wybierz szkołę jazdy do podglądu listy kursantów"
                            >
                                <UiSelectValue placeholder="Wybierz szkołę" />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem
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
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                    </div>

                    <div
                        v-else
                        class="border-border bg-background rounded-xl border p-3"
                    >
                        <p class="text-muted-foreground text-xs font-medium">
                            Szkoła jazdy
                        </p>
                        <p
                            class="text-foreground mt-1 truncate text-sm font-bold"
                        >
                            {{ activeSchool?.name ?? 'Brak wybranej szkoły' }}
                        </p>
                    </div>

                    <div class="space-y-1.5">
                        <UiLabel for="students-page-course-filter">
                            Kurs
                        </UiLabel>
                        <UiSelect
                            v-model="activeCourseId"
                            :disabled="
                                isStudentsLoading ||
                                isCoursesLoading ||
                                !activeSchoolId
                            "
                            @update:model-value="handleCourseFilterChange"
                        >
                            <UiSelectTrigger
                                id="students-page-course-filter"
                                class="bg-background h-11 w-full rounded-xl"
                                aria-label="Wybierz kurs do filtrowania listy kursantów lub pozostaw wszystkie kursy"
                            >
                                <UiSelectValue placeholder="Wszystkie kursy" />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem
                                        v-for="c in courses"
                                        :key="c.id"
                                        :value="c.id"
                                    >
                                        {{ c.name }} ({{ c.category }})
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                    </div>
                </div>

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

                <div v-if="isSchoolsLoading" class="space-y-3" role="status">
                    <UiSkeleton class="h-16 rounded-xl" />
                    <UiSkeleton class="h-16 rounded-xl" />
                    <UiSkeleton class="h-16 rounded-xl" />
                </div>

                <ErrorState
                    v-else-if="schoolsLoadError"
                    title="Nie udało się wczytać szkół jazdy"
                    :description="schoolsLoadError"
                    @retry="loadSchools"
                />

                <EmptyState
                    v-else-if="schools.length === 0"
                    title="Brak szkół jazdy"
                    description="Dodaj OSK w panelu szkół, aby wyświetlić listę kursantów."
                />

                <ErrorState
                    v-else-if="studentsLoadError"
                    title="Nie udało się wczytać kursantów"
                    :description="studentsLoadError"
                    @retry="loadStudents"
                />

                <div
                    v-else-if="isStudentsLoading"
                    class="space-y-3"
                    role="status"
                >
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                    <UiSkeleton class="h-14 rounded-xl" />
                </div>

                <EmptyState
                    v-else-if="students.length === 0"
                    title="Brak kursantów"
                    description="W wybranej szkole lub filtrze kursu nie ma jeszcze kursantów."
                />

                <template v-else>
                    <div
                        class="hidden overflow-hidden rounded-2xl border md:block"
                    >
                        <table class="w-full min-w-[760px] text-left text-sm">
                            <thead
                                class="bg-muted/50 text-muted-foreground border-b"
                            >
                                <tr>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Kursant
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Kontakt
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Utworzono
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-4 py-3 font-semibold"
                                    >
                                        Akcje
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-border divide-y">
                                <tr
                                    v-for="student in students"
                                    :key="student.id"
                                    class="hover:bg-muted/30"
                                >
                                    <td class="px-4 py-3">
                                        <div
                                            class="flex min-w-0 items-center gap-3"
                                        >
                                            <div
                                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-extrabold text-sky-700"
                                            >
                                                {{ student.firstName[0]
                                                }}{{ student.lastName[0] }}
                                            </div>
                                            <div class="min-w-0">
                                                <p
                                                    class="truncate font-extrabold"
                                                >
                                                    {{
                                                        formatStudentDisplayName(
                                                            student,
                                                        )
                                                    }}
                                                </p>
                                                <p
                                                    class="text-muted-foreground text-xs"
                                                >
                                                    PKK:
                                                    {{
                                                        student.pkkNumber ??
                                                        'brak'
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="space-y-1">
                                            <p
                                                class="text-muted-foreground flex items-center gap-2 text-sm break-all"
                                            >
                                                <Mail
                                                    class="size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {{ student.email }}
                                            </p>
                                            <p
                                                class="text-muted-foreground flex items-center gap-2 text-sm"
                                            >
                                                <Phone
                                                    class="size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {{ student.phone ?? 'brak' }}
                                            </p>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <UiBadge
                                            variant="outline"
                                            class="rounded-full"
                                            :class="
                                                studentStatusClasses(student)
                                            "
                                        >
                                            {{ studentStatusLabel(student) }}
                                        </UiBadge>
                                    </td>
                                    <td class="text-muted-foreground px-4 py-3">
                                        {{
                                            formatStudentCreatedAt(
                                                student.createdAt,
                                            )
                                        }}
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex flex-wrap gap-2">
                                            <UiButton
                                                v-if="activeSchoolId"
                                                as-child
                                                variant="outline"
                                                size="sm"
                                                class="rounded-xl"
                                            >
                                                <NuxtLink
                                                    :to="{
                                                        path: `/manager/students/${student.userId}`,
                                                        query: {
                                                            schoolId:
                                                                activeSchoolId,
                                                        },
                                                    }"
                                                    :aria-label="`Otwórz szczegóły kursanta ${formatStudentDisplayName(student)}`"
                                                >
                                                    Szczegóły
                                                </NuxtLink>
                                            </UiButton>
                                            <UiButton
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                class="rounded-xl"
                                                :disabled="
                                                    !activeSchoolId ||
                                                    isStudentsLoading
                                                "
                                                :aria-label="`Przypisz ${formatStudentDisplayName(student)} do kursu`"
                                                @click="
                                                    handleOpenAssignCourse(
                                                        student,
                                                    )
                                                "
                                            >
                                                <UserPlus
                                                    class="mr-1.5 size-3.5 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                Kurs
                                            </UiButton>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="space-y-3 md:hidden">
                        <article
                            v-for="student in students"
                            :key="student.id"
                            class="border-border rounded-2xl border p-4"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="truncate font-extrabold">
                                        {{ formatStudentDisplayName(student) }}
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-1 text-sm break-all"
                                    >
                                        {{ student.email }}
                                    </p>
                                </div>
                                <UiBadge
                                    variant="outline"
                                    class="shrink-0 rounded-full"
                                    :class="studentStatusClasses(student)"
                                >
                                    {{ studentStatusLabel(student) }}
                                </UiBadge>
                            </div>

                            <div class="mt-3 flex flex-wrap gap-2">
                                <UiBadge
                                    variant="outline"
                                    class="bg-muted/40 rounded-full"
                                >
                                    PKK: {{ student.pkkNumber ?? 'brak' }}
                                </UiBadge>
                                <UiBadge
                                    variant="outline"
                                    class="bg-muted/40 rounded-full"
                                >
                                    {{
                                        formatStudentCreatedAt(
                                            student.createdAt,
                                        )
                                    }}
                                </UiBadge>
                            </div>

                            <div class="mt-4 grid gap-2 sm:grid-cols-2">
                                <UiButton
                                    v-if="activeSchoolId"
                                    as-child
                                    variant="outline"
                                    size="sm"
                                    class="rounded-xl"
                                >
                                    <NuxtLink
                                        :to="{
                                            path: `/manager/students/${student.userId}`,
                                            query: { schoolId: activeSchoolId },
                                        }"
                                        :aria-label="`Otwórz szczegóły kursanta ${formatStudentDisplayName(student)}`"
                                    >
                                        Szczegóły
                                    </NuxtLink>
                                </UiButton>
                                <UiButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    class="rounded-xl"
                                    :disabled="
                                        !activeSchoolId || isStudentsLoading
                                    "
                                    :aria-label="`Przypisz ${formatStudentDisplayName(student)} do kursu`"
                                    @click="handleOpenAssignCourse(student)"
                                >
                                    <UserPlus
                                        class="mr-1.5 size-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    Przypisz kurs
                                </UiButton>
                            </div>
                        </article>
                    </div>
                </template>

                <div
                    v-if="
                        activeSchoolId &&
                        studentsPagination &&
                        studentsPagination.totalPages > 1 &&
                        !studentsLoadError
                    "
                    class="border-border flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between"
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
                            size="sm"
                            class="rounded-xl"
                            :disabled="currentPage <= 1 || isStudentsLoading"
                            aria-label="Poprzednia strona listy kursantów"
                            @click="handlePrevPage"
                        >
                            <ChevronLeft
                                class="mr-1 size-4"
                                aria-hidden="true"
                            />
                            Poprzednia
                        </UiButton>
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            class="rounded-xl"
                            :disabled="
                                currentPage >= studentsPagination.totalPages ||
                                isStudentsLoading
                            "
                            aria-label="Następna strona listy kursantów"
                            @click="handleNextPage"
                        >
                            Następna
                            <ChevronRight
                                class="ml-1 size-4"
                                aria-hidden="true"
                            />
                        </UiButton>
                    </div>
                </div>
            </UiCardContent>
        </UiCard>

        <ManagerStudentAssignCourseDialog
            :open="assignDialogOpen"
            :student-display-name="assignTargetDisplayName"
            :courses="courses"
            :is-courses-loading="isCoursesLoading"
            :courses-load-error="coursesLoadError"
            :is-saving="isAssignSaving"
            :api-error="assignApiError"
            @update:open="handleAssignDialogOpenChange"
            @submit="handleAssignCourseSubmit"
        />

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
