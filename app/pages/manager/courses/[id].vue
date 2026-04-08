<script setup lang="ts">
import { ArrowLeft, BookOpen, User } from 'lucide-vue-next';
import { formatCourseKindLabel, type CourseDetail } from '~/types/course';
import { getApiErrorStatusCode } from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { fetchById, isDetailLoading } = useCoursesApi();

const course = ref<CourseDetail | null>(null);
const loadError = ref<string | null>(null);
let fetchSeq = 0;

usePageMeta({
    title: () => course.value?.name?.trim() || 'Szczegóły kursu',
    description: () => 'Podgląd danych kursu i instruktora (tylko odczyt).',
});

function getRouteIdString(rawId: unknown): string {
    if (typeof rawId === 'string') {
        return rawId.trim();
    }

    if (Array.isArray(rawId)) {
        return String(rawId[0] ?? '').trim();
    }

    return '';
}

function resolveCourseDetailError(err: unknown): string {
    const status = getApiErrorStatusCode(err);

    if (status === 403) {
        return 'Brak dostępu do szczegółów tego kursu.';
    }

    if (status === 404) {
        return 'Nie znaleziono kursu.';
    }

    if (status !== undefined && status >= 500) {
        return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message.trim();
    }

    return getApiFetchErrorMessage(err, 'Nie udało się wczytać danych kursu.');
}

function formatCapacityText(capacity: number | null): string {
    if (capacity === null) {
        return 'Brak limitu';
    }

    return String(capacity);
}

function formatInstructorName(c: CourseDetail): string {
    const name = c.instructor?.name?.trim();

    if (name && name.length > 0) {
        return name;
    }

    return 'Brak instruktora';
}

async function loadCourse(rawId: unknown) {
    loadError.value = null;

    const id = getRouteIdString(rawId);

    if (!id) {
        course.value = null;
        loadError.value = 'Nie znaleziono kursu.';

        return;
    }

    const seq = ++fetchSeq;

    course.value = null;

    try {
        const data = await fetchById(id);

        if (seq !== fetchSeq) {
            return;
        }

        course.value = data;
    } catch (err: unknown) {
        if (seq !== fetchSeq) {
            return;
        }

        course.value = null;
        loadError.value = resolveCourseDetailError(err);
    }
}

watch(
    () => route.params.id,
    async (id) => {
        await loadCourse(id);
    },
    { immediate: true },
);
</script>

<template>
    <div class="space-y-6">
        <div>
            <NuxtLink
                to="/manager/courses"
                class="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 text-sm"
                aria-label="Wróć do listy kursów"
            >
                <ArrowLeft class="size-4 shrink-0" aria-hidden="true" />
                Lista kursów
            </NuxtLink>
            <div class="space-y-1">
                <h1
                    class="text-foreground flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight"
                >
                    <BookOpen
                        class="text-muted-foreground size-7 shrink-0"
                        aria-hidden="true"
                    />
                    <span>{{ course?.name?.trim() || 'Szczegóły kursu' }}</span>
                </h1>
                <p class="text-muted-foreground text-sm">
                    Dane kursu i przypisanego instruktora (MVP — tylko odczyt).
                </p>
            </div>
        </div>

        <p
            v-if="isDetailLoading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie danych kursu…
        </p>

        <p
            v-else-if="loadError"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ loadError }}
        </p>

        <template v-else-if="course">
            <div class="grid gap-6 md:grid-cols-1 lg:max-w-2xl">
                <UiCard aria-label="Dane kursu">
                    <UiCardHeader>
                        <UiCardTitle class="text-base">Dane kursu</UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent>
                        <dl class="grid gap-3 text-sm">
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">Nazwa</dt>
                                <dd class="text-foreground font-medium">
                                    {{ course.name }}
                                </dd>
                            </div>
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">Kategoria</dt>
                                <dd class="text-foreground">
                                    {{ course.category }}
                                </dd>
                            </div>
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">Typ</dt>
                                <dd>
                                    <UiBadge variant="secondary" class="w-fit">
                                        {{ formatCourseKindLabel(course.type) }}
                                    </UiBadge>
                                </dd>
                            </div>
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">
                                    Liczba godzin
                                </dt>
                                <dd class="text-foreground tabular-nums">
                                    {{ course.totalHours }}
                                </dd>
                            </div>
                            <div class="grid gap-0.5">
                                <dt class="text-muted-foreground">
                                    Limit miejsc
                                </dt>
                                <dd class="text-foreground">
                                    {{ formatCapacityText(course.capacity) }}
                                </dd>
                            </div>
                        </dl>
                    </UiCardContent>
                </UiCard>

                <UiCard aria-label="Instruktor">
                    <UiCardHeader>
                        <UiCardTitle class="flex items-center gap-2 text-base">
                            <User
                                class="text-muted-foreground size-4"
                                aria-hidden="true"
                            />
                            Instruktor
                        </UiCardTitle>
                    </UiCardHeader>
                    <UiCardContent>
                        <p class="text-foreground text-sm">
                            {{ formatInstructorName(course) }}
                        </p>
                    </UiCardContent>
                </UiCard>
            </div>
        </template>
    </div>
</template>
