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

export function isManagerLessonCancellable(
    status: string,
    startTime: string,
    now = Date.now(),
): boolean {
    const start = Date.parse(startTime);

    return (
        status.trim().toUpperCase() === 'SCHEDULED' &&
        Number.isFinite(start) &&
        start > now
    );
}
