import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { bffUpstreamUpdateStudentNotes } from '~~/server/utils/students/studentsBff';

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

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamUpdateStudentNotes(
                event,
                upstreamBase,
                studentUserId,
                notes,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockUpdateStudentNotes(
                studentUserId,
                notes,
                NOTES_MAX_LEN,
            );
        },
    });
});
