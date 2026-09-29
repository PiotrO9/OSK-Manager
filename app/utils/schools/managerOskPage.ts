import type {
    CreateDrivingSchoolBody,
    DrivingSchool,
    UpdateDrivingSchoolBody,
} from '~/types/schools/drivingSchool';

export interface ManagerOskFormValues {
    name: string;
    city: string;
    address: string;
    asDefault: boolean;
}

export function getManagerOskErrorMessage(
    err: unknown,
    fallback: string,
): string {
    return err instanceof Error ? err.message : fallback;
}

export function getManagerOskBlankFormValues(): ManagerOskFormValues {
    return {
        name: '',
        city: '',
        address: '',
        asDefault: false,
    };
}

export function buildManagerOskEditFormValues(
    school: DrivingSchool,
): ManagerOskFormValues {
    return {
        name: school.name,
        city: school.city ?? '',
        address: school.address ?? '',
        asDefault: school.isDefault === true,
    };
}

export function buildManagerOskCreateBody(params: {
    name: string;
    city?: string | null;
    address?: string | null;
}): CreateDrivingSchoolBody {
    const city = params.city?.trim();
    const address = params.address?.trim();

    return {
        name: params.name,
        ...(city ? { city } : {}),
        ...(address ? { address } : {}),
    };
}

export function buildManagerOskUpdateBody(params: {
    name: string;
    city?: string | null;
    address?: string | null;
}): UpdateDrivingSchoolBody {
    const city = params.city?.trim();
    const address = params.address?.trim();

    return {
        name: params.name,
        city: city || null,
        address: address || null,
    };
}
