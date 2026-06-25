import { mockUpdateStudentNotes } from '~~/server/utils/mockStudentsList';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';
import { bffUpstreamUpdateStudentNotes } from '~~/server/utils/studentsBff';

const NOTES_MAX_LEN = 5000;

function readNotesFromPatchBody(raw: unknown): string | null | undefined {
    if (!raw || typeof raw !== 'object') {
        return undefined;
    }

    const o = raw as Record<string, unknown>;

    if (!('notes' in o)) {
        return undefined;
    }

    const v = o.notes;

    if (v === null || v === undefined) {
        return null;
    }

    return String(v);
}

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });

    const rawBody = await readBody(event);
    const rawNotes = readNotesFromPatchBody(rawBody);

    if (rawNotes === undefined) {
        throw createError({
            statusCode: 400,
            message: 'Pole notes jest wymagane w treści żądania.',
        });
    }

    let notes: string | null;

    if (rawNotes === null) {
        notes = null;
    } else {
        const t = rawNotes.trim();

        notes = t.length > 0 ? t : null;
    }

    if (notes !== null && notes.length > NOTES_MAX_LEN) {
        throw createError({
            statusCode: 400,
            message: `Notatka nie może przekraczać ${NOTES_MAX_LEN} znaków.`,
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamUpdateStudentNotes(
            event,
            upstream,
            studentUserId,
            notes,
        );
    }

    await requireManagerFromCookie(event);

    const updated = mockUpdateStudentNotes(studentUserId, notes);

    if (!updated.ok) {
        if (updated.code === 'NOT_FOUND') {
            throw createError({
                statusCode: 404,
                message: 'Nie znaleziono kursanta.',
            });
        }

        throw createError({
            statusCode: 400,
            message: `Notatka nie może przekraczać ${NOTES_MAX_LEN} znaków.`,
        });
    }

    return {
        success: true,
        data: {
            userId: updated.userId,
            notes: updated.notes,
        },
    };
});
