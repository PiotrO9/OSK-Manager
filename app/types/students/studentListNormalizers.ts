import type { StudentListItem, StudentListPage } from './studentModels';
import {
    clampInt,
    parseBooleanLike,
    readStringOrNull,
} from './studentNormalizeShared';

export function normalizeStudentListItem(raw: unknown): StudentListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';

    if (!id) {
        return null;
    }

    const userIdRaw = o.userId ?? o.user_id;
    const userId =
        userIdRaw != null && String(userIdRaw).trim().length > 0
            ? String(userIdRaw).trim()
            : id;

    const firstName =
        o.firstName != null
            ? String(o.firstName).trim()
            : o.first_name != null
              ? String(o.first_name).trim()
              : '';

    const lastName =
        o.lastName != null
            ? String(o.lastName).trim()
            : o.last_name != null
              ? String(o.last_name).trim()
              : '';

    const email = o.email != null ? String(o.email).trim().toLowerCase() : '';

    if (!firstName || !lastName || !email) {
        return null;
    }

    const phone = readStringOrNull(o.phone ?? o.phone_number);
    const pkkNumber = readStringOrNull(o.pkkNumber ?? o.pkk_number);
    const createdAtRaw = o.createdAt ?? o.created_at;
    const createdAt = createdAtRaw != null ? String(createdAtRaw).trim() : '';

    if (!createdAt) {
        return null;
    }

    return {
        id,
        userId,
        firstName,
        lastName,
        email,
        phone,
        pkkNumber,
        isActive: parseBooleanLike(o.isActive ?? o.is_active, true),
        createdAt,
    };
}

function readItemsArray(record: Record<string, unknown>): unknown[] | null {
    const nested = record.data;

    if (Array.isArray(nested)) {
        return nested;
    }

    if (Array.isArray(record.items)) {
        return record.items;
    }

    if (Array.isArray(record.students)) {
        return record.students;
    }

    return null;
}

/**
 * Normalizuje `data` z koperty po `unwrapApiSuccessData` — obiekt z polami
 * `data` (tablica), `total`, `page`, `limit` wg students-api.md.
 */
export function normalizeStudentListPage(
    data: unknown,
): StudentListPage | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const record = data as Record<string, unknown>;
    const itemsRaw = readItemsArray(record);

    if (itemsRaw === null) {
        return null;
    }

    const items = itemsRaw
        .map((row) => normalizeStudentListItem(row))
        .filter((x): x is StudentListItem => x !== null);

    const totalRaw = record.total;
    let total: number;

    if (typeof totalRaw === 'number' && Number.isFinite(totalRaw)) {
        total = Math.max(0, Math.trunc(totalRaw));
    } else if (typeof totalRaw === 'string') {
        const p = Number.parseInt(totalRaw.trim(), 10);

        total = Number.isNaN(p) ? items.length : Math.max(0, p);
    } else {
        total = NaN;
    }

    if (!Number.isFinite(total)) {
        return null;
    }

    const pageRaw = record.page;
    let page = 1;

    if (typeof pageRaw === 'number' && Number.isFinite(pageRaw)) {
        page = clampInt(pageRaw, 1, 1_000_000);
    } else if (typeof pageRaw === 'string') {
        const p = Number.parseInt(pageRaw.trim(), 10);

        page = Number.isNaN(p) ? 1 : clampInt(p, 1, 1_000_000);
    }

    const limitRaw = record.limit;
    let limit = 20;

    if (typeof limitRaw === 'number' && Number.isFinite(limitRaw)) {
        limit = clampInt(limitRaw, 1, 100);
    } else if (typeof limitRaw === 'string') {
        const p = Number.parseInt(limitRaw.trim(), 10);

        limit = Number.isNaN(p) ? 20 : clampInt(p, 1, 100);
    }

    const totalPages = total === 0 ? 1 : Math.max(1, Math.ceil(total / limit));

    return {
        items,
        total,
        page,
        limit,
        totalPages,
    };
}
