import type {
    ScheduleLessonItem,
    SchedulePersonRef,
    ScheduleVehicleRef,
} from '~/types/schedule/schedule';

export function formatScheduleLessonDateTime(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(d);
}

export function displaySchedulePerson(
    person: SchedulePersonRef | undefined,
): string {
    if (!person) {
        return '—';
    }

    const name = `${person.firstName} ${person.lastName}`.trim();

    return name.length > 0 ? name : '—';
}

export function displayScheduleVehicle(
    vehicle: ScheduleVehicleRef | undefined,
): string {
    if (!vehicle) {
        return '—';
    }

    const name = vehicle.name.trim();
    const reg = vehicle.registrationNumber.trim();

    if (name && reg) {
        return `${name} (${reg})`;
    }

    return name || reg || '—';
}

export function labelForScheduleLessonType(rawType: string): string {
    const normalized = rawType.trim().toUpperCase();

    if (normalized === 'PRACTICE') {
        return 'Jazda praktyczna';
    }

    if (normalized === 'THEORY') {
        return 'Teoria';
    }

    return rawType.trim() || '—';
}

export function labelForScheduleLessonStatus(rawStatus: string): string {
    const normalized = rawStatus.trim().toUpperCase();

    if (normalized === 'SCHEDULED' || normalized === 'PLANNED') {
        return 'Zaplanowana';
    }

    if (normalized === 'COMPLETED' || normalized === 'FINISHED') {
        return 'Zrealizowana';
    }

    if (normalized === 'CANCELLED' || normalized === 'CANCELED') {
        return 'Anulowana';
    }

    if (normalized === 'NO_SHOW') {
        return 'Nie stawil sie';
    }

    return rawStatus.trim() || '—';
}

export function isStudentCancellableScheduleLesson(
    item: ScheduleLessonItem,
): boolean {
    return (
        item.kind === 'lesson' &&
        item.type.trim().toUpperCase() === 'PRACTICE' &&
        item.status.trim().toUpperCase() === 'SCHEDULED'
    );
}
