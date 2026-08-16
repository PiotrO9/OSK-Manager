import { randomUUID } from 'node:crypto';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffLessonRatingPost } from '~~/server/utils/lessons/lessonsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { requireStudentFromCookie } from '~~/server/utils/auth/requireStudentFromCookie';

function validateRatingBody(raw: unknown):
    | {
          ok: true;
          body: { rating: number; comment: string | null };
      }
    | { ok: false; message: string } {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const rating = o.rating;

    if (
        typeof rating !== 'number' ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {
        return {
            ok: false,
            message: 'Pole rating musi być liczbą całkowitą od 1 do 5.',
        };
    }

    if (
        o.comment !== undefined &&
        o.comment !== null &&
        typeof o.comment !== 'string'
    ) {
        return {
            ok: false,
            message: 'Pole comment musi być tekstem.',
        };
    }

    const comment =
        typeof o.comment === 'string' && o.comment.trim().length > 0
            ? o.comment.trim()
            : null;

    return { ok: true, body: { rating, comment } };
}

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'lessonId', {
        required: 'Nieprawidłowy identyfikator lekcji.',
        invalid: 'Nieprawidłowy identyfikator lekcji.',
    });

    const rawBody = await readBody(event);
    const parsed = validateRatingBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const result = await bffLessonRatingPost(
                event,
                upstreamBase,
                lessonId,
                parsed.body,
            );

            setResponseStatus(event, 201);

            return result;
        },
        mock: async () => {
            await requireStudentFromCookie(event);

            setResponseStatus(event, 201);

            return {
                success: true,
                data: {
                    rating: {
                        id: randomUUID(),
                        lessonId,
                        instructorId: randomUUID(),
                        rating: parsed.body.rating,
                        comment: parsed.body.comment,
                        createdAt: new Date().toISOString(),
                    },
                },
            };
        },
    });
});
