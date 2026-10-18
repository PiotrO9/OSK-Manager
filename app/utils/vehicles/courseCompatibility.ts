import type { Vehicle } from '~/types/vehicles/vehicle';

export function vehicleSupportsCourseType(
    vehicle: Pick<Vehicle, 'supportedCourseTypes'>,
    courseTypeId: string | undefined,
): boolean {
    return (
        !!courseTypeId &&
        (vehicle.supportedCourseTypes ?? []).some(
            (category) => category.id === courseTypeId,
        )
    );
}
