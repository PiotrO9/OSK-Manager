export type ManagerAttentionItemPriority = 'urgent' | 'todo' | 'info';

export type ManagerAttentionItemType =
    | 'student_missing_pkk'
    | 'student_missing_course'
    | 'student_missing_first_lesson'
    | 'payment_overdue'
    | 'payment_due_soon'
    | 'vehicle_document_expired'
    | 'vehicle_document_expiring'
    | 'instructor_missing_availability'
    | 'low_lesson_rating';

export interface ManagerAttentionItem {
    id: string;
    type: ManagerAttentionItemType;
    priority: ManagerAttentionItemPriority;
    title: string;
    description: string;
    entityId: string;
    entityLabel: string;
    dueDate: string | null;
    actionTo: string;
}

export interface ManagerAttentionPayload {
    items: ManagerAttentionItem[];
    total: number;
    hiddenCount: number;
}

const attentionTypes = new Set<ManagerAttentionItemType>([
    'student_missing_pkk',
    'student_missing_course',
    'student_missing_first_lesson',
    'payment_overdue',
    'payment_due_soon',
    'vehicle_document_expired',
    'vehicle_document_expiring',
    'instructor_missing_availability',
    'low_lesson_rating',
]);

const attentionPriorities = new Set<ManagerAttentionItemPriority>([
    'urgent',
    'todo',
    'info',
]);

function readString(record: Record<string, unknown>, key: string): string {
    const raw = record[key];

    return raw == null ? '' : String(raw).trim();
}

function readNumber(record: Record<string, unknown>, key: string): number {
    const raw = record[key];
    const value =
        typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);

    return Number.isFinite(value) ? value : 0;
}

export function normalizeManagerAttentionItem(
    raw: unknown,
): ManagerAttentionItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const id = readString(record, 'id');
    const type = readString(record, 'type') as ManagerAttentionItemType;
    const priority = readString(
        record,
        'priority',
    ) as ManagerAttentionItemPriority;
    const title = readString(record, 'title');
    const description = readString(record, 'description');
    const entityId = readString(record, 'entityId');
    const entityLabel = readString(record, 'entityLabel');
    const actionTo = readString(record, 'actionTo');

    if (
        !id ||
        !attentionTypes.has(type) ||
        !attentionPriorities.has(priority) ||
        !title ||
        !description ||
        !entityId ||
        !entityLabel ||
        !actionTo
    ) {
        return null;
    }

    return {
        id,
        type,
        priority,
        title,
        description,
        entityId,
        entityLabel,
        dueDate:
            record.dueDate === null || record.dueDate === undefined
                ? null
                : String(record.dueDate),
        actionTo,
    };
}

export function normalizeManagerAttentionPayload(
    data: unknown,
): ManagerAttentionPayload {
    if (!data || typeof data !== 'object') {
        return { items: [], total: 0, hiddenCount: 0 };
    }

    const record = data as Record<string, unknown>;
    const rawItems = Array.isArray(record.items) ? record.items : [];
    const items = rawItems
        .map((item) => normalizeManagerAttentionItem(item))
        .filter((item): item is ManagerAttentionItem => item !== null);

    return {
        items,
        total: readNumber(record, 'total'),
        hiddenCount: readNumber(record, 'hiddenCount'),
    };
}
