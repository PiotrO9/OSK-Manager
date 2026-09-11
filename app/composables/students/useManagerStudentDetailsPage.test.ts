import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, watch } from 'vue';

const requestBffData = vi.fn();
const fetchScheduleForStudent = vi.fn();
const fetchProcessStatus = vi.fn();
const fetchStudentPayments = vi.fn();
const createStudentPayment = vi.fn();
const updateStudentPayment = vi.fn();
const markStudentPaymentPaid = vi.fn();
const markStudentPaymentUnpaid = vi.fn();

function installNuxtStudentDetailsGlobals(route: {
    params: Record<string, unknown>;
    query: Record<string, unknown>;
}): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('useRoute', () => route);
    vi.stubGlobal('useRouter', () => ({
        replace: vi.fn(),
    }));
    vi.stubGlobal('usePageMeta', vi.fn());
    vi.stubGlobal('requestBffData', requestBffData);
    vi.stubGlobal('useScheduleApi', () => ({
        fetchScheduleForStudent,
    }));
    vi.stubGlobal('useStudentsApi', () => ({
        fetchProcessStatus,
    }));
    vi.stubGlobal('usePaymentsApi', () => ({
        createStudentPayment,
        fetchStudentPayments,
        markStudentPaymentPaid,
        markStudentPaymentUnpaid,
        updateStudentPayment,
    }));
}

describe('useManagerStudentDetailsPage', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('loads student details without school id in the route', async () => {
        requestBffData.mockResolvedValue({
            id: 'student-profile-1',
            userId: 'student-user-1',
            schoolId: 'school-1',
            firstName: 'Anna',
            lastName: 'Nowak',
            email: 'anna@example.com',
            pkkNumber: null,
            notes: null,
            courses: [],
        });
        fetchProcessStatus.mockResolvedValue({ steps: [] });
        fetchStudentPayments.mockResolvedValue({
            payments: [],
            summary: {
                paidAmount: '0.00',
                unpaidAmount: '0.00',
                overdueAmount: '0.00',
                overdueCount: 0,
                nextDueDate: null,
                currency: 'PLN',
            },
        });
        fetchScheduleForStudent.mockResolvedValue([]);
        installNuxtStudentDetailsGlobals({
            params: { userId: 'student-user-1' },
            query: {},
        });
        const { useManagerStudentDetailsPage } =
            await import('./useManagerStudentDetailsPage');
        const page = useManagerStudentDetailsPage();

        await nextTick();
        await Promise.resolve();
        await nextTick();

        expect(page.student.value?.schoolId).toBe('school-1');
        expect(page.isLoading.value).toBe(false);
        expect(page.errorMessage.value).toBeNull();
        expect(requestBffData).toHaveBeenCalledWith(
            'GET',
            '/api/students/student-user-1',
            {
                fallbackMessage: 'Nie udało się wczytać danych kursanta.',
            },
        );
    });
});
