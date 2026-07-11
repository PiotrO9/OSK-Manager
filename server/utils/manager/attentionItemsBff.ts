import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export async function bffUpstreamManagerAttentionItems(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/manager/attention-items',
        query: { schoolId },
        fallbackError: 'Nie udało się pobrać spraw wymagających uwagi.',
    });

    return { success: true, data };
}

export function bffMockManagerAttentionItems(schoolId: string): {
    success: true;
    data: unknown;
} {
    return {
        success: true,
        data: {
            items: [
                {
                    id: `demo-payment-overdue:${schoolId}`,
                    type: 'payment_overdue',
                    priority: 'urgent',
                    title: 'Zaległa płatność',
                    description:
                        'Jan Kowalski ma zaległą płatność 500.00 PLN za kurs B.',
                    entityId: 'demo-student-1',
                    entityLabel: 'Jan Kowalski',
                    dueDate: '2026-07-01',
                    actionTo: '/manager/students/demo-student-1',
                },
                {
                    id: `demo-vehicle-doc:${schoolId}`,
                    type: 'vehicle_document_expiring',
                    priority: 'info',
                    title: 'Zbliża się termin: OC',
                    description:
                        'Toyota Yaris (WX12345) wymaga sprawdzenia dokumentu: OC.',
                    entityId: 'demo-vehicle-1',
                    entityLabel: 'Toyota Yaris (WX12345)',
                    dueDate: '2026-08-01',
                    actionTo: '/vehicles/demo-vehicle-1',
                },
            ],
            total: 2,
            hiddenCount: 0,
        },
    };
}
