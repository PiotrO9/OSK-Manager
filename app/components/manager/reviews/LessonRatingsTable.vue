<script setup lang="ts">
import {
    formatLessonRatingPersonName,
    type LessonRatingPerson,
    type LessonRatingListItem,
} from '~/types/lessons/lessonRating';
import ProfileAvatar from '~/components/app/ProfileAvatar.vue';

const props = withDefaults(
    defineProps<{
        ratings: LessonRatingListItem[];
        showStudent?: boolean;
        showInstructorMeta?: boolean;
        isLoading?: boolean;
        emptyLabel?: string;
    }>(),
    {
        showStudent: true,
        showInstructorMeta: true,
        isLoading: false,
        emptyLabel: 'Brak opinii',
    },
);

function formatDateTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function ratingLabel(value: number): string {
    return value.toFixed(1);
}

function lessonMetaLabel(rating: LessonRatingListItem): string {
    const parts: string[] = [];

    if (props.showStudent) {
        const studentName = formatLessonRatingPersonName(rating.student);

        if (studentName !== '-') {
            parts.push(studentName);
        }
    }

    if (props.showInstructorMeta) {
        const instructorName = formatLessonRatingPersonName(rating.instructor);

        if (instructorName !== '-') {
            parts.push(instructorName);
        }
    }

    parts.push(formatDateTime(rating.lesson.startTime));

    return parts.join(' - ');
}

function personInitials(person: LessonRatingPerson): string {
    const first = person.firstName.trim().charAt(0);
    const last = person.lastName.trim().charAt(0);
    const initials = `${first}${last}`.trim();

    return initials.length > 0 ? initials.toUpperCase() : '?';
}

function visiblePeople(
    rating: LessonRatingListItem,
): { key: string; person: LessonRatingPerson }[] {
    const people: { key: string; person: LessonRatingPerson }[] = [];

    if (props.showStudent && rating.student) {
        people.push({
            key: `student-${rating.student.id}`,
            person: rating.student,
        });
    }

    if (props.showInstructorMeta) {
        people.push({
            key: `instructor-${rating.instructor.id}`,
            person: rating.instructor,
        });
    }

    return people;
}
</script>

<template>
    <section
        class="border-border bg-card min-w-0 overflow-hidden rounded-xl border shadow-xs"
        aria-labelledby="lesson-ratings-list-title"
        :aria-busy="props.isLoading"
    >
        <div class="border-border border-b px-4 py-4 md:px-5">
            <h2
                id="lesson-ratings-list-title"
                class="text-foreground text-lg font-bold tracking-tight"
            >
                Ostatnie opinie
            </h2>
            <p class="text-muted-foreground mt-1 text-sm">
                Lista zachowuje filtry, komentarze i powiazanie z lekcja.
            </p>
        </div>

        <div class="space-y-2 p-4 md:p-3">
            <article
                v-for="rating in props.ratings"
                :key="rating.id"
                class="border-border bg-background flex min-w-0 items-start justify-between gap-3 rounded-xl border px-3 py-3 md:px-4"
            >
                <div class="min-w-0 space-y-1">
                    <div
                        v-if="visiblePeople(rating).length > 0"
                        class="flex min-w-0 flex-wrap items-center gap-2"
                    >
                        <span
                            v-for="entry in visiblePeople(rating)"
                            :key="entry.key"
                            class="flex min-w-0 items-center gap-1.5"
                        >
                            <ProfileAvatar
                                :src="entry.person.avatarUrl"
                                :initials="personInitials(entry.person)"
                                :size="24"
                                class="border-border bg-muted/40 text-muted-foreground border"
                            />
                            <span
                                class="text-muted-foreground max-w-40 truncate text-xs"
                            >
                                {{ formatLessonRatingPersonName(entry.person) }}
                            </span>
                        </span>
                    </div>
                    <p class="text-foreground text-sm leading-snug font-bold">
                        <span v-if="rating.comment">
                            {{ rating.comment }}
                        </span>
                        <span v-else>Brak komentarza do tej jazdy.</span>
                    </p>
                    <p class="text-muted-foreground text-xs">
                        {{ lessonMetaLabel(rating) }}
                    </p>
                </div>

                <UiBadge
                    variant="outline"
                    class="shrink-0 rounded-full border-sky-200 bg-sky-50 px-3 py-1 font-semibold text-sky-700 tabular-nums"
                >
                    {{ ratingLabel(rating.rating) }}
                </UiBadge>
            </article>

            <p
                v-if="props.ratings.length === 0"
                class="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm"
                role="status"
            >
                {{
                    props.isLoading ? 'Wczytywanie opinii...' : props.emptyLabel
                }}
            </p>
        </div>
    </section>
</template>
