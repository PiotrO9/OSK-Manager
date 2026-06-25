import { readMultipartFormData } from 'h3';
import {
    mockVehiclesGetById,
    mockVehiclesSetPhotoUrl,
} from '~~/server/utils/mockVehiclesStore';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';
import { bffUpstreamVehiclesUploadPhoto } from '~~/server/utils/vehiclesBff';

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        const mime = filePart.type || 'application/octet-stream';
        const blob = new Blob([filePart.data], { type: mime });

        return bffUpstreamVehiclesUploadPhoto(
            event,
            upstream,
            id,
            blob,
            filePart.filename || 'upload.jpg',
        );
    }

    await requireManagerFromCookie(event);

    const row = mockVehiclesGetById(id);

    if (!row) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    const demoPhotoUrl = 'https://placehold.co/600x400/png?text=Demo+pojazd';

    mockVehiclesSetPhotoUrl(id, demoPhotoUrl);

    return {
        success: true,
        data: { photoUrl: demoPhotoUrl },
    };
});
