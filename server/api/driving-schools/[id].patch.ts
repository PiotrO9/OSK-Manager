export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 400, message: 'Brak ID szkoły' });
    }

    const body = await readBody(event);

    const nameRaw = body?.name;
    const name =
        typeof nameRaw === 'string' ? nameRaw.trim() : String(nameRaw ?? '');

    if (!name) {
        throw createError({
            statusCode: 400,
            message: 'Pole name jest wymagane',
        });
    }

    const cityRaw = body?.city;
    const addressRaw = body?.address;

    const city =
        typeof cityRaw === 'string'
            ? cityRaw.trim() || null
            : cityRaw == null
              ? null
              : String(cityRaw).trim() || null;

    const address =
        typeof addressRaw === 'string'
            ? addressRaw.trim() || null
            : addressRaw == null
              ? null
              : String(addressRaw).trim() || null;

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsUpdate(event, upstream, id, {
            name,
            city,
            address,
        });
    }

    await requireManagerFromCookie(event);

    const updated = mockDrivingSchoolsUpdate(id, {
        name,
        city,
        address,
    });

    if (!updated) {
        throw createError({ statusCode: 404, message: 'Szkoła nie istnieje' });
    }

    const row = mockDrivingSchoolsList().find((s) => s.id === id);

    return {
        success: true,
        data: row ?? { ...updated, isDefault: false },
    };
});
