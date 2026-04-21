import type { FreeWindow } from '~/types/instructorEvent';
import type { AvailabilitySlot } from '~/types/instructorSlots';

/**
 * Czy przedział [newStart, newEnd] mieści się w całości w którymkolwiek z wolnych okien (ISO UTC).
 */
export function isSlotWithinFreeWindows(
    freeWindows: FreeWindow[],
    newStart: Date,
    newEnd: Date,
): boolean {
    if (newStart.getTime() >= newEnd.getTime()) {
        return false;
    }

    if (freeWindows.length === 0) {
        return false;
    }

    return freeWindows.some((w) => {
        const ws = new Date(w.startTime).getTime();
        const we = new Date(w.endTime).getTime();

        return newStart.getTime() >= ws && newEnd.getTime() <= we;
    });
}

interface HhmmWindow {
    start: string;
    end: string;
}

/**
 * Scala kolejne sloty 60 min (HH:mm) w ciągłe okna dla danego dnia kalendarzowego.
 */
function mergeConsecutiveHhmmSlots(slots: AvailabilitySlot[]): HhmmWindow[] {
    if (slots.length === 0) {
        return [];
    }

    const sorted = [...slots].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
    );
    const out: HhmmWindow[] = [];

    for (const slot of sorted) {
        const last = out[out.length - 1];

        if (last && last.end === slot.startTime) {
            last.end = slot.endTime;
        } else {
            out.push({ start: slot.startTime, end: slot.endTime });
        }
    }

    return out;
}

/**
 * Konwertuje sloty instruktora na `FreeWindow` w ISO UTC (`YYYY-MM-DD` + `HH:mm` → `${date}T${hhmm}:00.000Z`).
 */
export function slotsToFreeWindows(
    slots: AvailabilitySlot[],
    date: string,
): FreeWindow[] {
    const d = date.trim();

    if (!d) {
        return [];
    }

    const daySlots = slots.filter((s) => s.date.trim() === d);
    const merged = mergeConsecutiveHhmmSlots(daySlots);

    return merged.map((w) => ({
        startTime: `${d}T${w.start}:00.000Z`,
        endTime: `${d}T${w.end}:00.000Z`,
    }));
}
