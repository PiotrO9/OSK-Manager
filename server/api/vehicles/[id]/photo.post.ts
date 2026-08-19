import { readMultipartFormData } from 'h3';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { bffUpstreamVehiclesUploadPhoto } from '~~/server/utils/vehicles/vehiclesBff';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora pojazdu.',
        invalid: 'Nieprawidłowy identyfikator pojazdu.',
    });

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

            return bffUpstreamVehiclesUploadPhoto(
                event,
                upstreamBase,
                id,
                blob,
                filePart.filename || 'upload.jpg',
            );
        },
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockVehiclesUploadPhoto(id);
        },
    });
});
