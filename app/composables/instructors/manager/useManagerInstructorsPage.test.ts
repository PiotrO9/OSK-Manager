import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { onMounted } from 'vue';
import { computed, readonly, ref } from 'vue';

const requestBffSuccess = vi.fn();
const addToast = vi.fn();
const navigateTo = vi.fn();

vi.mock('../../core/useApi', () => ({
    requestBffSuccess,
}));

describe('useManagerInstructorsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('computed', computed);
        vi.stubGlobal('readonly', readonly);
        vi.stubGlobal('onMounted', vi.fn<typeof onMounted>());
        vi.stubGlobal('useRoute', () => ({ query: {} }));
        vi.stubGlobal('useDrivingSchoolsApi', () => ({
            fetchList: vi.fn().mockResolvedValue([]),
        }));
        vi.stubGlobal('useInstructorsApi', () => ({
            fetchList: vi.fn().mockResolvedValue([]),
        }));
        vi.stubGlobal('useAppToast', () => ({ addToast }));
        vi.stubGlobal('navigateTo', navigateTo);
    });

    it('creates instructor accounts through the success-only BFF helper', async () => {
        requestBffSuccess.mockResolvedValue(undefined);
        navigateTo.mockResolvedValue(undefined);
        const { useManagerInstructorsPage } =
            await import('./useManagerInstructorsPage');
        const page = useManagerInstructorsPage();

        await page.handleInstructorSubmit({
            email: 'instructor@example.com',
            password: 'secret123',
            firstName: 'Anna',
            lastName: 'Nowak',
            licenseNumber: 'LIC-123',
            schoolId: 'school-1',
        });

        expect(requestBffSuccess).toHaveBeenCalledWith(
            'POST',
            '/api/auth/register',
            {
                body: {
                    role: 'INSTRUCTOR',
                    email: 'instructor@example.com',
                    password: 'secret123',
                    firstName: 'Anna',
                    lastName: 'Nowak',
                    licenseNumber: 'LIC-123',
                    schoolId: 'school-1',
                },
                fallbackMessage: 'Nie udało się utworzyć konta instruktora.',
            },
        );
        expect(addToast).toHaveBeenCalledWith({
            title: 'Instruktor został utworzony',
            variant: 'success',
        });
        expect(navigateTo).toHaveBeenCalledWith('/manager/instructors', {
            replace: true,
        });
        expect(page.apiError.value).toBeNull();
    });
});
