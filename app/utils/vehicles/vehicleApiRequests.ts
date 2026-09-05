import {
    normalizeVehicle,
    normalizeVehicleDetail,
    normalizeVehiclesList,
    type Vehicle,
    type VehicleDetail,
} from '~/types/vehicles/vehicle';

export const VEHICLE_INVALID_RESPONSE = 'Nieprawidłowa odpowiedź serwera.';

export function buildVehiclesListPath(schoolId: string): string {
    const qs = new URLSearchParams({ schoolId: schoolId.trim() });

    return `/api/vehicles?${qs.toString()}`;
}

export function buildVehiclePath(id: string): string {
    return `/api/vehicles/${encodeURIComponent(id.trim())}`;
}

export function buildVehicleStatusPath(id: string): string {
    return `${buildVehiclePath(id)}/status`;
}

export function buildVehiclePhotoPath(id: string): string {
    return `${buildVehiclePath(id)}/photo`;
}

export function buildDefaultVehiclePath(schoolId: string): string {
    return `/api/driving-schools/${encodeURIComponent(schoolId.trim())}/default-vehicle`;
}

export function normalizeVehicleListResponse(data: unknown): Vehicle[] {
    return normalizeVehiclesList(data);
}

export function normalizeVehicleResponse(data: unknown): Vehicle | null {
    return normalizeVehicle(data, 0);
}

export function normalizeVehicleDetailResponse(
    data: unknown,
): VehicleDetail | null {
    return normalizeVehicleDetail(data, 0);
}
