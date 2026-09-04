import type { InstructorListItem } from '~/types/instructors/instructor';
import type { StudentDetail } from '~/types/students/student';
import type { Vehicle } from '~/types/vehicles/vehicle';

export function formatManagerLessonInstructorDisplayName(
    item: InstructorListItem,
): string {
    const parts = [item.firstName, item.lastName]
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

    return parts.length > 0 ? parts.join(' ') : '—';
}

export function formatManagerLessonStudentDisplayName(
    student: StudentDetail,
): string {
    const parts = [student.firstName, student.lastName]
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

    return parts.length > 0 ? parts.join(' ') : '—';
}

export function parseInstructorListItemFromApi(
    raw: unknown,
): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';

    if (!id) {
        return null;
    }

    const firstName =
        typeof o.firstName === 'string'
            ? o.firstName.trim()
            : typeof o.first_name === 'string'
              ? o.first_name.trim()
              : '';
    const lastName =
        typeof o.lastName === 'string'
            ? o.lastName.trim()
            : typeof o.last_name === 'string'
              ? o.last_name.trim()
              : '';
    const email =
        typeof o.email === 'string'
            ? o.email.trim()
            : typeof o.Email === 'string'
              ? o.Email.trim()
              : '';

    return { id, firstName, lastName, email };
}

export function buildManagerLessonInstructorsForSelect(params: {
    instructors: readonly InstructorListItem[];
    selectedInstructorId: string;
    embeddedInstructor?: InstructorListItem;
    fallbackLabel?: string | null;
}): InstructorListItem[] {
    const list = [...params.instructors];
    const id = params.selectedInstructorId.trim();

    if (!id || list.some((item) => item.id === id)) {
        return list;
    }

    const embedded =
        params.embeddedInstructor?.id === id ? params.embeddedInstructor : null;
    const fallback = params.fallbackLabel?.trim();
    const synthetic: InstructorListItem = embedded ?? {
        id,
        firstName: fallback ? fallback : 'Aktualny',
        lastName: '',
        email: '',
    };

    return [synthetic, ...list];
}

export function buildManagerLessonVehiclesForSelect(params: {
    vehicles: readonly Vehicle[];
    selectedVehicleId: string;
    embeddedVehicle?: Vehicle;
    fallbackVehicle?: Vehicle | null;
}): Vehicle[] {
    const list = [...params.vehicles];
    const id = params.selectedVehicleId.trim();

    if (!id || list.some((vehicle) => vehicle.id === id)) {
        return list;
    }

    const embedded =
        params.embeddedVehicle?.id === id ? params.embeddedVehicle : null;
    const fallback = params.fallbackVehicle;
    const synthetic: Vehicle = embedded ?? {
        id,
        name: fallback?.name ?? 'Aktualny pojazd',
        registrationNumber: fallback?.registrationNumber ?? '—',
        status: fallback?.status ?? 'ACTIVE',
        unavailableUntil: fallback?.unavailableUntil ?? null,
        isDefault: fallback?.isDefault ?? false,
        inspectionDate: fallback?.inspectionDate ?? null,
        insuranceDate: fallback?.insuranceDate ?? null,
        modelYear: fallback?.modelYear ?? null,
        mileageKm: fallback?.mileageKm ?? null,
    };

    return [synthetic, ...list];
}
