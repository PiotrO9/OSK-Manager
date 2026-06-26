export interface MockWeeklyEntry {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

type GlobalWithStore = typeof globalThis & {
    __mockAvailabilityWeekly?: Map<string, MockWeeklyEntry[]>;
};

function getStore(): Map<string, MockWeeklyEntry[]> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockAvailabilityWeekly) {
        g.__mockAvailabilityWeekly = new Map();
    }

    return g.__mockAvailabilityWeekly;
}

/** Pre-seed: poniedziałek–piątek 08:00–16:00. */
function seedForInstructor(instructorId: string): MockWeeklyEntry[] {
    const entries: MockWeeklyEntry[] = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        id: crypto.randomUUID(),
        dayOfWeek,
        startTime: '08:00',
        endTime: '16:00',
    }));

    getStore().set(instructorId, entries);

    return entries;
}

export function mockAvailabilityGetWeekly(
    instructorId: string,
): MockWeeklyEntry[] {
    const store = getStore();

    if (!store.has(instructorId)) {
        return seedForInstructor(instructorId);
    }

    return store.get(instructorId) ?? [];
}

export function mockAvailabilityUpsertDay(
    instructorId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
): MockWeeklyEntry {
    const entries = mockAvailabilityGetWeekly(instructorId);
    const existing = entries.find((e) => e.dayOfWeek === dayOfWeek);

    if (existing) {
        existing.startTime = startTime;
        existing.endTime = endTime;

        return existing;
    }

    const newEntry: MockWeeklyEntry = {
        id: crypto.randomUUID(),
        dayOfWeek,
        startTime,
        endTime,
    };

    entries.push(newEntry);
    getStore().set(instructorId, entries);

    return newEntry;
}

/** Zwraca true gdy usunięto, false gdy nie było wpisu (404). */
export function mockAvailabilityDeleteDay(
    instructorId: string,
    dayOfWeek: number,
): boolean {
    const entries = mockAvailabilityGetWeekly(instructorId);
    const idx = entries.findIndex((e) => e.dayOfWeek === dayOfWeek);

    if (idx === -1) {
        return false;
    }

    entries.splice(idx, 1);
    getStore().set(instructorId, entries);

    return true;
}
