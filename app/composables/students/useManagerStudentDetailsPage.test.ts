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

    it('reports missing school id without calling student detail APIs', async () => {
        installNuxtStudentDetailsGlobals({
            params: { userId: 'student-user-1' },
            query: {},
        });
        const { useManagerStudentDetailsPage } =
            await import('./useManagerStudentDetailsPage');
        const page = useManagerStudentDetailsPage();

        await nextTick();

        expect(page.student.value).toBeNull();
        expect(page.isLoading.value).toBe(false);
        expect(page.errorMessage.value).toBe(
            'Brak identyfikatora szkoły w adresie strony. Wróć do listy kursantów i otwórz szczegóły ponownie.',
        );
        expect(requestBffData).not.toHaveBeenCalled();
        expect(fetchProcessStatus).not.toHaveBeenCalled();
        expect(fetchStudentPayments).not.toHaveBeenCalled();
        expect(fetchScheduleForStudent).not.toHaveBeenCalled();
    });
});
