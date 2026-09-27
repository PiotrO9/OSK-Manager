export function isManagerLessonEditable(
    status: string,
    endTime: string,
    now = Date.now(),
): boolean {
    const end = Date.parse(endTime);

    return (
        status.trim().toUpperCase() === 'SCHEDULED' &&
        Number.isFinite(end) &&
        end > now
    );
}
