<script setup lang="ts">
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    Mail,
    Pencil,
    Phone,
    Star,
    Trash2,
    UserRound,
} from 'lucide-vue-next';
import {
    formatCourseTypeOptionLabel,
    type CourseTypeOption,
} from '~/types/courseType';
import type { InstructorDetail } from '~/types/instructor';
import type { LessonRatingsSummary } from '~/types/lessonRating';
import type { SummaryStripItem } from '~/components/app/ui/types';

const props = defineProps<{
    instructor: InstructorDetail;
    ratingSummary: LessonRatingsSummary;
    isRatingSummaryLoading: boolean;
    isSubmitting: boolean;
    isDeleting: boolean;
    subpageQuery: Record<string, string>;
}>();

const emit = defineEmits<{
    edit: [];
    delete: [];
}>();

function displayValue(value: string): string {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : '-';
}

const initials = computed(() => {
    const normalized = props.instructor.name
        .split(/\s+/)
        .map((part) => part.trim().charAt(0))
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .join('');

    return normalized.length > 0 ? normalized.toUpperCase() : 'IN';
});

const categoryLabel = computed(() => {
    const labels = props.instructor.qualifiedCourseTypes
        .map((courseType) => courseType.code.trim() || courseType.name.trim())
        .filter((label) => label.length > 0);

    return labels.length > 0 ? labels.join(', ') : 'Brak kategorii';
});

const ratingAverageLabel = computed(() => {
    if (props.isRatingSummaryLoading) {
        return '...';
    }

    const average = props.ratingSummary.averageRating;

    return average === null ? '-' : average.toFixed(2);
});

const ratingsCountLabel = computed(() => {
    const count = props.ratingSummary.totalCount;

    if (count === 1) {
        return '1 opinia';
    }

    if (count >= 2 && count <= 4) {
        return `${count} opinie`;
    }

    return `${count} opinii`;
});

const summaryItems = computed<SummaryStripItem[]>(() => [
    {
        label: 'Kategorie',
        value: props.instructor.qualifiedCourseTypes.length,
        description: categoryLabel.value,
        tone: 'info',
    },
    {
        label: 'Doswiadczenie',
        value: displayValue(props.instructor.experience),
        description: 'Z profilu instruktora',
        tone: 'neutral',
    },
    {
        label: 'Srednia ocen',
        value: ratingAverageLabel.value,
        description: ratingsCountLabel.value,
        tone:
            props.ratingSummary.averageRating === null ? 'neutral' : 'success',
    },
    {
        label: 'Telefon',
        value: displayValue(props.instructor.phone),
        description: 'Dane kontaktowe',
        tone: 'neutral',
    },
]);

const actionDisabledClass = computed(() =>
    props.isDeleting ? 'pointer-events-none cursor-not-allowed opacity-50' : '',
);

const relatedLinks = computed(() => [
    {
        label: 'Dostepnosc',
        description: 'Tygodniowy wzorzec pracy',
        to: {
            path: `/manager/instructors/${props.instructor.id}/availability`,
            query: props.subpageQuery,
        },
        icon: Clock3,
    },
    {
        label: 'Terminarz',
        description: 'Wolne sloty instruktora',
        to: {
            path: `/manager/instructors/${props.instructor.id}/slots`,
            query: props.subpageQuery,
        },
        icon: CalendarDays,
    },
    {
        label: 'Lekcje',
        description: 'Lekcje i bloki czasu',
        to: {
            path: `/manager/instructors/${props.instructor.id}/schedule`,
            query: props.subpageQuery,
        },
        icon: UserRound,
    },
]);

const profileRows = computed(() => [
    { label: 'Status', value: 'Aktywny' },
    { label: 'Kategorie', value: categoryLabel.value },
    { label: 'Telefon', value: displayValue(props.instructor.phone) },
    { label: 'Email', value: displayValue(props.instructor.email) },
    { label: 'Licencja', value: displayValue(props.instructor.licenseNumber) },
]);

function courseTypeLabel(courseType: CourseTypeOption): string {
    return formatCourseTypeOptionLabel(courseType);
}
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            :title="displayValue(props.instructor.name)"
            description="Szczegoly instruktora, kwalifikacje, oceny i dostepnosc."
            eyebrow="Instruktor"
        >
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        to="/manager/instructors"
                        aria-label="Wroc do listy instruktorow"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista
                    </NuxtLink>
                </UiButton>

                <UiButton
                    type="button"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                    :disabled="props.isDeleting"
                    aria-label="Edytuj dane instruktora"
                    @click="emit('edit')"
                >
                    <Pencil class="mr-2 size-4" aria-hidden="true" />
                    Edytuj
                </UiButton>
            </template>
        </PageHeader>

        <SummaryStrip :items="summaryItems" />

        <div class="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,360px)_1fr]">
            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardContent class="p-5">
                    <div class="space-y-5">
                        <div class="flex items-start gap-4">
                            <div
                                class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-xl font-extrabold text-sky-700"
                                aria-hidden="true"
                            >
                                {{ initials }}
                            </div>

                            <div class="min-w-0 pt-1">
                                <h2
                                    class="text-foreground truncate text-xl font-extrabold"
                                >
                                    {{ displayValue(props.instructor.name) }}
                                </h2>
                                <p class="text-muted-foreground mt-1 text-sm">
                                    Instruktor · {{ categoryLabel }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="border-border divide-border divide-y border-t"
                        >
                            <div
                                v-for="row in profileRows"
                                :key="row.label"
                                class="grid grid-cols-[6.5rem_1fr] gap-3 py-3 text-sm"
                            >
                                <p class="text-muted-foreground">
                                    {{ row.label }}
                                </p>
                                <p
                                    class="text-foreground min-w-0 text-right font-semibold break-words"
                                >
                                    {{ row.value }}
                                </p>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <StatusBadge label="Aktywny" tone="success" />
                            <StatusBadge
                                :label="
                                    props.instructor.qualifiedCourseTypes
                                        .length > 0
                                        ? 'Kwalifikacje'
                                        : 'Brak kategorii'
                                "
                                :tone="
                                    props.instructor.qualifiedCourseTypes
                                        .length > 0
                                        ? 'info'
                                        : 'neutral'
                                "
                                subtle
                            />
                        </div>
                    </div>
                </UiCardContent>
            </UiCard>

            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader
                    class="border-border flex flex-row items-start justify-between gap-4 border-b p-5"
                >
                    <div class="min-w-0">
                        <UiCardTitle class="text-xl font-extrabold">
                            Przeglad
                        </UiCardTitle>
                        <UiCardDescription>
                            Najwazniejsze dane i akcje dla tego widoku.
                        </UiCardDescription>
                    </div>
                    <StatusBadge label="Aktualne" tone="info" subtle />
                </UiCardHeader>

                <UiCardContent class="space-y-3 p-4">
                    <div
                        class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="min-w-0">
                            <p class="text-foreground font-semibold">
                                Dostepnosc tygodniowa
                            </p>
                            <p class="text-muted-foreground mt-1 text-sm">
                                Zachowana w podgladzie ponizej i w osobnym
                                panelu edycji.
                            </p>
                        </div>
                        <StatusBadge label="Aktywna" tone="success" subtle />
                    </div>

                    <div
                        class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="min-w-0">
                            <p class="text-foreground font-semibold">
                                Oceny lekcji
                            </p>
                            <p class="text-muted-foreground mt-1 text-sm">
                                {{ ratingsCountLabel }}
                            </p>
                        </div>
                        <StatusBadge
                            :label="ratingAverageLabel"
                            :tone="
                                props.ratingSummary.averageRating === null
                                    ? 'neutral'
                                    : 'info'
                            "
                            subtle
                        />
                    </div>

                    <div
                        class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="min-w-0">
                            <p class="text-foreground font-semibold">Akcje</p>
                            <p class="text-muted-foreground mt-1 text-sm">
                                Edycja, usuniecie, terminarz i dostepnosc.
                            </p>
                        </div>
                        <StatusBadge label="5 akcji" tone="neutral" subtle />
                    </div>
                </UiCardContent>
            </UiCard>
        </div>

        <div
            class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
        >
            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader class="border-border border-b p-5">
                    <UiCardTitle class="text-xl font-extrabold">
                        Dostepnosc
                    </UiCardTitle>
                    <UiCardDescription>
                        Tygodniowy wzorzec pracy instruktora.
                    </UiCardDescription>
                </UiCardHeader>
                <UiCardContent class="p-5">
                    <ManagerInstructorWeeklyAvailabilityPreview
                        :instructor-id="props.instructor.id"
                    />
                </UiCardContent>
            </UiCard>

            <div class="space-y-5">
                <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                    <UiCardHeader class="border-border border-b p-5">
                        <UiCardTitle class="text-xl font-extrabold">
                            Powiazane dane
                        </UiCardTitle>
                        <UiCardDescription>
                            Elementy, ktorych nie mozna zgubic po redesignie.
                        </UiCardDescription>
                    </UiCardHeader>

                    <UiCardContent class="space-y-3 p-4">
                        <NuxtLink
                            v-for="item in relatedLinks"
                            :key="item.label"
                            :to="item.to"
                            class="border-border hover:bg-muted/40 focus-visible:ring-ring flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            :class="actionDisabledClass"
                            :tabindex="props.isDeleting ? -1 : 0"
                            :aria-disabled="props.isDeleting"
                        >
                            <span class="flex min-w-0 items-center gap-3">
                                <span
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                                >
                                    <component
                                        :is="item.icon"
                                        class="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span class="min-w-0">
                                    <span
                                        class="text-foreground block font-semibold"
                                    >
                                        {{ item.label }}
                                    </span>
                                    <span
                                        class="text-muted-foreground mt-0.5 block text-sm"
                                    >
                                        {{ item.description }}
                                    </span>
                                </span>
                            </span>
                            <StatusBadge
                                label="Widoczne"
                                tone="neutral"
                                subtle
                            />
                        </NuxtLink>

                        <NuxtLink
                            v-if="props.subpageQuery.schoolId"
                            :to="{
                                path: '/manager/reviews',
                                query: {
                                    schoolId: props.subpageQuery.schoolId,
                                    instructorId: props.instructor.id,
                                },
                            }"
                            class="border-border hover:bg-muted/40 focus-visible:ring-ring flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            :class="actionDisabledClass"
                            :tabindex="props.isDeleting ? -1 : 0"
                            :aria-disabled="props.isDeleting"
                        >
                            <span class="flex min-w-0 items-center gap-3">
                                <span
                                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                                >
                                    <Star class="size-4" aria-hidden="true" />
                                </span>
                                <span class="min-w-0">
                                    <span
                                        class="text-foreground block font-semibold"
                                    >
                                        Opinie
                                    </span>
                                    <span
                                        class="text-muted-foreground mt-0.5 block text-sm"
                                    >
                                        Lista opinii tego instruktora
                                    </span>
                                </span>
                            </span>
                            <StatusBadge
                                label="Widoczne"
                                tone="neutral"
                                subtle
                            />
                        </NuxtLink>
                    </UiCardContent>
                </UiCard>

                <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                    <UiCardHeader class="border-border border-b p-5">
                        <UiCardTitle class="text-xl font-extrabold">
                            Kontakt i kwalifikacje
                        </UiCardTitle>
                        <UiCardDescription>
                            Dane profilu oraz kategorie uprawnien.
                        </UiCardDescription>
                    </UiCardHeader>

                    <UiCardContent class="space-y-4 p-5">
                        <div class="grid gap-3 sm:grid-cols-2">
                            <div class="border-border rounded-2xl border p-4">
                                <Mail
                                    class="mb-3 size-4 text-sky-700"
                                    aria-hidden="true"
                                />
                                <p class="text-muted-foreground text-xs">
                                    Email
                                </p>
                                <p
                                    class="text-foreground mt-1 font-semibold break-all"
                                >
                                    {{ displayValue(props.instructor.email) }}
                                </p>
                            </div>

                            <div class="border-border rounded-2xl border p-4">
                                <Phone
                                    class="mb-3 size-4 text-sky-700"
                                    aria-hidden="true"
                                />
                                <p class="text-muted-foreground text-xs">
                                    Telefon
                                </p>
                                <p class="text-foreground mt-1 font-semibold">
                                    {{ displayValue(props.instructor.phone) }}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p class="text-muted-foreground text-xs">
                                Opis kwalifikacji
                            </p>
                            <p class="text-foreground mt-1 text-sm font-medium">
                                {{
                                    displayValue(
                                        props.instructor.qualifications,
                                    )
                                }}
                            </p>
                        </div>

                        <div>
                            <p class="text-muted-foreground text-xs">
                                Kategorie uprawnien
                            </p>
                            <div
                                v-if="
                                    props.instructor.qualifiedCourseTypes
                                        .length > 0
                                "
                                class="mt-2 flex flex-wrap gap-2"
                            >
                                <StatusBadge
                                    v-for="courseType in props.instructor
                                        .qualifiedCourseTypes"
                                    :key="courseType.id"
                                    :label="courseTypeLabel(courseType)"
                                    tone="info"
                                    subtle
                                />
                            </div>
                            <p
                                v-else
                                class="text-muted-foreground mt-2 text-sm"
                            >
                                Brak przypisanych kategorii.
                            </p>
                        </div>

                        <ActionGroup label="Akcje instruktora">
                            <UiButton
                                type="button"
                                variant="outline"
                                size="sm"
                                class="rounded-xl"
                                :disabled="props.isDeleting"
                                @click="emit('edit')"
                            >
                                <Pencil
                                    class="mr-2 size-4"
                                    aria-hidden="true"
                                />
                                Edytuj
                            </UiButton>

                            <UiButton
                                type="button"
                                variant="destructive"
                                size="sm"
                                class="rounded-xl"
                                :disabled="
                                    props.isDeleting || props.isSubmitting
                                "
                                :aria-busy="props.isDeleting"
                                @click="emit('delete')"
                            >
                                <Trash2
                                    class="mr-2 size-4"
                                    aria-hidden="true"
                                />
                                Usun
                            </UiButton>
                        </ActionGroup>
                    </UiCardContent>
                </UiCard>
            </div>
        </div>
    </div>
</template>
