export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsList(event, upstream);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: mockDrivingSchoolsList(),
    };
});
