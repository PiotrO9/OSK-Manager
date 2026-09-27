import type { ScheduleAvailabilityOptionsResult } from '~/types/schedule/scheduleAvailability';

export function managerLessonNoHoursMessage(
    reason: ScheduleAvailabilityOptionsResult['emptyReason'],
): string {
    switch (reason) {
        case 'SCHOOL_CLOSED':
            return 'OSK nie prowadzi jazd w tym dniu. Wybierz inny termin.';
        case 'DATE_NOT_BOOKABLE':
            return 'Ten dzień jest poza dozwolonym terminem rezerwacji.';
        case 'INSTRUCTOR_UNAVAILABLE':
            return 'Instruktor nie ma wolnych godzin w tym dniu.';
        case 'COURSE_LIMIT_EXCEEDED':
            return 'Na kursie nie ma wystarczającej liczby godzin na tę jazdę.';
        case 'STUDENT_BUSY':
            return 'Kursant jest zajęty w dostępnych godzinach instruktora.';
        case 'VEHICLE_UNAVAILABLE':
            return 'Wybrany pojazd nie ma wolnych godzin w tym dniu. Możesz wybrać inny pojazd lub datę.';
        default:
            return 'Nie ma wolnych godzin dla tego zestawu instruktora, kursanta i pojazdu.';
    }
}
