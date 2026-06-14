import { jwtVerify } from 'jose';
import { bffUpstreamMyCoursesList } from '~~/server/utils/coursesBff';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

function mockMyCoursesPayload(role: string): {
    courses: Array<{
        id: string;
        name: string;
        status: 'ACTIVE' | 'FINISHED';
        progress: number;
    }>;
} {
    if (role.trim().toUpperCase() !== 'STUDENT') {
        return { courses: [] };
    }

    return {
        courses: [
            {
                id: '11111111-1111-4111-8111-111111111111',
                name: 'Kurs podstawowy kategorii B',
                status: 'ACTIVE',
                progress: 42,
            },
            {
                id: '22222222-2222-4222-8222-222222222222',
                name: 'Teoria - kategoria B',
                status: 'FINISHED',
                progress: 0,
            },
        ],
    };
}

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamMyCoursesList(event, upstream);
    }

    const accessToken = getCookie(event, 'access_token');

    if (!accessToken) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    try {
        const { payload } = await jwtVerify(accessToken, SECRET);
        const role = String(payload.role ?? '');

        return {
            success: true,
            data: mockMyCoursesPayload(role),
        };
    } catch {
        throw createError({
            statusCode: 401,
            message: 'Nieprawidłowy lub wygasły token',
        });
    }
});
