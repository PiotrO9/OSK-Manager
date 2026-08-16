import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readonly, ref } from 'vue';

const requestBffSuccess = vi.fn();

describe('useManagerStudentCreate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('readonly', readonly);
        vi.stubGlobal('requestBffSuccess', requestBffSuccess);
    });

    it('creates student accounts through the success-only BFF helper', async () => {
        requestBffSuccess.mockResolvedValue(undefined);
        const { useManagerStudentCreate } =
            await import('./useManagerStudentCreate');
        const create = useManagerStudentCreate();

        await expect(
            create.createStudent({
                email: 'student@example.com',
                password: 'secret123',
                firstName: 'Jan',
                lastName: 'Kowalski',
                schoolId: 'school-1',
            }),
        ).resolves.toBeUndefined();

        expect(requestBffSuccess).toHaveBeenCalledWith(
            'POST',
            '/api/auth/register',
            {
                body: {
                    role: 'STUDENT',
                    email: 'student@example.com',
                    password: 'secret123',
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    schoolId: 'school-1',
                },
                fallbackMessage: 'Nie udało się utworzyć konta kursanta.',
            },
        );
        expect(create.apiError.value).toBeNull();
    });
});
