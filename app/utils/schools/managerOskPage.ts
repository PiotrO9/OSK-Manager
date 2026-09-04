import type {
    CreateDrivingSchoolBody,
    UpdateDrivingSchoolBody,
} from '~/composables/schools/useDrivingSchoolsApi';
import type { DrivingSchool } from '~/types/schools/drivingSchool';

export interface ManagerOskStatsSummary {
    instructorCount: number;
    studentCount: number;
    hasRejected: boolean;
}

export function countManagerOskDefaultSchools(
    schools: readonly DrivingSchool[],
): number {
    return schools.filter((school) => school.isDefault === true).length;
}

export function buildManagerOskStatsSummary(params: {
    instructorResults: readonly PromiseSettledResult<number>[];
    studentResults: readonly PromiseSettledResult<number>[];
}): ManagerOskStatsSummary {
    const { instructorResults, studentResults } = params;

    return {
        instructorCount: sumManagerOskFulfilledStats(instructorResults),
        studentCount: sumManagerOskFulfilledStats(studentResults),
        hasRejected: [...instructorResults, ...studentResults].some(
            (result) => result.status === 'rejected',
        ),
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

function sumManagerOskFulfilledStats(
    results: readonly PromiseSettledResult<number>[],
): number {
    return results.reduce(
        (sum, result) =>
            result.status === 'fulfilled' ? sum + result.value : sum,
        0,
    );
}
