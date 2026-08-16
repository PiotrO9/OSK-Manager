import type { AuthSession } from '~/utils/auth/authSessionMapper';

export function createDemoAuthSession(userName: string): AuthSession | null {
    const normalizedName = userName.trim();

    if (!normalizedName) {
        return null;
    }

    return {
        userId: 'demo',
        userName: normalizedName,
        role: 'DEMO',
        drivingSchools: [],
        defaultOskId: null,
    };
}
