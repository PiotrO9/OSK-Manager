import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readonly, ref } from 'vue';

const requestBffData = vi.fn();

describe('useStudentsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('readonly', readonly);
        vi.stubGlobal('requestBffData', requestBffData);
    });

    it('updates student notes through the BFF API', async () => {
        requestBffData.mockResolvedValue({ notes: '  ważna notatka  ' });
        const { useStudentsApi } = await import('./useStudentsApi');
        const api = useStudentsApi();

        await expect(
            api.updateNotes({
                userId: ' student-user ',
                notes: 'ważna notatka',
            }),
        ).resolves.toBe('ważna notatka');

        expect(requestBffData).toHaveBeenCalledWith(
            'PATCH',
            '/api/students/student-user',
            {
                body: { notes: 'ważna notatka' },
                fallbackMessage: 'Nie udało się zapisać notatki.',
            },
        );
    });

    it('normalizes empty saved notes to null', async () => {
        requestBffData.mockResolvedValue({ notes: '   ' });
        const { useStudentsApi } = await import('./useStudentsApi');
        const api = useStudentsApi();

        await expect(
            api.updateNotes({
                userId: 'student-user',
                notes: null,
            }),
        ).resolves.toBeNull();
    });

    it('rejects invalid note update responses', async () => {
        requestBffData.mockResolvedValue({ saved: true });
        const { useStudentsApi } = await import('./useStudentsApi');
        const api = useStudentsApi();

        await expect(
            api.updateNotes({
                userId: 'student-user',
                notes: 'tekst',
            }),
        ).rejects.toThrow(
            'Nieprawidłowa odpowiedź serwera po zapisie notatki.',
        );
    });
});
