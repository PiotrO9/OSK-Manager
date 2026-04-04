export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 400, message: 'Brak ID szkoły' });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsSetDefault(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    const ok = mockDrivingSchoolsSetDefault(id);

    if (!ok) {
        throw createError({ statusCode: 404, message: 'Szkoła nie istnieje' });
    }

    const row = mockDrivingSchoolsList().find((s) => s.id === id);

    return {
        success: true,
        data: row ?? null,
    };
});
