import type { StudentListItem, StudentListPage } from './studentModels';
import {
    clampInt,
    parseBooleanLike,
    readStringOrNull,
} from './studentNormalizeShared';
import { readAvatarUrlFromRecord } from '~/types/profileAvatar';

export function normalizeStudentListItem(raw: unknown): StudentListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const studentRecord = raw as Record<string, unknown>;
    const id = studentRecord.id != null ? String(studentRecord.id).trim() : '';

    if (!id) {
        return null;
    }

    const userIdRaw = studentRecord.userId ?? studentRecord.user_id;
    const userId =
        userIdRaw != null && String(userIdRaw).trim().length > 0
            ? String(userIdRaw).trim()
            : id;

    const firstName =
        studentRecord.firstName != null
            ? String(studentRecord.firstName).trim()
            : studentRecord.first_name != null
              ? String(studentRecord.first_name).trim()
              : '';

    const lastName =
        studentRecord.lastName != null
            ? String(studentRecord.lastName).trim()
            : studentRecord.last_name != null
              ? String(studentRecord.last_name).trim()
              : '';

    const email =
        studentRecord.email != null
            ? String(studentRecord.email).trim().toLowerCase()
            : '';

    if (!firstName || !lastName || !email) {
        return null;
    }

    const phone = readStringOrNull(
        studentRecord.phone ?? studentRecord.phone_number,
    );
    const pkkNumber = readStringOrNull(
        studentRecord.pkkNumber ?? studentRecord.pkk_number,
    );
    const createdAtRaw = studentRecord.createdAt ?? studentRecord.created_at;
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
        avatarUrl: readAvatarUrlFromRecord(studentRecord),
        pkkNumber,
        isActive: parseBooleanLike(
            studentRecord.isActive ?? studentRecord.is_active,
            true,
        ),
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
        .filter((student): student is StudentListItem => student !== null);

    const totalRaw = record.total;
    let total: number;

    if (typeof totalRaw === 'number' && Number.isFinite(totalRaw)) {
        total = Math.max(0, Math.trunc(totalRaw));
    } else if (typeof totalRaw === 'string') {
        const parsedValue = Number.parseInt(totalRaw.trim(), 10);

        total = Number.isNaN(parsedValue)
            ? items.length
            : Math.max(0, parsedValue);
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
        const parsedValue = Number.parseInt(pageRaw.trim(), 10);

        page = Number.isNaN(parsedValue)
            ? 1
            : clampInt(parsedValue, 1, 1_000_000);
    }

    const limitRaw = record.limit;
    let limit = 20;

    if (typeof limitRaw === 'number' && Number.isFinite(limitRaw)) {
        limit = clampInt(limitRaw, 1, 100);
    } else if (typeof limitRaw === 'string') {
        const parsedValue = Number.parseInt(limitRaw.trim(), 10);

        limit = Number.isNaN(parsedValue) ? 20 : clampInt(parsedValue, 1, 100);
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
