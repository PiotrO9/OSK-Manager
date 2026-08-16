import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventStudentsPost } from '~~/server/utils/events/eventsBff';
import {
    isUuid,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/validation/requestValidation';

const MIN_IDS = 1;
const MAX_IDS = 50;

function validateAssignStudentsBody(
    raw: unknown,
): { ok: true; studentIds: string[] } | { ok: false; message: string } {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const idsRaw = o.studentIds;

    if (!Array.isArray(idsRaw)) {
        return { ok: false, message: 'Pole studentIds musi być tablicą UUID.' };
    }

    if (idsRaw.length < MIN_IDS || idsRaw.length > MAX_IDS) {
        return {
            ok: false,
            message: `Pole studentIds musi mieć od ${MIN_IDS} do ${MAX_IDS} elementów.`,
        };
    }

    const studentIds: string[] = [];

    for (const item of idsRaw) {
        if (typeof item !== 'string') {
            return {
                ok: false,
                message: 'Każdy element studentIds musi być ciągiem (UUID).',
            };
        }

        const id = item.trim();

        if (!id || !isUuid(id)) {
            return {
                ok: false,
                message: 'Każdy element studentIds musi być poprawnym UUID.',
            };
        }

        studentIds.push(id);
    }

    const unique = new Set(studentIds);

    if (unique.size !== studentIds.length) {
        return {
            ok: false,
            message: 'Pole studentIds nie może zawierać duplikatów.',
        };
    }

    return { ok: true, studentIds };
}

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    const rawBody = await readBody(event);
    const parsed = validateAssignStudentsBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffEventStudentsPost(event, upstreamBase, eventId, {
                studentIds: parsed.studentIds,
            }),
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
                data: {
                    assigned: parsed.studentIds.length,
                    skipped: 0,
                },
            };
        },
    });
});
