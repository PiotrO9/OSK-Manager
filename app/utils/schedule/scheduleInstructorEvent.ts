/**
 * Wpis z GET /schedule z `kind === 'instructor_event'` to blok czasu instruktora
 * (edycja PATCH /events/:id), nie lekcja z kursantem.
 */
export function isScheduleInstructorEvent(item: { kind?: string }): boolean {
    return item.kind?.trim().toLowerCase() === 'instructor_event';
}
