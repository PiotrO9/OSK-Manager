import { readMultipartFormData } from 'h3';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamProfileAvatarUpload } from '~~/server/utils/auth/authUpstreamBff';
import { mockUserAvatarSetUrl } from '~~/server/utils/auth/mockUserAvatarStore';
import { requireAuthUserIdFromCookie } from '~~/server/utils/auth/requireAuthFromCookie';

const MOCK_AVATAR_PLACEHOLDER =
    'https://placehold.co/256x256/png?text=Avatar+OK';

export default defineEventHandler(async (event) => {
    const parts = await readMultipartFormData(event);
    const filePart = parts?.find((p) => p.name === 'file');

    if (!filePart?.data || filePart.data.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'Brak pliku (pole formularza: file).',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) => {
            const mime = filePart.type || 'application/octet-stream';
            const blob = new Blob([filePart.data], { type: mime });

            return bffUpstreamProfileAvatarUpload(
                event,
                upstreamBase,
                blob,
                filePart.filename || 'upload.jpg',
            );
        },
        mock: async () => {
            const userId = await requireAuthUserIdFromCookie(event);

            mockUserAvatarSetUrl(userId, MOCK_AVATAR_PLACEHOLDER);

            return {
                success: true,
                data: { photoUrl: MOCK_AVATAR_PLACEHOLDER },
            };
        },
    });
});
