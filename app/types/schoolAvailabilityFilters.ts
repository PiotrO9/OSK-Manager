/** Zgodnie z GET `/driving-schools/:id/availability/slots` (query opcjonalne). */

export type SchoolSlotsLessonType = 'THEORY' | 'PRACTICE';

export type SchoolSlotsSort = 'startTime' | 'instructorName';

export interface SchoolAvailabilitySlotsQueryFilters {
    /** Powtórzone `instructorIds` w query — każdy UUID musi należeć do OSK. */
    instructorIds?: string[];
    /** HH:mm — slot w całości w oknie. */
    timeFrom?: string;
    timeTo?: string;
    /** 0=niedz. … 6=sob. (UTC), jak w API. */
    weekdays?: number[];
    /** 15–240; domyślnie po stronie BE z ustawień szkoły. */
    slotDurationMinutes?: number;
    courseId?: string;
    /** MVP: może nie wpływać na wynik na BE. */
    lessonType?: SchoolSlotsLessonType;
    sort?: SchoolSlotsSort;
    limit?: number;
    offset?: number;
    /** Głównie STUDENT; domyślnie true na BE. */
    excludeMyLessons?: boolean;
}
