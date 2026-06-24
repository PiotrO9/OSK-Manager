<script setup lang="ts">
import type {
    ScheduleLessonItem,
    ScheduleLessonRating,
} from '~/types/schedule';

const props = defineProps<{
    items: readonly ScheduleLessonItem[];
    selectedLessonId: string | null;
    isRefreshing?: boolean;
    isSubmitting?: boolean;
    errorMessage?: string | null;
}>();

const emit = defineEmits<{
    select: [lesson: ScheduleLessonItem];
    submit: [
        payload: {
            lesson: ScheduleLessonItem;
            rating: number;
            comment: string | null;
        },
    ];
}>();

const completedPracticeLessons = computed(() =>
    props.items
        .filter(
            (item) =>
                item.kind === 'lesson' &&
                item.type.trim().toUpperCase() === 'PRACTICE' &&
                item.status.trim().toUpperCase() === 'COMPLETED',
        )
        .sort(
            (a, b) =>
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime(),
        ),
);

const lessonsWaitingForRating = computed(() =>
    completedPracticeLessons.value.filter((item) => !item.rating),
);

const selectedLesson = computed(() => {
    const selectedId = props.selectedLessonId?.trim() ?? '';

    if (selectedId) {
        const selected = completedPracticeLessons.value.find(
            (item) => item.id === selectedId,
        );

        if (selected) {
            return selected;
        }
    }

    return completedPracticeLessons.value[0] ?? null;
});

function formatIsoLocal(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(d);
}

function displayInstructor(item: ScheduleLessonItem): string {
    const instructor = item.instructor;

    if (!instructor) {
        return 'Instruktor';
    }

    const fullName = `${instructor.firstName} ${instructor.lastName}`.trim();

    return fullName.length > 0 ? fullName : 'Instruktor';
}

function ratingLabel(rating: ScheduleLessonRating): string {
    return `${rating.rating}/5`;
}

function handleSubmit(payload: { rating: number; comment: string | null }) {
    const lesson = selectedLesson.value;

    if (!lesson) {
        return;
    }

    emit('submit', { lesson, ...payload });
}
</script>

<template>
    <section class="flex flex-col gap-4" aria-labelledby="lesson-ratings-title">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex flex-col gap-1">
                <h2
                    id="lesson-ratings-title"
                    class="text-foreground text-lg font-semibold"
                >
                    Opinie po jazdach
                </h2>
                <p class="text-muted-foreground text-sm">
                    Lekcje do oceny w wybranym tygodniu:
                    {{ lessonsWaitingForRating.length }}
                </p>
            </div>
        </div>

        <p
            v-if="completedPracticeLessons.length === 0"
            class="text-muted-foreground rounded-lg border px-4 py-5 text-sm"
            role="status"
        >
            Brak zakończonych jazd praktycznych w tym tygodniu.
        </p>

        <div v-else class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div class="flex flex-col gap-2">
                <button
                    v-for="lesson in completedPracticeLessons"
                    :key="lesson.id"
                    type="button"
                    class="border-border bg-background hover:bg-muted/50 focus-visible:ring-ring flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    :class="
                        selectedLesson?.id === lesson.id ? 'border-primary' : ''
                    "
                    @click="emit('select', lesson)"
                >
                    <span class="flex min-w-0 flex-col gap-1">
                        <span
                            class="text-foreground truncate text-sm font-medium"
                        >
                            {{ displayInstructor(lesson) }}
                        </span>
                        <span class="text-muted-foreground text-xs">
                            {{ formatIsoLocal(lesson.startTime) }}
                        </span>
                    </span>
                    <UiBadge
                        v-if="lesson.rating"
                        variant="secondary"
                        class="shrink-0"
                    >
                        {{ ratingLabel(lesson.rating) }}
                    </UiBadge>
                    <UiBadge v-else variant="outline" class="shrink-0">
                        Do oceny
                    </UiBadge>
                </button>
            </div>

            <div class="rounded-lg border p-4">
                <div v-if="selectedLesson" class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1">
                        <h3 class="text-foreground text-base font-semibold">
                            {{ displayInstructor(selectedLesson) }}
                        </h3>
                        <p class="text-muted-foreground text-sm">
                            {{ formatIsoLocal(selectedLesson.startTime) }}
                        </p>
                        <p
                            v-if="isRefreshing"
                            class="text-muted-foreground text-xs"
                            role="status"
                        >
                            Odświeżanie opinii...
                        </p>
                    </div>

                    <div
                        v-if="selectedLesson.rating"
                        class="flex flex-col gap-2"
                    >
                        <UiBadge variant="secondary" class="w-fit">
                            Ocena {{ ratingLabel(selectedLesson.rating) }}
                        </UiBadge>
                        <p v-if="selectedLesson.rating.comment" class="text-sm">
                            {{ selectedLesson.rating.comment }}
                        </p>
                        <p v-else class="text-muted-foreground text-sm">
                            Brak komentarza.
                        </p>
                    </div>

                    <StudentLessonRatingForm
                        v-else
                        :lesson="selectedLesson"
                        :is-submitting="isSubmitting"
                        @submit="handleSubmit"
                    />

                    <p
                        v-if="errorMessage"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ errorMessage }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
