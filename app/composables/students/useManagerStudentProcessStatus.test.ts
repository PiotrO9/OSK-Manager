import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';

const fetchProcessStatus = vi.fn();

function installNuxtStudentProcessGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('useStudentsApi', () => ({
        fetchProcessStatus,
    }));
}

describe('useManagerStudentProcessStatus', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtStudentProcessGlobals();
    });

    it('skips loading process status without user id', async () => {
        const { useManagerStudentProcessStatus } =
            await import('./useManagerStudentProcessStatus');
        const process = useManagerStudentProcessStatus();

        await process.loadStudentProcessStatus('');

        expect(process.processStatus.value).toBeNull();
        expect(process.processStatusLoading.value).toBe(false);
        expect(fetchProcessStatus).not.toHaveBeenCalled();
    });

    it('loads process status and exposes overview label', async () => {
        fetchProcessStatus.mockResolvedValue({
            steps: [
                { name: 'Teoria', completed: true, description: '' },
                { name: 'Egzamin', completed: false, description: '' },
            ],
        });
        const { useManagerStudentProcessStatus } =
            await import('./useManagerStudentProcessStatus');
        const process = useManagerStudentProcessStatus();

        await process.loadStudentProcessStatus('student-user-1');

        expect(fetchProcessStatus).toHaveBeenCalledWith({
            userId: 'student-user-1',
        });
        expect(process.processStatusSteps.value).toHaveLength(2);
        expect(process.processOverviewLabel.value).toBe('1/2');
    });
});
