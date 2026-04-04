export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 400, message: 'Brak ID szkoły' });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsDelete(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    const deleted = mockDrivingSchoolsDelete(id);

    if (!deleted) {
        throw createError({ statusCode: 404, message: 'Szkoła nie istnieje' });
    }

    return { success: true };
});
