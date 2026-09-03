import { jwtVerify } from 'jose';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    bffUpstreamMyCoursesList,
    type MyCoursesPayload,
} from '~~/server/utils/courses/coursesBff';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

interface MyCoursesResponse {
    success: true;
    data: MyCoursesPayload;
}

function mockMyCoursesPayload(role: string): MyCoursesPayload {
    if (role.trim().toUpperCase() !== 'STUDENT') {
        return { courses: [] };
    }

    return {
        courses: [
            {
                id: '11111111-1111-4111-8111-111111111111',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Kurs podstawowy kategorii B',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 30,
                progress: 42,
            },
            {
                id: '22222222-2222-4222-8222-222222222222',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Teoria - kategoria B',
                status: 'FINISHED',
                type: 'THEORY_GROUP',
                totalHours: 30,
                progress: 0,
            },
        ],
    };
}

export default defineEventHandler(async (event) => {
    return executeBffAdapter<MyCoursesResponse>(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamMyCoursesList(event, upstreamBase),
        mock: async () => {
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
        },
    });
});
