<script setup lang="ts">
import {
    BookOpen,
    CalendarDays,
    CarFront,
    Clock3,
    MessageSquareText,
    Star,
} from 'lucide-vue-next';
import AppUserIdentity from '~/components/app/AppUserIdentity.vue';
import {
    formatLessonRatingPersonName,
    type LessonRatingListItem,
    type LessonRatingPerson,
} from '~/types/lessons/lessonRating';
import { formatLessonRatingValue } from '~/utils/lessons/myReviews';

const props = defineProps<{
    rating: LessonRatingListItem;
    schoolId: string;
}>();

const dateTimeFormatter = new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const durationMinutes = computed(() => {
    const start = new Date(props.rating.lesson.startTime).getTime();
    const end = new Date(props.rating.lesson.endTime).getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        return null;
    }

    return Math.round((end - start) / 60_000);
});

const courseSubtitle = computed(() => {
    const course = props.rating.lesson.course;

    if (!course) return 'Kurs niedostępny';

    return [
        course.category ? `kat. ${course.category}` : course.courseType.name,
        course.totalHours > 0 ? `${course.totalHours} godz. programu` : '',
    ]
        .filter(Boolean)
        .join(' · ');
});

const progressLabel = computed(() => {
    const completedMinutes = props.rating.lesson.completedMinutesAfterLesson;
    const totalHours = props.rating.lesson.course?.totalHours;

    if (
        completedMinutes === null ||
        totalHours === undefined ||
        totalHours <= 0
    ) {
        return null;
    }

    const completedHours = new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 2,
    }).format(completedMinutes / 60);

    return `Po tej jeździe: ${completedHours} / ${totalHours} godz.`;
});

const vehicleLabel = computed(() => {
    const vehicle = props.rating.lesson.vehicle;

    return vehicle
        ? `${vehicle.name} · ${vehicle.registrationNumber}`
        : 'Nie przypisano pojazdu';
});

function formatDateTime(value: string): string {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? 'Termin niedostępny'
        : dateTimeFormatter.format(date);
}

function formatDuration(minutes: number | null): string {
    if (minutes === null) return 'Czas niedostępny';

    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes > 0
        ? `${hours} godz. ${remainingMinutes} min`
        : `${hours} godz.`;
}

function personInitials(person: LessonRatingPerson): string {
    const initials = `${person.firstName.trim().charAt(0)}${person.lastName
        .trim()
        .charAt(0)}`.trim();

    return initials ? initials.toUpperCase() : '?';
}
</script>

<template>
    <article
        class="group bg-card hover:bg-muted/20 grid min-w-0 gap-5 px-4 py-5 transition-colors sm:px-5 2xl:grid-cols-[minmax(14rem,1.25fr)_minmax(20rem,1fr)_minmax(13rem,0.72fr)] 2xl:gap-6 2xl:px-6"
    >
        <div class="flex min-w-0 flex-col">
            <div class="flex min-w-0 items-start justify-between gap-3">
                <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                        <span
                            class="border-primary/20 bg-primary/8 text-primary inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-bold tabular-nums"
                        >
                            {{
                                props.rating.lesson.sequenceNumber
                                    ? `Jazda nr ${props.rating.lesson.sequenceNumber}`
                                    : 'Jazda praktyczna'
                            }}
                        </span>
                        <span
                            v-if="progressLabel"
                            class="border-border bg-muted/60 text-muted-foreground inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold tabular-nums"
                        >
                            {{ progressLabel }}
                        </span>
                        <NuxtLink
                            v-if="props.rating.lesson.course"
                            :to="`/manager/courses/${props.rating.lesson.course.id}`"
                            class="text-foreground focus-visible:ring-ring truncate rounded-sm text-sm font-bold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                        >
                            {{ props.rating.lesson.course.name }}
                        </NuxtLink>
                    </div>
                    <p class="text-muted-foreground mt-1 text-xs font-medium">
                        {{ courseSubtitle }}
                    </p>
                </div>

                <div
                    class="border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-300 flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums 2xl:hidden"
                    :aria-label="`Ocena ${formatLessonRatingValue(props.rating.rating)} na 5`"
                >
                    <Star class="size-3.5 fill-current" aria-hidden="true" />
                    <span aria-hidden="true">
                        {{ formatLessonRatingValue(props.rating.rating) }} / 5
                    </span>
                </div>
            </div>

            <div class="mt-5 min-w-0 2xl:mt-auto 2xl:pt-5">
                <div class="mb-1.5 flex items-center gap-2">
                    <BookOpen
                        class="text-muted-foreground size-4"
                        aria-hidden="true"
                    />
                    <p class="text-muted-foreground text-xs font-semibold">
                        Komentarz kursanta
                    </p>
                </div>
                <p
                    class="text-foreground border-primary/30 border-l-2 pl-3 text-sm leading-relaxed font-semibold text-pretty break-words"
                >
                    {{
                        props.rating.comment?.trim() ||
                        'Bez komentarza do tej jazdy.'
                    }}
                </p>
            </div>
        </div>

        <dl
            class="border-border bg-muted/30 grid self-stretch overflow-hidden rounded-xl border sm:grid-cols-2"
        >
            <div class="bg-card flex min-w-0 gap-2.5 p-3">
                <CalendarDays
                    class="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                />
                <div class="flex flex-wrap items-center gap-2">
                    <div class="min-w-0">
                        <dt
                            class="text-muted-foreground text-[11px] font-medium"
                        >
                            Termin jazdy
                        </dt>
                        <dd
                            class="text-foreground mt-0.5 text-xs font-semibold tabular-nums"
                        >
                            {{ formatDateTime(props.rating.lesson.startTime) }}
                        </dd>
                    </div>
                </div>
            </div>

            <div
                class="border-border bg-card flex min-w-0 gap-2.5 border-t p-3 sm:border-t-0 sm:border-l"
            >
                <Clock3
                    class="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                />
                <div class="min-w-0">
                    <dt class="text-muted-foreground text-[11px] font-medium">
                        Czas trwania
                    </dt>
                    <dd class="text-foreground mt-0.5 text-xs font-semibold">
                        {{ formatDuration(durationMinutes) }}
                    </dd>
                </div>
            </div>

            <div
                class="border-border bg-card flex min-w-0 gap-2.5 border-t p-3"
            >
                <CarFront
                    class="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                />
                <div class="min-w-0">
                    <dt class="text-muted-foreground text-[11px] font-medium">
                        Pojazd
                    </dt>
                    <dd
                        class="text-foreground mt-0.5 text-xs font-semibold break-words"
                    >
                        {{ vehicleLabel }}
                    </dd>
                </div>
            </div>

            <div
                class="border-border bg-card flex min-w-0 gap-2.5 border-t p-3 sm:border-l"
            >
                <MessageSquareText
                    class="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                />
                <div class="min-w-0">
                    <dt class="text-muted-foreground text-[11px] font-medium">
                        Wystawiono opinię
                    </dt>
                    <dd
                        class="text-foreground mt-0.5 text-xs font-semibold tabular-nums"
                    >
                        {{ formatDateTime(props.rating.createdAt) }}
                    </dd>
                </div>
            </div>
        </dl>

        <div
            class="border-border flex min-w-0 flex-col gap-3 border-t pt-4 2xl:border-t-0 2xl:border-l 2xl:pt-0 2xl:pl-6"
        >
            <div
                class="border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-300 hidden w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums 2xl:flex"
                :aria-label="`Ocena ${formatLessonRatingValue(props.rating.rating)} na 5`"
            >
                <Star class="size-3.5 fill-current" aria-hidden="true" />
                <span aria-hidden="true">
                    {{ formatLessonRatingValue(props.rating.rating) }} / 5
                </span>
            </div>
            <div class="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                <NuxtLink
                    v-if="props.rating.student"
                    :to="{
                        path: `/manager/students/${props.rating.student.userId}`,
                        query: { schoolId: props.schoolId },
                    }"
                    class="focus-visible:ring-ring w-fit max-w-full justify-self-start rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <AppUserIdentity
                        :avatar-src="props.rating.student.avatarUrl"
                        :initials="personInitials(props.rating.student)"
                        :name="
                            formatLessonRatingPersonName(props.rating.student)
                        "
                        subtitle="Kursant"
                        :avatar-size="36"
                    />
                </NuxtLink>

                <NuxtLink
                    :to="{
                        path: `/manager/instructors/${props.rating.instructor.id}`,
                        query: { schoolId: props.schoolId },
                    }"
                    class="focus-visible:ring-ring w-fit max-w-full justify-self-start rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <AppUserIdentity
                        :avatar-src="props.rating.instructor.avatarUrl"
                        :initials="personInitials(props.rating.instructor)"
                        :name="
                            formatLessonRatingPersonName(
                                props.rating.instructor,
                            )
                        "
                        subtitle="Instruktor"
                        :avatar-size="36"
                    />
                </NuxtLink>
            </div>
        </div>
    </article>
</template>
