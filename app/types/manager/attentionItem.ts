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

function readString(o: Record<string, unknown>, key: string): string {
    const raw = o[key];

    return raw == null ? '' : String(raw).trim();
}

function readNumber(o: Record<string, unknown>, key: string): number {
    const raw = o[key];
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

    const o = raw as Record<string, unknown>;
    const id = readString(o, 'id');
    const type = readString(o, 'type') as ManagerAttentionItemType;
    const priority = readString(o, 'priority') as ManagerAttentionItemPriority;
    const title = readString(o, 'title');
    const description = readString(o, 'description');
    const entityId = readString(o, 'entityId');
    const entityLabel = readString(o, 'entityLabel');
    const actionTo = readString(o, 'actionTo');

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
            o.dueDate === null || o.dueDate === undefined
                ? null
                : String(o.dueDate),
        actionTo,
    };
}

export function normalizeManagerAttentionPayload(
    data: unknown,
): ManagerAttentionPayload {
    if (!data || typeof data !== 'object') {
        return { items: [], total: 0, hiddenCount: 0 };
    }

    const o = data as Record<string, unknown>;
    const rawItems = Array.isArray(o.items) ? o.items : [];
    const items = rawItems
        .map((item) => normalizeManagerAttentionItem(item))
        .filter((item): item is ManagerAttentionItem => item !== null);

    return {
        items,
        total: readNumber(o, 'total'),
        hiddenCount: readNumber(o, 'hiddenCount'),
    };
}
