import { CalendarDays, Clock3, UserRound } from 'lucide-vue-next';
import {
    formatCourseTypeOptionLabel,
    type CourseTypeOption,
} from '~/types/courseType';
import type { InstructorDetail } from '~/types/instructor';
import type { LessonRatingsSummary } from '~/types/lessonRating';
import type { SummaryStripItem } from '~/components/app/ui/types';

export function displayManagerInstructorDetailsValue(value: string): string {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : '-';
}

export function managerInstructorCourseTypeLabel(
    courseType: CourseTypeOption,
): string {
    return formatCourseTypeOptionLabel(courseType);
}

export function useManagerInstructorDetailsContent(input: {
    instructor: InstructorDetail;
    ratingSummary: LessonRatingsSummary;
    isRatingSummaryLoading: boolean;
    isDeleting: boolean;
    subpageQuery: Record<string, string>;
}) {
    const initials = computed(() => {
        const normalized = input.instructor.name
            .split(/\s+/)
            .map((part) => part.trim().charAt(0))
            .filter((part) => part.length > 0)
            .slice(0, 2)
            .join('');

        return normalized.length > 0 ? normalized.toUpperCase() : 'IN';
    });

    const categoryLabel = computed(() => {
        const labels = input.instructor.qualifiedCourseTypes
            .map(
                (courseType) =>
                    courseType.code.trim() || courseType.name.trim(),
            )
            .filter((label) => label.length > 0);

        return labels.length > 0 ? labels.join(', ') : 'Brak kategorii';
    });

    const ratingAverageLabel = computed(() => {
        if (input.isRatingSummaryLoading) {
            return '...';
        }

        const average = input.ratingSummary.averageRating;

        return average === null ? '-' : average.toFixed(2);
    });

    const ratingsCountLabel = computed(() => {
        const count = input.ratingSummary.totalCount;

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
            value: input.instructor.qualifiedCourseTypes.length,
            description: categoryLabel.value,
            tone: 'info',
        },
        {
            label: 'Doswiadczenie',
            value: displayManagerInstructorDetailsValue(
                input.instructor.experience,
            ),
            description: 'Z profilu instruktora',
            tone: 'neutral',
        },
        {
            label: 'Srednia ocen',
            value: ratingAverageLabel.value,
            description: ratingsCountLabel.value,
            tone:
                input.ratingSummary.averageRating === null
                    ? 'neutral'
                    : 'success',
        },
        {
            label: 'Telefon',
            value: displayManagerInstructorDetailsValue(input.instructor.phone),
            description: 'Dane kontaktowe',
            tone: 'neutral',
        },
    ]);

    const actionDisabledClass = computed(() =>
        input.isDeleting
            ? 'pointer-events-none cursor-not-allowed opacity-50'
            : '',
    );

    const relatedLinks = computed(() => [
        {
            label: 'Dostepnosc',
            description: 'Tygodniowy wzorzec pracy',
            to: {
                path: `/manager/instructors/${input.instructor.id}/availability`,
                query: input.subpageQuery,
            },
            icon: Clock3,
        },
        {
            label: 'Terminarz',
            description: 'Wolne sloty instruktora',
            to: {
                path: `/manager/instructors/${input.instructor.id}/slots`,
                query: input.subpageQuery,
            },
            icon: CalendarDays,
        },
        {
            label: 'Lekcje',
            description: 'Lekcje i bloki czasu',
            to: {
                path: `/manager/instructors/${input.instructor.id}/schedule`,
                query: input.subpageQuery,
            },
            icon: UserRound,
        },
    ]);

    const profileRows = computed(() => [
        { label: 'Status', value: 'Aktywny' },
        { label: 'Kategorie', value: categoryLabel.value },
        {
            label: 'Telefon',
            value: displayManagerInstructorDetailsValue(input.instructor.phone),
        },
        {
            label: 'Email',
            value: displayManagerInstructorDetailsValue(input.instructor.email),
        },
        {
            label: 'Licencja',
            value: displayManagerInstructorDetailsValue(
                input.instructor.licenseNumber,
            ),
        },
    ]);

    return {
        initials,
        categoryLabel,
        ratingAverageLabel,
        ratingsCountLabel,
        summaryItems,
        actionDisabledClass,
        relatedLinks,
        profileRows,
    };
}
